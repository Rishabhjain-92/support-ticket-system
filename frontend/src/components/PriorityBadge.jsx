import { AlertCircle, AlertTriangle, ArrowDown } from 'lucide-react';

export function PriorityBadge({ priority, size = 'md' }) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;

  switch (priority) {
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 ${sizeClasses}`}
        >
          <AlertCircle size={iconSize} className="text-rose-600" />
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20 ${sizeClasses}`}
        >
          <AlertTriangle size={iconSize} className="text-orange-600" />
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20 ${sizeClasses}`}
        >
          <ArrowDown size={iconSize} className="text-slate-500" />
          Low
        </span>
      );
    default:
      return null;
  }
}
