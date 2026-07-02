import json
import os
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

client = Cerebras(api_key=os.environ["CEREBRAS_API_KEY"])

ROUTER_SYSTEM = """
You are a police query classifier for KIRA Console, a Karnataka Police
intelligence platform. Classify the officer's query and return ONLY valid
JSON with no explanation, no markdown, no backticks.

WORKSPACE OPTIONS:
- supervision  : monitoring the city, KPIs, hotspots, alerts, trends
- suspect      : queries about a specific person / criminal
- case         : queries about a specific case ID (format: KS####)
- network      : queries about gangs, clusters, criminal organizations
- evidence     : queries about evidence, why evidence failed, forensics
- trend        : queries about crime patterns, predictions, forecasts
- arrests      : queries about recent arrests
- today_cases  : queries about cases filed today / active cases today
- back         : officer wants to go back to supervision

ACTION OPTIONS:
- navigate     : switch to a different workspace
- stay         : stay in current workspace, just answer the question
- back         : return to supervision mode

RETURN FORMAT (strict JSON, nothing else):
{
  "workspace": "suspect",
  "action": "navigate",
  "entity": "R. Mehta",
  "confidence": 0.95,
  "language": "en"
}

RULES:
- If the query is a follow-up about the CURRENT entity (e.g. "show his cases",
  "what about his gang"), keep the same entity from context
- If no specific entity is mentioned and action is navigate, set entity to null
- If query is in Kannada, set language to "kn"
- For greetings or unclear queries, return workspace "supervision", action "stay"
"""


async def classify_intent(
    query: str,
    current_workspace: str,
    current_entity: str | None,
    recent_context: str,
) -> dict:
    """
    Classify intent using Cerebras Llama 3.3 70B.
    Returns workspace routing dict in <200ms.
    """
    user_message = f"""
Current workspace: {current_workspace}
Current entity being viewed: {current_entity or 'none'}
Recent conversation: {recent_context}
Officer query: {query}

Classify this query.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {"role": "system", "content": ROUTER_SYSTEM},
                {"role": "user", "content": user_message},
            ],
            max_tokens=200,
            temperature=0.05,
        )
        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except (json.JSONDecodeError, Exception):
        return {
            "workspace": current_workspace,
            "action": "stay",
            "entity": current_entity,
            "confidence": 0.5,
            "language": "en",
        }
