import { motion } from 'framer-motion';
import { Network, AlertTriangle, GitBranch, Activity } from 'lucide-react';

export default function StatsBar({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Nodes',
      value: stats.total_nodes,
      icon: Network,
      color: 'text-graphops-info',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Total Edges',
      value: stats.total_edges,
      icon: GitBranch,
      color: 'text-graphops-purple',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Compromised',
      value: stats.compromised_nodes?.length || 0,
      icon: AlertTriangle,
      color: 'text-graphops-danger',
      bg: 'bg-red-500/10 border-red-500/20',
    },
    {
      label: 'Density',
      value: (stats.density * 100).toFixed(2) + '%',
      icon: Activity,
      color: 'text-graphops-accent',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="flex gap-3 px-5 py-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${card.bg} backdrop-blur-sm`}
        >
          <card.icon className={`w-4 h-4 ${card.color}`} />
          <div>
            <div className={`text-lg font-bold leading-none ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-graphops-text-muted uppercase tracking-wider mt-0.5">
              {card.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
