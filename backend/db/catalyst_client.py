import os
import requests


def run_zcql_query(query: str, inbound_headers: dict) -> dict:
    project_id = inbound_headers.get("x-zc-projectid")
    admin_token = inbound_headers.get("x-zc-admin-cred-token")
    cred_type = inbound_headers.get("x-zc-admin-cred-type", "token")
    console_url = os.environ.get(
        "X_ZOHO_CATALYST_CONSOLE_URL", "https://api.catalyst.zoho.com"
    )
    environment = inbound_headers.get("x-zc-environment", "Development")

    auth = (
        f"Zoho-ticket {admin_token}"
        if cred_type == "ticket"
        else f"Zoho-oauthtoken {admin_token}"
    )

    resp = requests.post(
        f"{console_url}/baas/v1/project/{project_id}/query",
        json={"query": query},
        headers={
            "Authorization": auth,
            "Accept": "application/vnd.catalyst.v2+zcql",
            "Content-Type": "application/json",
            "Environment": environment,
            "CATALYST-ORG": os.environ.get("X_ZOHO_CATALYST_ORG_ID", ""),
        },
        timeout=15,
    )
    if not resp.ok:
        raise ValueError(f"HTTP {resp.status_code} — body: {resp.text[:500]} — url: {resp.url}")
    return resp.json()
