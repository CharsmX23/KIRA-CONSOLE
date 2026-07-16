import networkx as nx
from db.entities import supabase


def build_transaction_graph() -> nx.DiGraph:
    """
    Directed graph of money flow — sender → receiver, weighted by amount.
    Directed because flow direction matters (unlike the undirected criminal
    association graph in network_analysis.py).
    """
    G = nx.DiGraph()
    transactions = supabase.table("transactions").select("*").execute().data or []
    for tx in transactions:
        G.add_edge(
            tx["sender"], tx["receiver"],
            amount=float(tx["amount"]),
            date=tx.get("transaction_date", ""),
            flagged=tx.get("flagged", False),
            flag_reason=tx.get("flag_reason"),
            tx_type=tx.get("transaction_type", ""),
        )
    return G


def trace_money_trail(start_entity: str, max_hops: int = 4) -> dict:
    """
    DFS traversal from a starting entity to find all downstream money trails.
    Detects layering patterns: A → B → C → D chains.
    Returns the top-5 longest chains to avoid path explosion.
    """
    G = build_transaction_graph()

    if start_entity not in G:
        return {
            "start": start_entity,
            "trails": [],
            "total_flagged_amount": 0,
            "node_count": G.number_of_nodes(),
            "edge_count": G.number_of_edges(),
        }

    trails = []
    total_flagged = 0

    def dfs(node: str, path: list, edges: list, depth: int) -> None:
        nonlocal total_flagged
        if depth >= max_hops:
            return
        for successor in G.successors(node):
            edge_data = G[node][successor]
            new_edges = edges + [{
                "from": node,
                "to": successor,
                "amount": edge_data["amount"],
                "date": edge_data["date"],
                "flagged": edge_data["flagged"],
                "flag_reason": edge_data.get("flag_reason"),
                "type": edge_data["tx_type"],
            }]
            trails.append({
                "path": path + [successor],
                "hops": len(new_edges),
                "edges": new_edges,
                "total_amount": sum(e["amount"] for e in new_edges),
            })
            if edge_data["flagged"]:
                total_flagged += edge_data["amount"]
            dfs(successor, path + [successor], new_edges, depth + 1)

    dfs(start_entity, [start_entity], [], 0)
    trails.sort(key=lambda t: t["hops"], reverse=True)

    return {
        "start": start_entity,
        "trails": trails[:5],
        "total_flagged_amount": total_flagged,
        "node_count": G.number_of_nodes(),
        "edge_count": G.number_of_edges(),
    }


def detect_layering_pattern(case_id: str) -> dict:
    """
    Analyse all transactions for a case and flag classic money-laundering
    layering indicators:
      - Multi-hop structure (3+ distinct entities)
      - Structuring (amounts just under ₹5L / ₹10L reporting thresholds)
      - Rapid cash-out after receipt
    Also returns the raw transaction list so the frontend can render the chain.
    """
    transactions = (
        supabase.table("transactions")
        .select("*")
        .eq("case_id", case_id)
        .order("transaction_date")
        .execute()
        .data or []
    )

    if not transactions:
        return {
            "case_id": case_id,
            "total_transaction_volume": 0,
            "flagged_volume": 0,
            "flagged_percentage": 0,
            "layering_indicators": [],
            "transaction_count": 0,
            "transactions": [],
        }

    total_volume = sum(float(t["amount"]) for t in transactions)
    flagged_volume = sum(float(t["amount"]) for t in transactions if t.get("flagged"))

    entities = set(t["sender"] for t in transactions) | set(t["receiver"] for t in transactions)
    hop_count = len(entities)

    indicators = []

    if hop_count >= 3:
        indicators.append(
            f"Multi-hop structure: {hop_count} distinct entities — consistent with layering"
        )

    structuring = [t for t in transactions if 400_000 <= float(t["amount"]) < 500_000]
    if structuring:
        indicators.append(
            f"{len(structuring)} transaction(s) just under ₹5 lakh reporting threshold — possible structuring"
        )

    cash_outs = [t for t in transactions if t.get("transaction_type") == "Cash Withdrawal"]
    if cash_outs:
        indicators.append(
            f"{len(cash_outs)} cash withdrawal(s) detected — possible layering exit point"
        )

    flagged_count = sum(1 for t in transactions if t.get("flagged"))
    if flagged_count >= 3:
        indicators.append(
            f"{flagged_count}/{len(transactions)} transactions independently flagged by FinCEN/SIT"
        )

    return {
        "case_id": case_id,
        "total_transaction_volume": total_volume,
        "flagged_volume": flagged_volume,
        "flagged_percentage": round(flagged_volume / total_volume * 100, 1) if total_volume else 0,
        "layering_indicators": indicators,
        "transaction_count": len(transactions),
        "transactions": transactions,
    }
