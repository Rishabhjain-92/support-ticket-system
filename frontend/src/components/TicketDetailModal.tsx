import React, { useState, useEffect } from 'react';
import { X, Calendar, Mail, Check, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Ticket, TicketPriority, TicketStatus } from '../types/ticket.js';
import { StatusBadge } from './StatusBadge.js';
import { PriorityBadge } from './PriorityBadge.js';
import { useUpdateTicketMutation } from '../hooks/useTickets.js';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, isOpen, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('OPEN');
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('MEDIUM');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateTicketMutation();

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
      setSelectedPriority(ticket.priority);
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const hasChanges =
    selectedStatus !== ticket.status || selectedPriority !== ticket.priority;

  const handleUpdate = async () => {
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({
        id: ticket.id,
        payload: {
          status: selectedStatus,
          priority: selectedPriority,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update ticket. Please try again.');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">ID: {ticket.id}</span>
              <StatusBadge status={ticket.status} size="sm" />
              <PriorityBadge priority={ticket.priority} size="sm" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{ticket.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700 text-xs">
            <Check size={16} className="shrink-0 text-emerald-600" />
            <span>Changes saved successfully!</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata pill container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={15} className="text-slate-400 shrink-0" />
              <span>
                Customer: <span className="font-semibold text-slate-900">{ticket.customerEmail}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-slate-400 shrink-0" />
              <span>
                Created: <span className="text-slate-700">{formatDate(ticket.createdAt)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Clock size={15} className="text-slate-400 shrink-0" />
              <span>
                Last Updated: <span className="text-slate-700">{formatDate(ticket.updatedAt)}</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Update Section */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 mb-3">
              Update Status & Priority
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Update Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-hidden transition-all font-medium"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Update Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-hidden transition-all font-medium"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-indigo-100/80">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!hasChanges || updateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
