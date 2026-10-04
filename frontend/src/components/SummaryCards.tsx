import React from 'react';
import { SummaryStats, TicketStatus } from '../types/ticket.js';
import { Layers, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
  activeStatusFilter?: string;
  onSelectStatus?: (status: TicketStatus | 'ALL') => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Tickets',
      count: stats.total,
      icon: Layers,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      activeRing: activeStatusFilter === 'ALL' || !activeStatusFilter ? 'ring-2 ring-slate-900 shadow-sm' : '',
      description: 'All system tickets',
    },
    {
      id: 'OPEN',
      title: 'Open',
      count: stats.open,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      activeRing: activeStatusFilter === 'OPEN' ? 'ring-2 ring-blue-600 shadow-sm' : '',
      description: 'Awaiting triage or review',
    },
    {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      activeRing: activeStatusFilter === 'IN_PROGRESS' ? 'ring-2 ring-amber-600 shadow-sm' : '',
      description: 'Actively being resolved',
    },
    {
      id: 'RESOLVED',
      title: 'Resolved',
      count: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      activeRing: activeStatusFilter === 'RESOLVED' ? 'ring-2 ring-emerald-600 shadow-sm' : '',
      description: 'Closed & verified issues',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus && onSelectStatus(card.id as any)}
            className={`bg-white rounded-xl p-5 border border-slate-200/80 text-left transition-all hover:border-slate-300 hover:shadow-xs cursor-pointer ${card.activeRing}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {card.count.toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{card.description}</p>
          </button>
        );
      })}
    </div>
  );
};
