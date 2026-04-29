import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: 'primary' | 'cta';
  icon?: string;
}

export function StatCard({ title, value, subtitle, accent = 'primary', icon }: StatCardProps) {
  return (
    <div className="rounded-card bg-white p-6 shadow-soft flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-400 font-body uppercase tracking-wide">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <span
        className={clsx(
          'text-3xl font-extrabold font-heading',
          accent === 'cta' ? 'text-cta' : 'text-primary',
        )}
      >
        {value}
      </span>
      {subtitle && <span className="text-xs text-gray-400 font-body">{subtitle}</span>}
    </div>
  );
}
