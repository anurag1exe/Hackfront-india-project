/* Cytoscape style map for GraphOps
   Maps node types to colors, shapes and edge styles for a cybersecurity theme */

// ── Node type → visual config ─────────────────────────────────────────
const NODE_THEME = {
  User:        { color: '#38bdf8', shape: 'ellipse',       icon: '👤' },
  Endpoint:    { color: '#a78bfa', shape: 'round-rectangle', icon: '💻' },
  Server:      { color: '#60a5fa', shape: 'hexagon',       icon: '🖥' },
  Database:    { color: '#fbbf24', shape: 'barrel',        icon: '🗄' },
  Firewall:    { color: '#f97316', shape: 'diamond',       icon: '🛡' },
  Application: { color: '#34d399', shape: 'round-rectangle', icon: '📱' },
  ExternalIP:  { color: '#ef4444', shape: 'triangle',      icon: '🌐' },
};

// ── Edge type → visual config ─────────────────────────────────────────
const EDGE_THEME = {
  AUTHENTICATED_FROM: { color: '#38bdf8', style: 'solid',  width: 2 },
  HAS_ACCESS_TO:      { color: '#a78bfa', style: 'solid',  width: 2 },
  CONNECTS_TO:        { color: '#64748b', style: 'solid',  width: 1.5 },
  ROUTES_THROUGH:     { color: '#f97316', style: 'dashed', width: 2 },
  QUERIES:            { color: '#fbbf24', style: 'solid',  width: 2 },
  EXPOSES_SERVICE:    { color: '#ef4444', style: 'dashed', width: 2 },
};

export function getNodeTheme(label) {
  return NODE_THEME[label] || { color: '#64748b', shape: 'ellipse', icon: '?' };
}

export function getEdgeTheme(type) {
  return EDGE_THEME[type] || { color: '#334155', style: 'solid', width: 1 };
}

// ── Build Cytoscape elements from API response ────────────────────────
export function buildCyElements(graphData) {
  const nodes = (graphData.nodes || []).map((n) => {
    const label = (n.labels || [])[0] || 'Unknown';
    const theme = getNodeTheme(label);
    const displayName =
      n.username || n.hostname || n.name || n.ip || n.id;

    return {
      data: {
        id: n.id,
        label: displayName,
        nodeType: label,
        bgColor: theme.color,
        shape: theme.shape,
        isCompromised: n.is_compromised || false,
        riskScore: n.risk_score || 0,
        assetValue: n.asset_value || 'unknown',
        ...n,
      },
    };
  });

  const edges = (graphData.edges || []).map((e, i) => {
    const theme = getEdgeTheme(e.type);
    return {
      data: {
        id: e.id || `edge_${i}`,
        source: e.source,
        target: e.target,
        edgeType: e.type,
        lineColor: theme.color,
        lineStyle: theme.style,
        lineWidth: theme.width,
        ...e,
      },
    };
  });

  return [...nodes, ...edges];
}

// ── Cytoscape stylesheet ──────────────────────────────────────────────
export const cytoscapeStylesheet = [
  // ── Base node ──
  {
    selector: 'node',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 8,
      'font-size': '11px',
      'font-family': 'Inter, system-ui, sans-serif',
      'font-weight': 500,
      color: '#cbd5e1',
      'text-outline-color': '#0a0e17',
      'text-outline-width': 2,
      'background-color': 'data(bgColor)',
      shape: 'data(shape)',
      width: 40,
      height: 40,
      'border-width': 2,
      'border-color': 'data(bgColor)',
      'border-opacity': 0.5,
      'overlay-opacity': 0,
      'transition-property': 'background-color, border-color, border-width, width, height, opacity',
      'transition-duration': '0.3s',
    },
  },

  // ── Compromised node ──
  {
    selector: 'node[?isCompromised]',
    style: {
      'border-color': '#ff3b5c',
      'border-width': 3,
      'background-color': '#ff3b5c',
      width: 48,
      height: 48,
    },
  },

  // ── High risk node ──
  {
    selector: 'node[riskScore >= 80]',
    style: {
      'border-color': '#ffb020',
      'border-width': 3,
    },
  },

  // ── Hover state ──
  {
    selector: 'node:active',
    style: {
      'overlay-opacity': 0.15,
      'overlay-color': '#38bdf8',
    },
  },

  // ── Selected node ──
  {
    selector: 'node:selected',
    style: {
      'border-color': '#00ff88',
      'border-width': 4,
      width: 52,
      height: 52,
    },
  },

  // ── Base edge ──
  {
    selector: 'edge',
    style: {
      width: 'data(lineWidth)',
      'line-color': 'data(lineColor)',
      'line-style': 'data(lineStyle)',
      'target-arrow-color': 'data(lineColor)',
      'target-arrow-shape': 'triangle',
      'arrow-scale': 0.8,
      'curve-style': 'bezier',
      opacity: 0.6,
      'transition-property': 'line-color, opacity, width',
      'transition-duration': '0.3s',
    },
  },

  // ── Edge hover ──
  {
    selector: 'edge:active',
    style: {
      opacity: 1,
    },
  },

  // ── Blast radius highlights ──
  {
    selector: '.blast-hop-1',
    style: {
      'border-color': '#ff3b5c',
      'border-width': 4,
      'background-color': '#ff3b5c',
      opacity: 1,
    },
  },
  {
    selector: '.blast-hop-2',
    style: {
      'border-color': '#ffb020',
      'border-width': 3,
      'background-color': '#ffb020',
      opacity: 0.9,
    },
  },
  {
    selector: '.blast-hop-3',
    style: {
      'border-color': '#fbbf24',
      'border-width': 2,
      'background-color': '#fbbf24',
      opacity: 0.75,
    },
  },

  // ── Attack path highlight ──
  {
    selector: '.attack-path-node',
    style: {
      'border-color': '#00ff88',
      'border-width': 4,
      'background-color': '#00ff88',
      width: 50,
      height: 50,
    },
  },
  {
    selector: '.attack-path-edge',
    style: {
      'line-color': '#00ff88',
      'target-arrow-color': '#00ff88',
      width: 4,
      opacity: 1,
    },
  },

  // ── Dimmed (nodes not in current selection/analysis) ──
  {
    selector: '.dimmed',
    style: {
      opacity: 0.15,
    },
  },

  // ── Origin node for blast radius ──
  {
    selector: '.blast-origin',
    style: {
      'border-color': '#ff3b5c',
      'border-width': 5,
      width: 56,
      height: 56,
      'background-color': '#ff3b5c',
    },
  },

  // ── Choke point highlight ──
  {
    selector: '.choke-point',
    style: {
      'border-color': '#a78bfa',
      'border-width': 4,
      width: 52,
      height: 52,
    },
  },
];

// ── Cytoscape layout options ──────────────────────────────────────────
export const layoutOptions = {
  name: 'cose-bilkent',
  animate: true,
  animationDuration: 800,
  randomize: true,
  idealEdgeLength: 120,
  nodeRepulsion: 8000,
  gravity: 0.25,
  gravityRange: 3.8,
  nestingFactor: 0.1,
  numIter: 2500,
  tile: true,
  tilingPaddingVertical: 20,
  tilingPaddingHorizontal: 20,
  nodeDimensionsIncludeLabels: true,
};
