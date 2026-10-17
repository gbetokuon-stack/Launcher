import React from 'react'

/* ────────────────────── Clean, Minimal UI Primitives ────────────────────── */

/** PageHeader — simple title + subtitle + optional right slot */
export function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="px-6 pt-5 pb-4 flex items-center justify-between gap-4 flex-shrink-0">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <span className="text-[10px] uppercase tracking-widest text-fgfaint font-semibold mb-1 block">{eyebrow}</span>
        )}
        {title && (
          <h1 className="text-base font-bold text-fg leading-tight">{title}</h1>
        )}
        {subtitle && (
          <p className="text-xs text-fgfaint mt-1 max-w-2xl truncate">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}

/** Card — clean flat surface */
export function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-lg bg-bg1 border border-line ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/** Button — variant: primary | ghost | danger | subtle */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  ...rest
}) {
  const sizes = {
    xs: 'text-[10px] px-2 h-6 gap-1 rounded font-medium',
    sm: 'text-xs px-3 h-7 gap-1.5 rounded-md font-medium',
    md: 'text-sm px-4 h-8 gap-2 rounded-md font-medium',
    lg: 'text-sm px-5 h-10 gap-2 rounded-lg font-medium',
  }
  const variants = {
    primary:        'bg-accent hover:bg-accentstrong text-white transition-colors',
    ghost:          'bg-white/5 hover:bg-white/10 text-fg transition-colors',
    subtle:         'bg-transparent hover:bg-white/5 text-fgdim hover:text-fg border border-line transition-colors',
    danger:         'bg-error hover:bg-red-600 text-white transition-colors',
    'danger-soft':  'bg-errorsoft hover:bg-errorsoft/50 text-red-400 border border-error/20 transition-colors',
    info:           'bg-info hover:bg-purple-600 text-white transition-colors',
    'info-soft':    'bg-infosoft hover:bg-infosoft/30 text-purple-400 border border-info/20 transition-colors',
    success:        'bg-success hover:bg-green-600 text-white transition-colors',
    'success-soft': 'bg-successsoft hover:bg-successsoft/30 text-green-400 border border-success/20 transition-colors',
  }
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center select-none cursor-pointer',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      )}
      {children}
    </button>
  )
}

/** Badge — small inline chip */
export function Badge({ tone = 'neutral', mono = false, children }) {
  const tones = {
    neutral:  'bg-bg3 text-fgdim',
    accent:   'bg-accentsoft text-accent',
    warn:     'bg-warnsoft text-warn',
    error:    'bg-errorsoft text-error',
    info:     'bg-infosoft text-info',
    success:  'bg-successsoft text-success',
  }
  return (
    <span className={[
      'inline-flex items-center gap-1 px-2 h-5 rounded text-[10px] select-none border border-line',
      mono ? 'font-mono' : 'uppercase tracking-wider font-semibold',
      tones[tone],
    ].join(' ')}>
      {children}
    </span>
  )
}

/** ProgressBar — simple flat bar */
export function ProgressBar({ value = 0, indeterminate = false, tone = 'accent', className = '' }) {
  const tones = {
    accent: 'bg-accent',
    info:   'bg-info',
    warn:   'bg-warn',
    error:  'bg-error',
  }
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={`relative h-1 rounded-full bg-bg3 overflow-hidden ${className}`}>
      {indeterminate ? (
        <div className="absolute inset-y-0 left-0 w-1/3 progress-indet rounded-full" />
      ) : (
        <div
          className={`h-full transition-[width] duration-200 ease-out rounded-full ${tones[tone]}`}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  )
}

/** Stat — label + value display */
export function Stat({ icon, label, value }) {
  return (
    <div className="bg-bg0 border border-line rounded-md px-3 py-2">
      <div className="text-[10px] text-fgfaint uppercase tracking-wide flex items-center gap-1.5 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs text-fg font-medium mt-1 truncate" title={value}>{value}</div>
    </div>
  )
}

/** Modal — centered overlay */
export function Modal({ children, title, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={[
          'w-full rounded-lg bg-bg1 border border-linestrong shadow-lg flex flex-col max-h-[90vh]',
          wide ? 'max-w-2xl' : 'max-w-md',
        ].join(' ')}
      >
        <div className="px-5 py-3.5 border-b border-line flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-bold text-fg">{title}</h2>
          <button
            onClick={onClose}
            className="text-fgfaint hover:text-fg transition p-1 rounded hover:bg-white/5"
            aria-label="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  )
}

/** Field — form label + control + hint */
export function Field({ label, hint, children }) {
  return (
    <label className="block">
      {label && (
        <div className="text-xs text-fgdim mb-1.5 font-medium">{label}</div>
      )}
      {children}
      {hint && <p className="text-[10px] text-fgfaint mt-1.5">{hint}</p>}
    </label>
  )
}

/** TextInput / Select — clean form controls */
export const inputCls = [
  'w-full px-3 py-2 bg-bg0 border border-line rounded-md text-sm text-fg placeholder:text-fgfaint transition-colors',
  'focus:border-accent/50 focus:outline-none',
].join(' ')

export function TextInput({ className = '', ...rest }) {
  return <input className={`${inputCls} ${className}`} {...rest} />
}

export function Select({ className = '', children, ...rest }) {
  return (
    <div className="relative">
      <select className={`${inputCls} pr-8 appearance-none ${className}`} {...rest}>
        {children}
      </select>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-fgfaint pointer-events-none"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

/** EmptyState — simple empty placeholder */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-bg1 p-10 text-center">
      {icon && (
        <div className="w-12 h-12 mx-auto rounded-lg bg-bg2 border border-line flex items-center justify-center mb-3 text-fgdim">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-fg mb-1">{title}</h3>
      {desc && <p className="text-xs text-fgdim mb-4 max-w-sm mx-auto">{desc}</p>}
      {action}
    </div>
  )
}