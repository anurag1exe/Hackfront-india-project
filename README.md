# GraphOps 🌐🛡️

**GraphOps** is a powerful cybersecurity graph analytics engine built for proactive threat hunting. It visualizes and analyzes complex network topologies, allowing security teams to identify vulnerabilities, map attack paths, and secure critical infrastructure before an attack occurs.

## 🚀 Features

- **Interactive Topology Visualization:** View your entire network infrastructure (servers, firewalls, load balancers, user endpoints) in an interactive canvas.
- **Blast Radius Analysis:** Select any compromised node to instantly calculate and visualize its n-hop blast radius to understand the potential impact.
- **Attack Path Mapping (Dijkstra):** Find the shortest attack path between any two nodes to discover lateral movement opportunities.
- **Choke Point Identification:** Uses betweenness-centrality to highlight the most critical nodes (choke points) in your network.
- **Real-Time Analytics Dashboard:** Get an overview of network risk score, high-risk assets, and asset distribution.

## 🛠️ Tech Stack

### Backend
- **FastAPI:** High-performance async REST API.
- **NetworkX:** Core graph analytics engine for calculating shortest paths and centrality.
- **Python 3:** Data generation and processing.

### Frontend
- **React (Vite):** Fast, modern frontend framework.
- **Cytoscape.js:** Advanced graph visualization and rendering.
- **Framer Motion:** Smooth UI animations and transitions.
- **Tailwind CSS v4:** Utility-first styling for a sleek, dark-mode cybersecurity aesthetic.
- **Lucide React:** Beautiful iconography.

## 📦 Project Structure

```
graphops/
├── backend/
│   ├── main.py                 # FastAPI application and endpoints
│   ├── graph_engine.py         # NetworkX logic (Blast radius, paths, centrality)
│   ├── requirements.txt        # Python dependencies
│   └── data/
│       └── generate_mock_data.py # Script to generate network_graph.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components (GraphCanvas, Sidebar, etc.)
│   │   ├── api.js              # API integration
│   │   ├── graphStyles.js      # Cytoscape stylesheet
│   │   └── App.jsx             # Main application layout and state
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite configuration
└── README.md
```

## 🚦 Getting Started

### 1. Start the Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt

# Generate the mock graph data
cd data
python generate_mock_data.py
cd ..

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000` (Swagger UI at `/docs`).*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*The UI will be available at `http://localhost:5173`.*

## 🔒 Security

This tool is designed for **defensive** purposes (Blue Teaming / Architecture Analysis). Ensure mock data is used during development to prevent the exposure of real infrastructure topologies.

## 📄 License

MIT License