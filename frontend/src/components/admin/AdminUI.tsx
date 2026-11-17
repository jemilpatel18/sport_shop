import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  suffix,
}: {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-brand-charcoal mt-1">
            {value}
            {suffix && <span className="text-sm font-semibold text-gray-400 ml-1">{suffix}</span>}
          </p>
          {change && <p className="text-xs text-green-600 font-semibold mt-1">{change}</p>}
        </div>
        <div className="w-11 h-11 bg-brand-lime/15 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand-charcoal" />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-charcoal uppercase">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, color = 'gray' }: { children: React.ReactNode; color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', colors[color])}>{children}</span>;
}
