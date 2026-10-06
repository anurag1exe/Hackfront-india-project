import { useRef, useEffect, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import coseBilkent from 'cytoscape-cose-bilkent';
import cytoscape from 'cytoscape';
import { cytoscapeStylesheet, layoutOptions } from '../graphStyles';

// Register the cose-bilkent layout
if (!cytoscape.prototype._coseBilkentRegistered) {
  cytoscape.use(coseBilkent);
  cytoscape.prototype._coseBilkentRegistered = true;
}

export default function GraphCanvas({
  elements,
  onNodeClick,
  blastData,
  attackPath,
  chokePoints,
  analysisMode,
}) {
  const cyRef = useRef(null);

  // ── Clear all highlight classes ──────────────────────────────────────
  const clearHighlights = useCallback(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.elements().removeClass(
      'blast-hop-1 blast-hop-2 blast-hop-3 blast-origin attack-path-node attack-path-edge choke-point dimmed'
    );
  }, []);

  // ── Apply blast radius highlighting ──────────────────────────────────
  useEffect(() => {
    if (!cyRef.current || !blastData || analysisMode !== 'blast') return;
    const cy = cyRef.current;
    clearHighlights();

    // Dim everything first
    cy.elements().addClass('dimmed');

    // Highlight origin
    const origin = cy.getElementById(blastData.origin);
    if (origin.length) {
      origin.removeClass('dimmed').addClass('blast-origin');
    }

    // Highlight hop layers
    const hopClasses = { '1': 'blast-hop-1', '2': 'blast-hop-2', '3': 'blast-hop-3' };
    const affectedIds = new Set([blastData.origin]);

    Object.entries(blastData.hops || {}).forEach(([hop, nodes]) => {
      const cls = hopClasses[hop];
      if (!cls) return;
      nodes.forEach((n) => {
        const el = cy.getElementById(n.id);
        if (el.length) {
          el.removeClass('dimmed').addClass(cls);
          affectedIds.add(n.id);
        }
      });
    });

    // Un-dim edges between affected nodes
    cy.edges().forEach((edge) => {
      const src = edge.data('source');
      const tgt = edge.data('target');
      if (affectedIds.has(src) && affectedIds.has(tgt)) {
        edge.removeClass('dimmed');
      }
    });
  }, [blastData, analysisMode, clearHighlights]);

  // ── Apply attack path highlighting ───────────────────────────────────
  useEffect(() => {
    if (!cyRef.current || !attackPath || analysisMode !== 'path') return;
    const cy = cyRef.current;
    clearHighlights();

    // Dim everything
    cy.elements().addClass('dimmed');

    // Highlight path nodes
    (attackPath.path || []).forEach((nodeId) => {
      const el = cy.getElementById(nodeId);
      if (el.length) {
        el.removeClass('dimmed').addClass('attack-path-node');
      }
    });

    // Highlight path edges
    (attackPath.edges || []).forEach((e) => {
      // Find matching edge in either direction
      cy.edges().forEach((cyEdge) => {
        const src = cyEdge.data('source');
        const tgt = cyEdge.data('target');
        if (
          (src === e.source && tgt === e.target) ||
          (src === e.target && tgt === e.source)
        ) {
          cyEdge.removeClass('dimmed').addClass('attack-path-edge');
        }
      });
    });
  }, [attackPath, analysisMode, clearHighlights]);

  // ── Apply choke point highlighting ───────────────────────────────────
  useEffect(() => {
    if (!cyRef.current || !chokePoints || analysisMode !== 'choke') return;
    const cy = cyRef.current;
    clearHighlights();

    const chokeIds = new Set(chokePoints.map((c) => c.id));
    cy.nodes().forEach((node) => {
      if (chokeIds.has(node.id())) {
        node.addClass('choke-point');
      }
    });
  }, [chokePoints, analysisMode, clearHighlights]);

  // ── Clear highlights when mode is reset ──────────────────────────────
  useEffect(() => {
    if (!analysisMode) {
      clearHighlights();
    }
  }, [analysisMode, clearHighlights]);

  // ── Handle Cytoscape ready ───────────────────────────────────────────
  const handleCyReady = useCallback(
    (cy) => {
      cyRef.current = cy;

      cy.on('tap', 'node', (evt) => {
        const nodeData = evt.target.data();
        onNodeClick?.(nodeData);
      });

      // Run layout
      cy.layout(layoutOptions).run();
    },
    [onNodeClick]
  );

  if (!elements || elements.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-graphops-text-muted text-lg">Loading graph...</div>
      </div>
    );
  }

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={cytoscapeStylesheet}
      layout={layoutOptions}
      cy={handleCyReady}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
      boxSelectionEnabled={false}
      autounselectify={false}
      userZoomingEnabled={true}
      userPanningEnabled={true}
      minZoom={0.3}
      maxZoom={3}
    />
  );
}
