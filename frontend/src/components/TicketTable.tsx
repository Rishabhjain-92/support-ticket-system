import React from 'react';
import { Ticket } from '../types/ticket.js';
import { StatusBadge } from './StatusBadge.js';
import { PriorityBadge } from './PriorityBadge.js';
import { ChevronRight, Mail, Calendar } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({ tickets, onSelectTicket }) => {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Ticket Details
              </th>
              <th scope="col" className="px-4 py-3.5">
                Customer
              </th>
              <th scope="col" className="px-4 py-3.5">
                Priority
              </th>
              <th scope="col" className="px-4 py-3.5">
                Status
              </th>
              <th scope="col" className="px-4 py-3.5">
                Created
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                {/* Title & Preview */}
                <td className="px-5 py-4 max-w-sm">
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {ticket.title}
                  </div>
                  <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {ticket.description}
                  </div>
                </td>

                {/* Customer Email */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Mail size={13} className="text-slate-400" />
                    <span>{ticket.customerEmail}</span>
                  </div>
                </td>

                {/* Priority */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} size="sm" />
                </td>

                {/* Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={ticket.status} size="sm" />
                </td>

                {/* Created Date */}
                <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(ticket.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    View
                    <ChevronRight size={14} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible only on mobile screens) */}
      <div className="divide-y divide-slate-100 md:hidden">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => onSelectTicket(ticket)}
            className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug">
                {ticket.title}
              </h4>
              <StatusBadge status={ticket.status} size="sm" />
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 truncate">
                <Mail size={12} className="text-slate-400 shrink-0" />
                <span className="truncate">{ticket.customerEmail}</span>
              </div>
              <PriorityBadge priority={ticket.priority} size="sm" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-50">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {formatDate(ticket.createdAt)}
              </span>
              <span className="text-indigo-600 font-medium flex items-center">
                Details &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
