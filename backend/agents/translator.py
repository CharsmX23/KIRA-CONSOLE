import os
from cerebras.cloud.sdk import Cerebras
from dotenv import load_dotenv

load_dotenv()

_client = None

def _get_client() -> Cerebras:
    global _client
    if _client is None:
        key = os.environ.get("CEREBRAS_API_KEY")
        if not key:
            raise RuntimeError("[KIRA] CEREBRAS_API_KEY is not set — translator cannot start")
        _client = Cerebras(api_key=key)
    return _client

TRANSLATE_SYSTEM = """
Translate the following English text to formal Karnataka police-context
Kannada (ಕನ್ನಡ). Use official police terminology where applicable.
Return ONLY the translated text, nothing else.
"""


async def to_kannada(text: str) -> str:
    """Translate English AI response to Kannada using Cerebras gpt-oss-120b."""
    try:
        response = _get_client().chat.completions.create(
            model="gpt-oss-120b",
            messages=[
                {"role": "system", "content": TRANSLATE_SYSTEM},
                {"role": "user", "content": f"Translate: {text}"},
            ],
            max_tokens=500,
            temperature=0.1,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return text


async def detect_language(text: str) -> str:
    """Detect if query is Kannada or English via Unicode range check."""
    kannada_chars = sum(1 for c in text if "ಀ" <= c <= "೿")
    return "kn" if kannada_chars > 2 else "en"
