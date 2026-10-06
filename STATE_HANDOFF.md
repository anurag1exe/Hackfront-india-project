# GraphOps State Handoff

## 1. Project Architecture
*   **Frontend:** React, TailwindCSS v4 (dark mode theme), Framer Motion, and `react-cytoscapejs` (for interactive, physics-based graph rendering).
*   **Backend:** Python with FastAPI.
*   **Database/Graph Engine:** `NetworkX` in Python as an in-memory graph engine.

## 2. Completed Work
*   **Backend:**
    *   Mock data generation script (`backend/data/generate_mock_data.py`) creates `network_graph.json` with nodes (Users, Endpoints, Servers, Databases, Firewalls, Apps, ExternalIPs) and edges (AUTHENTICATED_FROM, HAS_ACCESS_TO, CONNECTS_TO, ROUTES_THROUGH, QUERIES, EXPOSES_SERVICE).
    *   `graph_engine.py` wrapper over NetworkX providing Dijkstra shortest path, BFS blast radius, betweenness centrality choke points, and graph statistics.
    *   `main.py` FastAPI server exposing `/api/graph`, `/api/graph/stats`, `/api/node/{id}`, `/api/attack-path`, `/api/blast-radius/{node_id}`, and `/api/choke-points`.
*   **Frontend:**
    *   Vite + React scaffolded.
    *   TailwindCSS v4 dark theme configured in `src/index.css`.
    *   API client (`api.js`) to fetch from FastAPI.
    *   Cytoscape visual theme and layouts configured (`graphStyles.js`).
    *   React components: `GraphCanvas.jsx` (Cytoscape graph), `Sidebar.jsx` (Analysis panel, node info), `StatsBar.jsx` (Top statistics), and `App.jsx` orchestrating the dashboard.
    *   HTML updated with font (Inter) and cybersecurity SEO title.

## 3. Pending Work
*   Test and verify that the UI works exactly as expected when clicking nodes, finding paths, and determining blast radius.
*   Any necessary UI/UX polish.
*   Handle potential graph rendering edge-cases (too large graph, overlap).
*   Fix `App.jsx` compilation issue if there's any.

## 4. Current Bugs/Blockers
*   None known. Backend is currently running. We need to start the frontend and visually inspect.

## 5. File Tree
*   `README.md`
*   `STATE_HANDOFF.md`
*   `backend/`
    *   `requirements.txt`
    *   `main.py`
    *   `graph_engine.py`
    *   `data/`
        *   `generate_mock_data.py`
        *   `network_graph.json`
*   `frontend/`
    *   `package.json`, `vite.config.js`, `index.html`
    *   `src/`
        *   `main.jsx`, `App.jsx`, `index.css`, `api.js`, `graphStyles.js`
        *   `components/`
            *   `GraphCanvas.jsx`, `Sidebar.jsx`, `StatsBar.jsx`
