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
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
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
          className="w-full px-4 py-3 pr-12 text-right text-lg font-medium outline-none transition-all"
          style={{
            backgroundColor: 'var(--surface-input)',
            color: 'var(--on-dark)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-input)',
            fontFamily: 'var(--font-number)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
          onBlurCapture={(e) => (e.target.style.borderColor = 'var(--hairline)')}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted)' }}>
          원
        </span>
      </div>

      {state.salary > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-2xl font-semibold"
            style={{ color: 'var(--primary)', letterSpacing: '-0.4px', fontFamily: 'var(--font-number)' }}
          >
            {formatKRW(state.salary)}원
          </span>
          <button
            onClick={handleReset}
            className="text-xs px-4 py-1.5 font-semibold transition-colors"
            style={{
              color: 'var(--on-primary)',
              backgroundColor: 'var(--primary)',
              borderRadius: 'var(--radius-pill)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            초기화
          </button>
        </div>
      )}
    </div>
  )
}
