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
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-surface-card-dark)' }}
    >
      <h2
        className="text-base font-semibold mb-4"
        style={{ color: 'var(--color-on-dark)' }}
      >
        월 소득
      </h2>

      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0"
          className="w-full rounded-md px-4 py-3 pr-14 text-right font-mono text-lg outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-surface-elevated-dark)',
            color: 'var(--color-on-dark)',
            border: '1px solid var(--color-hairline-on-dark)',
            fontFamily: 'var(--font-mono)',
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = 'var(--color-info)')
          }
          onBlurCapture={(e) =>
            (e.target.style.borderColor = 'var(--color-hairline-on-dark)')
          }
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ color: 'var(--color-muted)' }}
        >
          원
        </span>
      </div>

      {state.salary > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <span
            className="font-mono text-2xl font-bold"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
          >
            {formatKRW(state.salary)}원
          </span>
          <button
            onClick={handleReset}
            className="text-xs px-3 py-1 rounded-md transition-colors"
            style={{
              color: 'var(--color-muted)',
              backgroundColor: 'var(--color-surface-elevated-dark)',
            }}
          >
            초기화
          </button>
        </div>
      )}
    </div>
  )
}
