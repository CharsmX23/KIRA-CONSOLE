import os
from supabase import create_client, Client
from dotenv import load_dotenv
from db.catalyst_client import run_zcql_query

load_dotenv()

_supabase: Client | None = None

def _get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not url or not key:
            missing = [k for k, v in {"SUPABASE_URL": url, "SUPABASE_SERVICE_KEY": key}.items() if not v]
            raise RuntimeError(f"[KIRA] Missing env vars: {missing}")
        _supabase = create_client(url, key)
    return _supabase


def get_suspect(name: str) -> dict | None:
    result = _get_supabase().table("suspects").select("*").ilike("name", f"%{name}%").limit(1).execute()
    return result.data[0] if result.data else None


def get_suspect_cases(name: str) -> list:
    junctions = (
        _get_supabase().table("suspect_cases").select("case_id").eq("suspect_name", name).execute()
    )
    if not junctions.data:
        return []
    case_ids = [j["case_id"] for j in junctions.data]
    result = _get_supabase().table("cases").select("*").in_("case_id", case_ids).execute()
    return result.data or []


def get_suspect_evidence(name: str) -> list:
    junctions = (
        _get_supabase().table("evidence_suspects")
        .select("evidence_title")
        .eq("suspect_name", name)
        .execute()
    )
    if not junctions.data:
        return []
    titles = [j["evidence_title"] for j in junctions.data]
    result = _get_supabase().table("evidence").select("*").in_("title", titles).execute()
    return result.data or []


def get_case(case_id: str) -> dict | None:
    result = (
        _get_supabase().table("cases").select("*").eq("case_id", case_id).limit(1).execute()
    )
    return result.data[0] if result.data else None


def get_gang_members(cluster: str) -> list:
    result = _get_supabase().table("gang_members").select("*").eq("cluster", cluster).execute()
    return result.data or []


def get_hotspots() -> list:
    result = _get_supabase().table("hotspots").select("*").execute()
    return result.data or []


def get_recent_arrests(limit: int = 6) -> list:
    result = (
        _get_supabase().table("arrests")
        .select("*")
        .order("arrest_date", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


def get_user_profile(user_id: str) -> dict | None:
    print(f"[KIRA entities] get_user_profile: querying profiles for user_id={user_id!r} (type={type(user_id).__name__})")
    result = _get_supabase().table("profiles").select("id, full_name, role, badge_number").eq("id", user_id).limit(1).execute()
    print(f"[KIRA entities] get_user_profile: raw result.data={result.data!r}")
    return result.data[0] if result.data else None


def get_victims_for_case(case_id: str) -> list:
    result = _get_supabase().table("victims").select("*").eq("case_id", case_id).execute()
    return result.data or []


def get_victim(name: str) -> dict | None:
    result = _get_supabase().table("victims").select("*").ilike("name", f"%{name}%").limit(1).execute()
    return result.data[0] if result.data else None


def get_case_from_catalyst(case_master_id: int, inbound_headers: dict) -> dict | None:
    result = run_zcql_query(
        f"SELECT * FROM CaseMaster WHERE CaseMasterID = {case_master_id}",
        inbound_headers,
    )
    rows = result.get("data", [])
    return rows[0].get("CaseMaster") if rows else None


def get_victims_from_catalyst(case_master_id: int, inbound_headers: dict) -> list:
    result = run_zcql_query(
        f"SELECT * FROM Victim WHERE CaseMasterID = {case_master_id}",
        inbound_headers,
    )
    return [r.get("Victim", r) for r in result.get("data", [])]


def get_accused_from_catalyst(case_master_id: int, inbound_headers: dict) -> list:
    result = run_zcql_query(
        f"SELECT * FROM Accused WHERE CaseMasterID = {case_master_id}",
        inbound_headers,
    )
    return [r.get("Accused", r) for r in result.get("data", [])]


def get_suspect_from_catalyst(name: str, inbound_headers: dict) -> dict | None:
    accused_result = run_zcql_query(
        f"SELECT * FROM Accused WHERE AccusedName LIKE '*{name}*'",
        inbound_headers,
    )
    rows = accused_result.get("data", [])
    if not rows:
        return None
    accused = rows[0].get("Accused", rows[0])

    # ArrestSurrender has no AccusedName column — it links via AccusedMasterID
    accused_master_id = accused.get("AccusedMasterID")
    arrest = {}
    if accused_master_id is not None:
        arrest_result = run_zcql_query(
            f"SELECT * FROM ArrestSurrender WHERE AccusedMasterID = {accused_master_id}",
            inbound_headers,
        )
        arrest_rows = arrest_result.get("data", [])
        arrest = arrest_rows[0].get("ArrestSurrender", arrest_rows[0]) if arrest_rows else {}

    return {**accused, "arrest": arrest}


def get_suspect_cases_from_catalyst(name: str, inbound_headers: dict) -> list:
    accused_result = run_zcql_query(
        f"SELECT * FROM Accused WHERE AccusedName LIKE '*{name}*'",
        inbound_headers,
    )
    rows = accused_result.get("data", [])
    if not rows:
        return []
    case_ids = {
        r.get("Accused", r).get("CaseMasterID")
        for r in rows
        if r.get("Accused", r).get("CaseMasterID") is not None
    }
    if not case_ids:
        return []
    id_list = ",".join(str(cid) for cid in case_ids)
    case_result = run_zcql_query(
        f"SELECT * FROM CaseMaster WHERE CaseMasterID IN ({id_list})",
        inbound_headers,
    )
    return [r.get("CaseMaster", r) for r in case_result.get("data", [])]


def get_entity_data(workspace: str, entity: str | None, inbound_headers: dict | None = None) -> dict | None:
    """Fetch relevant entity data based on workspace type, passed to the responder for context.

    When inbound_headers are supplied (live /api/chat request), suspect data reads from the
    Catalyst Data Store; evidence and computed_risk still come from Supabase (no Catalyst table).
    """
    if not entity:
        return None

    if workspace == "suspect":
        if inbound_headers is not None:
            suspect = get_suspect_from_catalyst(entity, inbound_headers)
            if not suspect:
                return None
            from agents.risk_scoring import get_risk_score_for_suspect
            return {
                "suspect": suspect,
                "cases": get_suspect_cases_from_catalyst(entity, inbound_headers),
                "evidence": get_suspect_evidence(entity),
                "computed_risk": get_risk_score_for_suspect(entity),
            }
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
