import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatKRW, parseAmount } from '../lib/calc'

export function SalaryInput() {
  const { state, dispatch } = useBudget()
  const [raw, setRaw] = useState(state.salary > 0 ? formatKRW(state.salary) : '')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const parsed = parseAmount(input)
    setRaw(parsed > 0 ? formatKRW(parsed) : input === '' ? '' : formatKRW(parsed))
    dispatch({ type: 'SET_SALARY', payload: parsed })
  }

  function handleBlur() {
    setRaw(state.salary > 0 ? formatKRW(state.salary) : '')
  }

  function handleReset() {
    setRaw('')
    dispatch({ type: 'SET_SALARY', payload: 0 })
  }

  return (
    <div className="rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--color-on-dark-mute)' }}>
        월 소득
      </p>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          className="w-full rounded-xl px-4 py-3 pr-12 text-right text-lg font-medium outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-surface-deep)',
            color: 'var(--color-on-dark)',
            border: '1px solid var(--color-hairline-dark)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.4)')}
          onBlurCapture={(e) => (e.target.style.borderColor = 'var(--color-hairline-dark)')}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-on-dark-mute)' }}>
          원
        </span>
      </div>

      {state.salary > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--color-on-dark)', letterSpacing: '-0.4px' }}>
            {formatKRW(state.salary)}원
          </span>
          <button
            onClick={handleReset}
            className="text-xs px-4 py-1.5 rounded-full transition-colors"
            style={{
              color: 'var(--color-ink)',
              backgroundColor: 'var(--color-canvas-light)',
            }}
          >
            초기화
          </button>
        </div>
      )}
    </div>
  )
}
