"""
GraphOps – In-memory graph engine powered by NetworkX.
Loads the mock telemetry JSON and exposes graph-analytic functions:
  • shortest_path (Dijkstra)
  • blast_radius  (1/2/3-hop BFS neighbourhood)
  • node / edge metadata queries
"""

import json
import os
from typing import Optional
import networkx as nx

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "network_graph.json")


class GraphEngine:
    """Wraps a NetworkX DiGraph with cybersecurity-specific analytics."""

    def __init__(self, data_path: str = DATA_PATH):
        self.G = nx.DiGraph()
        self._raw: dict = {}
        self.load(data_path)

    # ── Data loading ────────────────────────────────────────────────────
    def load(self, path: str) -> None:
        with open(path, "r") as f:
            self._raw = json.load(f)

        for node in self._raw["nodes"]:
            self.G.add_node(
                node["id"],
                labels=node["labels"],
                **node["properties"],
            )

        for edge in self._raw["edges"]:
            self.G.add_edge(
                edge["source"],
                edge["target"],
                id=edge["id"],
                type=edge["type"],
                **edge["properties"],
            )

    # ── Queries ─────────────────────────────────────────────────────────
    def get_all_nodes(self) -> list[dict]:
        result = []
        for nid, attrs in self.G.nodes(data=True):
            result.append({"id": nid, **attrs})
        return result

    def get_all_edges(self) -> list[dict]:
        result = []
        for src, tgt, attrs in self.G.edges(data=True):
            result.append({"source": src, "target": tgt, **attrs})
        return result

    def get_node(self, node_id: str) -> Optional[dict]:
        if node_id not in self.G:
            return None
        attrs = dict(self.G.nodes[node_id])
        return {"id": node_id, **attrs}

    # ── Attack Path (Dijkstra shortest path) ────────────────────────────
    def shortest_attack_path(self, source: str, target: str) -> dict:
        """
        Finds the shortest path between two nodes using Dijkstra.
        Edge weight is derived from inverse confidence (lower confidence → higher cost).
        """
        if source not in self.G or target not in self.G:
            return {"path": [], "edges": [], "total_weight": -1, "error": "Node not found"}

        # Build weight: lower confidence = riskier = higher weight
        for u, v, d in self.G.edges(data=True):
            d["weight"] = round(1.0 / max(d.get("confidence", 0.5), 0.01), 4)

        # Use undirected view for reachability (attacks can traverse either direction)
        undirected = self.G.to_undirected()

        try:
            path = nx.dijkstra_path(undirected, source, target, weight="weight")
            total = nx.dijkstra_path_length(undirected, source, target, weight="weight")
        except nx.NetworkXNoPath:
            return {"path": [], "edges": [], "total_weight": -1, "error": "No path exists"}

        # Collect edge metadata along the path
        path_edges = []
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            # Check both directions in the directed graph
            if self.G.has_edge(u, v):
                edata = dict(self.G.edges[u, v])
            elif self.G.has_edge(v, u):
                edata = dict(self.G.edges[v, u])
            else:
                edata = {}
            path_edges.append({"source": u, "target": v, **edata})

        return {
            "path": path,
            "edges": path_edges,
            "total_weight": round(total, 4),
            "hop_count": len(path) - 1,
        }

    # ── Blast Radius (BFS n-hop neighbourhood) ──────────────────────────
    def blast_radius(self, node_id: str, max_hops: int = 3) -> dict:
        """
        Returns nodes grouped by hop distance (1, 2, 3) from a compromised node.
        Uses BFS on an undirected view so lateral movement in any direction is captured.
        """
        if node_id not in self.G:
            return {"error": "Node not found", "hops": {}}

        undirected = self.G.to_undirected()
        lengths = nx.single_source_shortest_path_length(undirected, node_id, cutoff=max_hops)

        hops: dict[int, list[dict]] = {}
        affected_edges = []

        for nid, dist in lengths.items():
            if dist == 0:
                continue  # skip the source node itself
            node_data = {"id": nid, "hop": dist, **dict(self.G.nodes[nid])}
            hops.setdefault(dist, []).append(node_data)

        # Collect all edges within the blast radius subgraph
        affected_node_ids = set(lengths.keys())
        for u, v, d in self.G.edges(data=True):
            if u in affected_node_ids and v in affected_node_ids:
                affected_edges.append({"source": u, "target": v, **d})

        return {
            "origin": node_id,
            "max_hops": max_hops,
            "hops": {str(k): v for k, v in sorted(hops.items())},
            "total_affected": sum(len(v) for v in hops.values()),
            "affected_edges": affected_edges,
        }

    # ── Choke Points ────────────────────────────────────────────────────
    def find_choke_points(self, top_n: int = 10) -> list[dict]:
        """
        Uses betweenness centrality to identify choke-point nodes.
        High centrality = many shortest paths flow through this node = critical bottleneck.
        """
        undirected = self.G.to_undirected()
        centrality = nx.betweenness_centrality(undirected)
        sorted_nodes = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:top_n]

        result = []
        for nid, score in sorted_nodes:
            attrs = dict(self.G.nodes[nid])
            result.append({
                "id": nid,
                "centrality_score": round(score, 6),
                **attrs,
            })
        return result

    # ── Stats ───────────────────────────────────────────────────────────
    def stats(self) -> dict:
        compromised = [n for n, d in self.G.nodes(data=True) if d.get("is_compromised")]
        return {
            "total_nodes": self.G.number_of_nodes(),
            "total_edges": self.G.number_of_edges(),
            "compromised_nodes": compromised,
            "density": round(nx.density(self.G), 6),
        }
