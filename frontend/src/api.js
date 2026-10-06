const API_BASE = '/api';

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph: ${res.status}`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/graph/stats`);
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`);
  return res.json();
}

export async function fetchNode(nodeId) {
  const res = await fetch(`${API_BASE}/node/${encodeURIComponent(nodeId)}`);
  if (!res.ok) throw new Error(`Failed to fetch node: ${res.status}`);
  return res.json();
}

export async function fetchAttackPath(source, target) {
  const params = new URLSearchParams({ source, target });
  const res = await fetch(`${API_BASE}/attack-path?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch attack path: ${res.status}`);
  return res.json();
}

export async function fetchBlastRadius(nodeId, hops = 3) {
  const params = new URLSearchParams({ hops: String(hops) });
  const res = await fetch(`${API_BASE}/blast-radius/${encodeURIComponent(nodeId)}?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch blast radius: ${res.status}`);
  return res.json();
}

export async function fetchChokePoints(topN = 10) {
  const params = new URLSearchParams({ top_n: String(topN) });
  const res = await fetch(`${API_BASE}/choke-points?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch choke points: ${res.status}`);
  return res.json();
}
