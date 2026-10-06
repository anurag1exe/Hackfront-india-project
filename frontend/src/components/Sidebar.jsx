import { motion, AnimatePresence } from 'framer-motion';
import { getNodeTheme } from '../graphStyles';
import {
  Shield,
  Crosshair,
  Route,
  X,
  AlertTriangle,
  Activity,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ── Risk badge color ──────────────────────────────────────────────────
function riskColor(score) {
  if (score >= 80) return 'text-graphops-danger';
  if (score >= 50) return 'text-graphops-warning';
  return 'text-graphops-accent';
}

function riskBg(score) {
  if (score >= 80) return 'bg-red-500/20 border-red-500/30';
  if (score >= 50) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-emerald-500/20 border-emerald-500/30';
}

// ── Sidebar Panel ─────────────────────────────────────────────────────
export default function Sidebar({
  selectedNode,
  blastData,
  attackPath,
  chokePoints,
  analysisMode,
  onBlastRadius,
  onFindPath,
  onChokePoints,
  onClearAnalysis,
  allNodes,
  pathSource,
  pathTarget,
  setPathSource,
  setPathTarget,
}) {
  return (
    <div className="w-[380px] flex-shrink-0 h-full overflow-y-auto border-l border-graphops-border bg-graphops-surface/80 backdrop-blur-xl">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-graphops-border">
        <h2 className="text-lg font-bold text-graphops-text flex items-center gap-2">
          <Shield className="w-5 h-5 text-graphops-accent" />
          Analysis Panel
        </h2>
      </div>

      {/* ── Selected Node Info ── */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="m-4 p-4 glass-panel"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getNodeTheme(selectedNode.nodeType).color }}
                />
                <span className="text-xs font-mono text-graphops-text-muted uppercase tracking-wider">
                  {selectedNode.nodeType}
                </span>
              </div>
              {selectedNode.isCompromised && (
                <span className="flex items-center gap-1 text-xs font-semibold text-graphops-danger threat-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  COMPROMISED
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-graphops-text mb-2">
              {selectedNode.label}
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-graphops-text-muted">ID</span>
                <span className="font-mono text-graphops-info text-xs">{selectedNode.id}</span>
              </div>
              {selectedNode.ip && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">IP</span>
                  <span className="font-mono">{selectedNode.ip}</span>
                </div>
              )}
              {selectedNode.os && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">OS</span>
                  <span>{selectedNode.os}</span>
                </div>
              )}
              {selectedNode.role && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Role</span>
                  <span>{selectedNode.role}</span>
                </div>
              )}
              {selectedNode.department && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Dept</span>
                  <span>{selectedNode.department}</span>
                </div>
              )}
              {selectedNode.service && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Service</span>
                  <span className="font-mono text-graphops-purple">{selectedNode.service}</span>
                </div>
              )}
              {selectedNode.engine && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Engine</span>
                  <span className="font-mono">{selectedNode.engine}</span>
                </div>
              )}
              {selectedNode.privilege_level && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Privilege</span>
                  <span
                    className={
                      selectedNode.privilege_level === 'admin'
                        ? 'text-graphops-danger font-semibold'
                        : selectedNode.privilege_level === 'elevated'
                        ? 'text-graphops-warning'
                        : 'text-graphops-text-muted'
                    }
                  >
                    {selectedNode.privilege_level}
                  </span>
                </div>
              )}
              {selectedNode.asset_value && (
                <div className="flex justify-between">
                  <span className="text-graphops-text-muted">Asset Value</span>
                  <span
                    className={
                      selectedNode.asset_value === 'critical'
                        ? 'text-graphops-danger font-bold'
                        : selectedNode.asset_value === 'high'
                        ? 'text-graphops-warning font-semibold'
                        : 'text-graphops-text-muted'
                    }
                  >
                    {selectedNode.asset_value.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Risk Score Bar */}
              {selectedNode.riskScore !== undefined && (
                <div className="pt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-graphops-text-muted">Risk Score</span>
                    <span className={`font-bold ${riskColor(selectedNode.riskScore)}`}>
                      {selectedNode.riskScore}/100
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-graphops-bg overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedNode.riskScore}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        selectedNode.riskScore >= 80
                          ? 'bg-graphops-danger'
                          : selectedNode.riskScore >= 50
                          ? 'bg-graphops-warning'
                          : 'bg-graphops-accent'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Quick Actions ── */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onBlastRadius(selectedNode.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-graphops-danger text-xs font-semibold hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Blast Radius
              </button>
              <button
                onClick={() => setPathSource(selectedNode.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-graphops-accent text-xs font-semibold hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <Route className="w-3.5 h-3.5" />
                Set Source
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Attack Path Finder ── */}
      <div className="m-4 p-4 glass-panel">
        <h3 className="text-sm font-bold text-graphops-text mb-3 flex items-center gap-2">
          <Route className="w-4 h-4 text-graphops-accent" />
          Attack Path Analysis
        </h3>

        <div className="space-y-2">
          <select
            value={pathSource}
            onChange={(e) => setPathSource(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-graphops-bg border border-graphops-border text-graphops-text text-sm focus:border-graphops-accent focus:outline-none transition-colors"
          >
            <option value="">Source node...</option>
            {(allNodes || []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.label || n.username || n.hostname || n.name || n.ip || n.id}
              </option>
            ))}
          </select>

          <div className="flex justify-center">
            <ChevronRight className="w-4 h-4 text-graphops-text-muted rotate-90" />
          </div>

          <select
            value={pathTarget}
            onChange={(e) => setPathTarget(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-graphops-bg border border-graphops-border text-graphops-text text-sm focus:border-graphops-accent focus:outline-none transition-colors"
          >
            <option value="">Target node...</option>
            {(allNodes || []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.label || n.username || n.hostname || n.name || n.ip || n.id}
              </option>
            ))}
          </select>

          <button
            onClick={() => onFindPath(pathSource, pathTarget)}
            disabled={!pathSource || !pathTarget}
            className="w-full mt-2 px-4 py-2.5 rounded-lg bg-graphops-accent/10 border border-graphops-accent/30 text-graphops-accent text-sm font-semibold hover:bg-graphops-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Find Shortest Path
          </button>
        </div>
      </div>

      {/* ── Choke Points ── */}
      <div className="m-4 p-4 glass-panel">
        <h3 className="text-sm font-bold text-graphops-text mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-graphops-purple" />
          Network Choke Points
        </h3>
        <button
          onClick={onChokePoints}
          className="w-full px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-graphops-purple text-sm font-semibold hover:bg-purple-500/20 transition-colors cursor-pointer"
        >
          Identify Choke Points
        </button>
      </div>

      {/* ── Analysis Results ── */}
      <AnimatePresence>
        {analysisMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mb-4"
          >
            <div className="p-4 glass-panel">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-graphops-text">
                  {analysisMode === 'blast'
                    ? 'Blast Radius Results'
                    : analysisMode === 'path'
                    ? 'Attack Path Results'
                    : 'Choke Point Results'}
                </h3>
                <button
                  onClick={onClearAnalysis}
                  className="p-1 rounded hover:bg-graphops-surface-2 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-graphops-text-muted" />
                </button>
              </div>

              {/* Blast Radius Results */}
              {analysisMode === 'blast' && blastData && (
                <div className="space-y-2 text-sm">
                  <div className={`px-3 py-2 rounded-lg border ${riskBg(90)}`}>
                    <span className="font-semibold text-graphops-danger">
                      {blastData.total_affected}
                    </span>{' '}
                    <span className="text-graphops-text-muted">nodes in blast radius</span>
                  </div>
                  {Object.entries(blastData.hops || {}).map(([hop, nodes]) => (
                    <div key={hop} className="pl-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            hop === '1'
                              ? 'bg-graphops-danger'
                              : hop === '2'
                              ? 'bg-graphops-warning'
                              : 'bg-yellow-400'
                          }`}
                        />
                        <span className="text-graphops-text-muted font-medium">
                          Hop {hop} ({nodes.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-4">
                        {nodes.map((n) => (
                          <span
                            key={n.id}
                            className="px-2 py-0.5 rounded text-xs bg-graphops-bg border border-graphops-border font-mono"
                          >
                            {n.username || n.hostname || n.name || n.ip || n.id}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attack Path Results */}
              {analysisMode === 'path' && attackPath && (
                <div className="space-y-2 text-sm">
                  <div className={`px-3 py-2 rounded-lg border ${riskBg(50)}`}>
                    <span className="font-semibold text-graphops-accent">
                      {attackPath.hop_count}
                    </span>{' '}
                    <span className="text-graphops-text-muted">hops</span>
                    <span className="mx-2 text-graphops-border">|</span>
                    <span className="font-semibold text-graphops-warning">
                      {attackPath.total_weight}
                    </span>{' '}
                    <span className="text-graphops-text-muted">weight</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {(attackPath.path || []).map((nodeId, i) => (
                      <span key={nodeId} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/10 border border-emerald-500/30 text-graphops-accent font-mono">
                          {nodeId}
                        </span>
                        {i < attackPath.path.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-graphops-text-muted" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Choke Point Results */}
              {analysisMode === 'choke' && chokePoints && (
                <div className="space-y-1.5 text-sm">
                  {chokePoints.map((cp, i) => (
                    <div
                      key={cp.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-graphops-bg border border-graphops-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-graphops-text-muted text-xs w-4">#{i + 1}</span>
                        <span className="font-mono text-graphops-purple text-xs">
                          {cp.hostname || cp.username || cp.name || cp.ip || cp.id}
                        </span>
                      </div>
                      <span className="text-xs text-graphops-text-muted">
                        {(cp.centrality_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
