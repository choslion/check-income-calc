import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatKRW, parseAmount, calculate } from '../lib/calc'

export function SavingsTargetInput() {
  const { state, dispatch } = useBudget()
  const [raw, setRaw] = useState(state.savingsTarget > 0 ? formatKRW(state.savingsTarget) : '')

  const calc = calculate(state)
  const maxSavings = Math.max(0, calc.remainingAfterExpenses)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const parsed = parseAmount(input)
    setRaw(parsed > 0 ? formatKRW(parsed) : input === '' ? '' : formatKRW(parsed))
    dispatch({ type: 'SET_SAVINGS_TARGET', payload: parsed })
  }

  function handleBlur() {
    setRaw(state.savingsTarget > 0 ? formatKRW(state.savingsTarget) : '')
  }

  const isOverBudget = state.salary > 0 && state.savingsTarget > maxSavings

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-surface-card-dark)' }}
    >
      <h2
        className="text-base font-semibold mb-1"
        style={{ color: 'var(--color-on-dark)' }}
      >
        저축 목표
      </h2>

      {state.salary > 0 && (
        <p className="text-xs mb-4" style={{ color: 'var(--color-muted)' }}>
          지출 후 가능 최대:{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted-strong)' }}>
            {formatKRW(maxSavings)}원
          </span>
        </p>
      )}

      {!state.salary && <div className="mb-4" />}

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
            border: `1px solid ${isOverBudget ? 'var(--color-trading-down)' : 'var(--color-hairline-on-dark)'}`,
            fontFamily: 'var(--font-mono)',
          }}
          onFocus={(e) =>
            (e.target.style.borderColor = isOverBudget
              ? 'var(--color-trading-down)'
              : 'var(--color-info)')
          }
          onBlurCapture={(e) =>
            (e.target.style.borderColor = isOverBudget
              ? 'var(--color-trading-down)'
              : 'var(--color-hairline-on-dark)')
          }
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ color: 'var(--color-muted)' }}
        >
          원
        </span>
      </div>

      {isOverBudget && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-trading-down)' }}>
          지출 후 잔액보다 목표가 높습니다
        </p>
      )}
    </div>
  )
}
