"""
GraphOps FastAPI Backend
========================
REST API for the cybersecurity graph analytics engine.
Endpoints:
  GET  /api/graph           → full graph (nodes + edges) for frontend rendering
  GET  /api/graph/stats     → graph statistics
  GET  /api/node/{id}       → single node details
  GET  /api/attack-path     → shortest path between two nodes (Dijkstra)
  GET  /api/blast-radius/{id} → n-hop neighbourhood of a compromised node
  GET  /api/choke-points    → top-N betweenness-centrality choke points
"""

import os
from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from graph_engine import GraphEngine

# [11] Disable debug mode in prod (Driven by ENV var)
DEBUG = os.getenv("ENVIRONMENT") != "production"

app = FastAPI(
    title="GraphOps API",
    description="Cybersecurity graph analytics engine for proactive threat hunting",
    version="0.1.0",
    debug=DEBUG, 
)

# [19] Add security headers
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ── CORS (allow React dev server) ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    # [4, 10] Restricting methods to GET since this is a read-only API
    allow_methods=["GET"],
    allow_headers=["*"],
)

# [12] Hide detailed errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # Internally you would log `exc` here
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

# ── Boot the graph engine ───────────────────────────────────────────────
engine = GraphEngine()


# ── Endpoints ───────────────────────────────────────────────────────────

@app.get("/api/graph")
def get_full_graph():
    """Return the complete graph for frontend rendering."""
    return {
        "nodes": engine.get_all_nodes(),
        "edges": engine.get_all_edges(),
    }


@app.get("/api/graph/stats")
def get_stats():
    """Return high-level graph metrics."""
    return engine.stats()


# [13, 14] Validate inputs server-side / Sanitise user content
@app.get("/api/node/{node_id}")
def get_node(node_id: str = Path(..., min_length=1, max_length=200, description="Node ID")):
    """Return details for a single node."""
    node = engine.get_node(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"Node not found")
    return node


@app.get("/api/attack-path")
def get_attack_path(
    source: str = Query(..., min_length=1, max_length=200, description="Source node ID"),
    target: str = Query(..., min_length=1, max_length=200, description="Target node ID"),
):
    """Find shortest attack path between two nodes using Dijkstra."""
    result = engine.shortest_attack_path(source, target)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/api/blast-radius/{node_id}")
def get_blast_radius(
    node_id: str = Path(..., min_length=1, max_length=200),
    hops: int = Query(3, ge=1, le=5, description="Max hop distance"),
):
    """Calculate blast radius (n-hop BFS neighbourhood) of a node."""
    result = engine.blast_radius(node_id, max_hops=hops)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/api/choke-points")
def get_choke_points(
    top_n: int = Query(10, ge=1, le=50, description="Number of top choke points"),
):
    """Identify critical choke-point nodes via betweenness centrality."""
    return engine.find_choke_points(top_n=top_n)


# ── Health ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "engine": "NetworkX", "version": "0.1.0"}
