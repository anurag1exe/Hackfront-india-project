import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2 } from 'lucide-react';
import GraphCanvas from './components/GraphCanvas';
import Sidebar from './components/Sidebar';
import StatsBar from './components/StatsBar';
import { fetchGraph, fetchStats, fetchBlastRadius, fetchAttackPath, fetchChokePoints } from './api';
import { buildCyElements } from './graphStyles';
import './index.css';

export default function App() {
  // ── State ────────────────────────────────────────────────────────────
  const [graphData, setGraphData] = useState(null);
  const [elements, setElements] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [blastData, setBlastData] = useState(null);
  const [attackPath, setAttackPath] = useState(null);
  const [chokePoints, setChokePoints] = useState(null);
  const [analysisMode, setAnalysisMode] = useState(null); // 'blast' | 'path' | 'choke' | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Attack path source/target
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');

  // ── Initial data load ────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [graph, graphStats] = await Promise.all([fetchGraph(), fetchStats()]);
        setGraphData(graph);
        setElements(buildCyElements(graph));
        setStats(graphStats);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load graph:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((nodeData) => {
    setSelectedNode(nodeData);
  }, []);

  const handleBlastRadius = useCallback(async (nodeId) => {
    try {
      const data = await fetchBlastRadius(nodeId, 3);
      setBlastData(data);
      setAttackPath(null);
      setChokePoints(null);
      setAnalysisMode('blast');
    } catch (err) {
      console.error('Blast radius error:', err);
    }
  }, []);

  const handleFindPath = useCallback(async (source, target) => {
    if (!source || !target) return;
    try {
      const data = await fetchAttackPath(source, target);
      setAttackPath(data);
      setBlastData(null);
      setChokePoints(null);
      setAnalysisMode('path');
    } catch (err) {
      console.error('Attack path error:', err);
    }
  }, []);

  const handleChokePoints = useCallback(async () => {
    try {
      const data = await fetchChokePoints(10);
      setChokePoints(data);
      setBlastData(null);
      setAttackPath(null);
      setAnalysisMode('choke');
    } catch (err) {
      console.error('Choke points error:', err);
    }
  }, []);

  const handleClearAnalysis = useCallback(() => {
    setBlastData(null);
    setAttackPath(null);
    setChokePoints(null);
    setAnalysisMode(null);
  }, []);

  // Build node list for dropdowns
  const allNodes = (graphData?.nodes || []).map((n) => ({
    id: n.id,
    label: n.username || n.hostname || n.name || n.ip || n.id,
  }));

  // ── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-graphops-bg grid-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-graphops-accent" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-graphops-text-muted text-sm"
        >
          Initializing threat graph...
        </motion.p>
      </div>
    );
  }

  // ── Error State ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-graphops-bg grid-bg">
        <div className="glass-panel p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-graphops-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-graphops-danger mb-2">Connection Failed</h2>
          <p className="text-graphops-text-muted text-sm mb-4">{error}</p>
          <p className="text-graphops-text-muted text-xs">
            Ensure the backend is running on <code className="text-graphops-info">http://localhost:8000</code>
          </p>
        </div>
      </div>
    );
  }

  // ── Main Layout ──────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-graphops-bg">
      {/* ── Top Bar ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-graphops-border bg-graphops-surface/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-graphops-accent/20 border border-graphops-accent/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-graphops-accent" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-graphops-text tracking-tight leading-none">
              GraphOps
            </h1>
            <p className="text-[10px] text-graphops-text-muted uppercase tracking-[0.2em]">
              Threat Intelligence Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-graphops-accent animate-pulse" />
            <span className="text-[10px] text-graphops-accent font-medium uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <StatsBar stats={stats} />

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 relative grid-bg">
          <GraphCanvas
            elements={elements}
            onNodeClick={handleNodeClick}
            blastData={blastData}
            attackPath={attackPath}
            chokePoints={chokePoints}
            analysisMode={analysisMode}
          />

          {/* Legend overlay */}
          <div className="absolute bottom-4 left-4 glass-panel px-4 py-3">
            <div className="text-[10px] text-graphops-text-muted uppercase tracking-wider mb-2 font-semibold">
              Legend
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {[
                { color: '#38bdf8', label: 'User' },
                { color: '#a78bfa', label: 'Endpoint' },
                { color: '#60a5fa', label: 'Server' },
                { color: '#fbbf24', label: 'Database' },
                { color: '#f97316', label: 'Firewall' },
                { color: '#34d399', label: 'Application' },
                { color: '#ef4444', label: 'External IP' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-graphops-text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          selectedNode={selectedNode}
          blastData={blastData}
          attackPath={attackPath}
          chokePoints={chokePoints}
          analysisMode={analysisMode}
          onBlastRadius={handleBlastRadius}
          onFindPath={handleFindPath}
          onChokePoints={handleChokePoints}
          onClearAnalysis={handleClearAnalysis}
          allNodes={allNodes}
          pathSource={pathSource}
          pathTarget={pathTarget}
          setPathSource={setPathSource}
          setPathTarget={setPathTarget}
        />
      </div>
    </div>
  );
}
