import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-600 font-body">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          'rounded-pill border border-gray-200 bg-bgsoft px-4 py-2.5 text-sm font-body text-ytext placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          error && 'border-red-400 focus:ring-red-400',
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-body">{error}</span>}
    </div>
  ),
);
Input.displayName = 'Input';
