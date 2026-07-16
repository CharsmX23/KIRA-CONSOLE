import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_service_key = os.environ.get("SUPABASE_SERVICE_KEY")
if not _service_key or _service_key == "PASTE_SERVICE_ROLE_KEY_HERE":
    raise RuntimeError(
        "SUPABASE_SERVICE_KEY is not set in backend/.env. "
        "Get it from: Supabase Dashboard → Project Settings → API → service_role key"
    )

supabase: Client = create_client(os.environ["SUPABASE_URL"], _service_key)


def get_suspect(name: str) -> dict | None:
    result = supabase.table("suspects").select("*").ilike("name", f"%{name}%").limit(1).execute()
    return result.data[0] if result.data else None


def get_suspect_cases(name: str) -> list:
    junctions = (
        supabase.table("suspect_cases").select("case_id").eq("suspect_name", name).execute()
    )
    if not junctions.data:
        return []
    case_ids = [j["case_id"] for j in junctions.data]
    result = supabase.table("cases").select("*").in_("case_id", case_ids).execute()
    return result.data or []


def get_suspect_evidence(name: str) -> list:
    junctions = (
        supabase.table("evidence_suspects")
        .select("evidence_title")
        .eq("suspect_name", name)
        .execute()
    )
    if not junctions.data:
        return []
    titles = [j["evidence_title"] for j in junctions.data]
    result = supabase.table("evidence").select("*").in_("title", titles).execute()
    return result.data or []


def get_case(case_id: str) -> dict | None:
    result = (
        supabase.table("cases").select("*").eq("case_id", case_id).limit(1).execute()
    )
    return result.data[0] if result.data else None


def get_gang_members(cluster: str) -> list:
    result = supabase.table("gang_members").select("*").eq("cluster", cluster).execute()
    return result.data or []


def get_hotspots() -> list:
    result = supabase.table("hotspots").select("*").execute()
    return result.data or []


def get_recent_arrests(limit: int = 6) -> list:
    result = (
        supabase.table("arrests")
        .select("*")
        .order("arrest_date", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def get_user_profile(user_id: str) -> dict | None:
    print(f"[KIRA entities] get_user_profile: querying profiles for user_id={user_id!r} (type={type(user_id).__name__})")
    result = supabase.table("profiles").select("id, full_name, role, badge_number").eq("id", user_id).limit(1).execute()
    print(f"[KIRA entities] get_user_profile: raw result.data={result.data!r}")
    return result.data[0] if result.data else None


def get_victims_for_case(case_id: str) -> list:
    result = supabase.table("victims").select("*").eq("case_id", case_id).execute()
    return result.data or []


def get_victim(name: str) -> dict | None:
    result = supabase.table("victims").select("*").ilike("name", f"%{name}%").limit(1).execute()
    return result.data[0] if result.data else None


def get_entity_data(workspace: str, entity: str | None) -> dict | None:
    """Fetch relevant entity data based on workspace type, passed to the responder for context."""
    if not entity:
        return None

    if workspace == "suspect":
        suspect = get_suspect(entity)
        if not suspect:
            return None
        from agents.risk_scoring import get_risk_score_for_suspect
        return {
            "suspect": suspect,
            "cases": get_suspect_cases(entity),
            "evidence": get_suspect_evidence(entity),
            "computed_risk": get_risk_score_for_suspect(entity),
        }

    if workspace == "case":
        from agents.financial_analysis import detect_layering_pattern
        return {
            "case": get_case(entity),
            "victims": get_victims_for_case(entity),
            "financial_analysis": detect_layering_pattern(entity),
        }

    if workspace == "network":
        return {"gang_members": get_gang_members("Cluster K-7")}

    return None
