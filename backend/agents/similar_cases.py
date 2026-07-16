from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from db.entities import supabase

# TF-IDF is the right choice at this data scale (~10-50 cases).
# Stop words are intentionally NOT used: police domain terms like "linked",
# "identified", "recovered" carry signal that generic stop-word lists suppress.
# Case texts are enriched with linked suspect names so that two cases involving
# the same suspect share vocabulary, producing meaningful non-zero similarity.
_vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)


def _build_case_text(case: dict, suspect_names: list[str]) -> str:
    parts = [
        case.get("crime", ""),
        case.get("summary", ""),
        case.get("location", ""),
        " ".join(suspect_names),
    ]
    return " ".join(p for p in parts if p)


def find_similar_cases(case_id: str, top_k: int = 3) -> list:
    """
    Rank all cases by TF-IDF cosine similarity to the target case.
    Case text = crime type + summary + location + linked suspect names.
    Shared suspects between cases is the strongest similarity signal at this
    data scale, since two cases sharing a suspect almost always share context.
    """
    all_cases = supabase.table("cases").select("*").execute().data or []
    if len(all_cases) < 2:
        print(f"[similar_cases] Only {len(all_cases)} case(s) in DB — need at least 2")
        return []

    target_idx = next((i for i, c in enumerate(all_cases) if c["case_id"] == case_id), None)
    if target_idx is None:
        print(f"[similar_cases] case_id={case_id!r} not found in DB")
        return []

    # Fetch all suspect-case links in one query
    junctions = supabase.table("suspect_cases").select("*").execute().data or []
    suspects_by_case: dict[str, list[str]] = {}
    for j in junctions:
        suspects_by_case.setdefault(j["case_id"], []).append(j["suspect_name"])

    texts = [_build_case_text(c, suspects_by_case.get(c["case_id"], [])) for c in all_cases]

    print(f"[similar_cases] vectorizing {len(texts)} cases:")
    for c, t in zip(all_cases, texts):
        print(f"  {c['case_id']}: {t!r}")

    tfidf_matrix = _vectorizer.fit_transform(texts)
    print(f"[similar_cases] TF-IDF matrix shape: {tfidf_matrix.shape}")

    sims = cosine_similarity(tfidf_matrix[target_idx], tfidf_matrix).flatten()
    print(f"[similar_cases] raw similarity scores: {list(zip([c['case_id'] for c in all_cases], [round(float(s), 4) for s in sims]))}")

    results = []
    for i, case in enumerate(all_cases):
        if case["case_id"] == case_id:
            continue
        results.append({
            "case_id": case["case_id"],
            "crime": case.get("crime", ""),
            "status": case.get("status", ""),
            "similarity_score": round(float(sims[i]), 3),
            "summary": case.get("summary", ""),
        })

    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results[:top_k]
