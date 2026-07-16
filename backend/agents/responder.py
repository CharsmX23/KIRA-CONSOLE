import os
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])

AGENT_SETS = {
    "supervision":  ["Hotspot Agent", "Trend Agent", "Alert Agent"],
    "suspect":      ["Suspect Agent", "Evidence Agent", "Network Agent", "Recommendation Agent"],
    "case":         ["Case Agent", "Evidence Agent", "Officer Agent"],
    "network":      ["Network Agent", "Financial Agent", "Supply Agent"],
    "evidence":     ["Evidence Agent", "Legal Agent", "Forensic Agent"],
    "trend":        ["Trend Agent", "Forecast Agent", "Hotspot Agent"],
    "arrests":      ["Arrest Records Agent"],
    "today_cases":  ["Case Agent", "Assignment Agent"],
}

RESPONDER_SYSTEM = """
You are KIRA — Karnataka Intelligence and Records Analysis Console.
You are the AI Criminal Assistant for Karnataka State Police officers.

PERSONALITY:
- Professional, direct, factual
- Speak like an intelligence analyst, not a chatbot
- Do NOT say "Sure!", "Great!", "Certainly!" — just answer directly
- Always refer to officers respectfully

RESPONSE RULES:
- Keep responses to 2-4 sentences maximum
- Lead with the most important intelligence finding
- Reference specific data points (case IDs, dates, locations, confidence scores)
- If asked about a suspect, always mention their risk level and status
- If switching workspaces, narrate what you are doing ("Pulling up suspect profile...")
- For Kannada queries or when lang=kn, respond in Kannada using formal police terminology

WHAT YOU KNOW:
- Karnataka crime data: suspects, cases, evidence, gang structures, hotspots
- Cluster K-7: led by D. Nair (Kingpin), R. Mehta (Broker), S. Khan (Operative)
- Key suspects: R. Mehta (AT LARGE), D. Nair (WANTED), S. Khan (IN CUSTODY)
- When entity_data contains computed_risk, you will receive an explicit GROUNDING CONSTRAINT below with the exact score — always cite those exact numbers
- Key cases: KS1207 (Money Laundering, Active), KS1189 (Drug Trafficking)
- Evidence: CCTV → Vehicle KA01AB1234 → Phone Records → Bank Transfer → Witness → RM
- Victim records: financial loss reports, witness statements, injury details linked to each case
- Network analysis: Louvain community detection and weighted degree centrality computed from live case/evidence/gang data
- Financial trail: real transaction graph (directed, weighted by amount) — layering pattern detection including multi-hop chains, structuring, cash-out exits
- When entity_data contains financial_analysis, you will receive a GROUNDING CONSTRAINT with exact flagged volume and indicators — cite those exact numbers, never estimate
"""


async def generate_response(
    query: str,
    workspace: str,
    entity: str | None,
    entity_data: dict | None,
    conversation_history: list[dict],
    lang: str,
) -> str:
    """
    Generate AI narration using Cerebras gpt-oss-120b.
    Returns the text response shown in the chat panel.
    """
    entity_context = ""
    if entity_data:
        entity_context = f"\nCurrent entity data: {entity_data}"

    # Strict grounding: when a computed risk score is present, inject its exact
    # values as an explicit constraint the model cannot overlook or rephrase.
    # This prevents the model from hallucinating plausible-sounding scores.
    grounding = ""
    if entity_data and "computed_risk" in entity_data and entity_data["computed_risk"]:
        cr = entity_data["computed_risk"]
        score = cr.get("risk_score")
        tier = cr.get("risk_tier")
        factors = cr.get("contributing_factors", {})
        top_factor = max(factors, key=factors.get) if factors else None
        top_pts = factors.get(top_factor, 0) if top_factor else 0
        grounding = (
            f"\n\n[GROUNDING CONSTRAINT — MANDATORY]"
            f"\nThe suspect's computed risk score is EXACTLY {score}/100 ({tier} tier)."
            f"\nTop contributing factor: {top_factor} ({top_pts} pts)."
            f"\nYou MUST cite these exact numbers when discussing risk."
            f"\nDo NOT estimate, round, or generate a different score. Fabricating numbers"
            f" in an explainable AI system is a critical accuracy failure."
        )

    # Financial grounding: same discipline as computed_risk — inject exact values.
    financial_grounding = ""
    if entity_data and "financial_analysis" in entity_data:
        fa = entity_data["financial_analysis"]
        vol = fa.get("total_transaction_volume", 0)
        flagged_vol = fa.get("flagged_volume", 0)
        flagged_pct = fa.get("flagged_percentage", 0)
        indicators = fa.get("layering_indicators", [])
        if vol > 0:
            vol_lakh = round(vol / 100_000, 2)
            flagged_lakh = round(flagged_vol / 100_000, 2)
            financial_grounding = (
                f"\n\n[FINANCIAL GROUNDING CONSTRAINT — MANDATORY]"
                f"\nCase transaction volume: EXACTLY ₹{vol_lakh}L total, ₹{flagged_lakh}L flagged ({flagged_pct}% suspicious)."
                f"\nLayering indicators detected: {'; '.join(indicators) if indicators else 'none'}."
                f"\nCite these exact figures when discussing this case's financial trail."
                f"\nDo NOT estimate or generate different amounts."
            )

    lang_instruction = ""
    if lang == "kn":
        lang_instruction = "\n\nIMPORTANT: Respond in formal Kannada (ಕನ್ನಡ) only."

    system_content = RESPONDER_SYSTEM + entity_context + grounding + financial_grounding + lang_instruction

    messages = [{"role": "system", "content": system_content}]

    for msg in conversation_history[-6:]:
        role = "user" if msg["role"] == "officer" else "assistant"
        messages.append({"role": role, "content": msg["content"]})

    messages.append({
        "role": "user",
        "content": f"Workspace: {workspace}\nEntity: {entity or 'none'}\nQuery: {query}",
    })

    try:
        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=messages,
            max_tokens=300,
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        error_msg = str(e)
        print(f"[RESPONDER ERROR] {error_msg}")

        if "quota" in error_msg.lower() or "429" in error_msg:
            if lang == "kn":
                return "ವ್ಯವಸ್ಥೆ ತಾತ್ಕಾಲಿಕವಾಗಿ ಸೀಮಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು 60 ಸೆಕೆಂಡ್ ನಂತರ ಪ್ರಯತ್ನಿಸಿ."
            return "Intelligence system temporarily rate-limited. Please try again in 60 seconds."

        if lang == "kn":
            return "ಮಾಹಿತಿ ಹಿಂಪಡೆಯಲಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        return "Intelligence data is being retrieved. Please try again."
