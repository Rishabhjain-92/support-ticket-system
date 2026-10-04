import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createTicketSchema, CreateTicketFormData } from '../validators/ticket.validator.js';
import { useCreateTicketMutation } from '../hooks/useTickets.js';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose }) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      customerEmail: '',
      priority: 'MEDIUM',
      status: 'OPEN',
    },
  });

  const createMutation = useCreateTicketMutation();
  const titleValue = watch('title', '');

  if (!isOpen) return null;

  const onSubmit = async (data: CreateTicketFormData) => {
    setServerError(null);
    try {
      await createMutation.mutateAsync(data);
      reset();
      onClose();
    } catch (err: any) {
      setServerError(err.message || 'Failed to create ticket. Please check your inputs.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Create Support Ticket</h2>
            <p className="text-xs text-slate-500">Add a new customer issue to the dashboard queue</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Ticket Title <span className="text-rose-500">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  titleValue.length > 120 ? 'text-rose-600 font-bold' : 'text-slate-400'
                }`}
              >
                {titleValue.length}/120
              </span>
            </div>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Unable to complete checkout via credit card"
              className={`w-full px-3 py-2 text-sm bg-white rounded-lg border outline-hidden transition-all ${
                errors.title
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          {/* Customer Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              {...register('customerEmail')}
              placeholder="customer@company.com"
              className={`w-full px-3 py-2 text-sm bg-white rounded-lg border outline-hidden transition-all ${
                errors.customerEmail
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
            {errors.customerEmail && (
              <p className="mt-1 text-xs text-rose-600">{errors.customerEmail.message}</p>
            )}
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-hidden transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Initial Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-hidden transition-all"
              >
                <option value="OPEN">Open (Default)</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Provide full reproduction steps or details regarding the customer's request..."
              className={`w-full px-3 py-2 text-sm bg-white rounded-lg border outline-hidden transition-all resize-y ${
                errors.description
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
