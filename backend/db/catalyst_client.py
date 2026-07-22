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
            "X-Catalyst-Environment": environment,
            "X-CATALYST-USER": "admin",
        },
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()
