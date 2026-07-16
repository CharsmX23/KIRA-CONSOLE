import networkx as nx
import community as community_louvain
from db.entities import supabase


def build_criminal_graph() -> nx.Graph:
    G = nx.Graph()

    suspects = supabase.table("suspects").select("name").execute().data or []
    for s in suspects:
        G.add_node(s["name"])

    # Edges from shared cases
    suspect_cases = supabase.table("suspect_cases").select("*").execute().data or []
    case_to_suspects: dict[str, list] = {}
    for row in suspect_cases:
        case_to_suspects.setdefault(row["case_id"], []).append(row["suspect_name"])

    for names in case_to_suspects.values():
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                if G.has_edge(names[i], names[j]):
                    G[names[i]][names[j]]["weight"] += 1
                else:
                    G.add_edge(names[i], names[j], weight=1)

    # Edges from shared evidence
    evidence_suspects = supabase.table("evidence_suspects").select("*").execute().data or []
    evidence_to_suspects: dict[str, list] = {}
    for row in evidence_suspects:
        evidence_to_suspects.setdefault(row["evidence_title"], []).append(row["suspect_name"])

    for names in evidence_to_suspects.values():
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                if G.has_edge(names[i], names[j]):
                    G[names[i]][names[j]]["weight"] += 1
                else:
                    G.add_edge(names[i], names[j], weight=1)

    # Edges from gang co-membership (weighted higher)
    gang_members = supabase.table("gang_members").select("*").execute().data or []
    cluster_to_names: dict[str, list] = {}
    for m in gang_members:
        cluster_to_names.setdefault(m["cluster"], []).append(m["name"])

    for names in cluster_to_names.values():
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                if G.has_edge(names[i], names[j]):
                    G[names[i]][names[j]]["weight"] += 2
                else:
                    G.add_edge(names[i], names[j], weight=2)

    return G


def detect_communities() -> dict:
    G = build_criminal_graph()

    if G.number_of_nodes() == 0:
        return {"clusters": [], "modularity": 0, "node_count": 0, "edge_count": 0}

    partition = community_louvain.best_partition(G, weight="weight")
    modularity = community_louvain.modularity(partition, G, weight="weight")

    clusters: dict[int, list] = {}
    for node, cluster_id in partition.items():
        clusters.setdefault(cluster_id, []).append(node)

    cluster_list = [
        {"cluster_id": f"K-{cid}", "members": sorted(members), "size": len(members)}
        for cid, members in sorted(clusters.items(), key=lambda x: -len(x[1]))
    ]

    return {
        "clusters": cluster_list,
        "modularity": round(modularity, 3),
        "node_count": G.number_of_nodes(),
        "edge_count": G.number_of_edges(),
    }


def get_centrality_scores() -> dict[str, float]:
    """
    Weighted degree centrality: sum of edge weights per node, normalized to [0, 1].

    Betweenness centrality was discarded because networkx treats edge weights as
    distances (higher weight = farther apart), which inverts the semantics for a
    criminal network where higher weight means STRONGER connection. On a dense
    small graph it also produces near-zero values for all nodes.

    Weighted degree correctly measures total connection strength: a suspect who
    appears in more shared cases and evidence items scores higher.
    """
    G = build_criminal_graph()
    if G.number_of_nodes() == 0:
        return {}

    weighted_degrees = dict(G.degree(weight="weight"))
    max_degree = max(weighted_degrees.values()) if weighted_degrees else 1

    print(f"[network_analysis] weighted_degrees: {weighted_degrees}")
    print(f"[network_analysis] max_degree: {max_degree}")

    centrality = {
        name: round(deg / max_degree, 3)
        for name, deg in weighted_degrees.items()
    }
    return dict(sorted(centrality.items(), key=lambda x: -x[1]))
