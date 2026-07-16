from db.entities import supabase


def compute_risk_score(suspect: dict, network_centrality: float = 0.0) -> dict:
    """
    Weighted actuarial risk scoring — transparent, explainable formula.

    Weights (must sum to 1.0):
      prior_arrests         0.25  — more priors = higher recidivism risk
      associates_count      0.15  — larger criminal network = higher risk
      network_centrality    0.30  — betweenness centrality in gang graph
      evidence_confidence   0.20  — strength of existing evidence
      status_at_large       0.10  — currently free vs detained
    """
    prior_arrests = suspect.get("arrests", 0)
    associates = suspect.get("associates", 0)
    confidence = suspect.get("confidence", 50) / 100.0
    status = suspect.get("status", "")

    arrests_score = min(prior_arrests / 5.0, 1.0)
    associates_score = min(associates / 15.0, 1.0)
    centrality_score = min(network_centrality, 1.0)
    status_score = 1.0 if status == "AT LARGE" else (0.3 if status == "WANTED" else 0.0)

    weighted_score = (
        arrests_score * 0.25
        + associates_score * 0.15
        + centrality_score * 0.30
        + confidence * 0.20
        + status_score * 0.10
    )

    risk_score_100 = round(weighted_score * 100, 1)

    if risk_score_100 >= 70:
        tier = "HIGH"
    elif risk_score_100 >= 40:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    return {
        "risk_score": risk_score_100,
        "risk_tier": tier,
        "contributing_factors": {
            "prior_arrests": round(arrests_score * 0.25 * 100, 1),
            "network_size": round(associates_score * 0.15 * 100, 1),
            "network_centrality": round(centrality_score * 0.30 * 100, 1),
            "evidence_confidence": round(confidence * 0.20 * 100, 1),
            "status": round(status_score * 0.10 * 100, 1),
        },
    }


def get_risk_score_for_suspect(name: str) -> dict:
    from agents.network_analysis import get_centrality_scores

    result = (
        supabase.table("suspects")
        .select("*")
        .ilike("name", f"%{name}%")
        .limit(1)
        .execute()
    )
    if not result.data:
        print(f"[risk_scoring] No suspect found for name={name!r}")
        return {}
    suspect = result.data[0]

    centrality_scores = get_centrality_scores()
    lookup_key = suspect["name"]
    centrality = centrality_scores.get(lookup_key, 0.0)

    print(f"[risk_scoring] lookup_key={lookup_key!r}")
    print(f"[risk_scoring] centrality_scores keys={list(centrality_scores.keys())}")
    print(f"[risk_scoring] centrality for {lookup_key!r}={centrality}")

    result_score = compute_risk_score(suspect, centrality)
    print(f"[risk_scoring] final score={result_score['risk_score']} tier={result_score['risk_tier']}")
    return result_score
