import { clsx } from 'clsx';

type Variant = 'primary' | 'cta' | 'success' | 'warning' | 'danger' | 'neutral';

const variants: Record<Variant, string> = {
  primary: 'bg-bgsoft text-primary',
  cta:     'bg-cta/10 text-cta',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger:  'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-600',
};

export function Badge({
  label,
  variant = 'neutral',
  className,
}: {
  label: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold font-body',
        variants[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
