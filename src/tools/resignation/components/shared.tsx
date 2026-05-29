import type { InputHTMLAttributes } from 'react'
import { formatKRW } from '../../../lib/calc'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  unit?: string
}

export function Field({ label, hint, error, unit, ...props }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
        {label}
      </label>
      {hint && <p className="text-xs mb-1.5" style={{ color: 'var(--muted)' }}>{hint}</p>}
      <div className="relative">
        <input
          className="w-full px-3 py-2.5 text-sm font-medium outline-none transition-all"
          style={{
            backgroundColor: 'var(--surface-input)',
            color: 'var(--on-dark)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--hairline)'}`,
            borderRadius: 'var(--radius-input)',
            paddingRight: unit ? '2.5rem' : undefined,
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
          onBlurCapture={(e) => (e.target.style.borderColor = error ? 'var(--danger)' : 'var(--hairline)')}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>
            {unit}
          </span>
        )}
      </div>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export function ResultRow({
  label,
  value,
  color,
  mono = true,
  isLast = false,
}: {
  label: string
  value: string
  color?: string
  mono?: boolean
  isLast?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--hairline)' }}
    >
      <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>{label}</span>
      <span
        className="text-sm font-semibold"
        style={{ color: color ?? 'var(--on-dark)', fontFamily: mono ? 'var(--font-number)' : undefined }}
      >
        {value}
      </span>
    </div>
  )
}

export function AmountField({
  label,
  hint,
  value,
  onChange,
  unit = '원',
  error,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  unit?: string
  error?: string
}) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const num = parseInt(raw, 10)
    onChange(isNaN(num) ? '' : formatKRW(num))
  }

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      unit={unit}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
    />
  )
}
