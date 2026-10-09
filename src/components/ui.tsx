import type { ReactNode } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-2xl shadow-2xl w-full ${maxWidth} animate-scale-in max-h-[90vh] overflow-y-auto`} style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10 rounded-t-2xl" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const baseStyle: React.CSSProperties = { borderRadius: '0.5rem', fontWeight: 500, transition: 'all 0.15s' };
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--c-600)', color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    secondary: { backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' },
    danger: { backgroundColor: '#ef4444', color: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    ghost: { color: 'var(--text-secondary)' },
    outline: { border: '1px solid var(--border)', color: 'var(--text-primary)' },
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{ ...baseStyle, ...variantStyles[variant] }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--c-700)';
        else if (variant === 'danger') e.currentTarget.style.backgroundColor = '#dc2626';
        else if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--c-50)';
        else if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        else if (variant === 'outline') e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--c-600)';
        else if (variant === 'danger') e.currentTarget.style.backgroundColor = '#ef4444';
        else if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
        else if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'transparent';
        else if (variant === 'outline') e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
}: {
  label?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all focus:outline-none"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all focus:outline-none"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-500)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: 'green' | 'amber' | 'red' | 'slate' | 'blue' }) {
  const colors: Record<string, React.CSSProperties> = {
    green: { backgroundColor: 'var(--c-50)', color: 'var(--c-700)' },
    amber: { backgroundColor: '#fef3c7', color: '#b45309' },
    red: { backgroundColor: '#fee2e2', color: '#b91c1c' },
    slate: { backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' },
    blue: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={colors[color]}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4" style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      <h3 className="text-base font-semibold" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
