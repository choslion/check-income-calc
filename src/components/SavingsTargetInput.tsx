import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { formatKRW, parseAmount, calculate } from '../lib/calc'

export function SavingsTargetInput() {
  const { state, dispatch } = useBudget()
  const [raw, setRaw] = useState(state.savingsTarget > 0 ? formatKRW(state.savingsTarget) : '')

  const calc = calculate(state)
  const maxSavings = Math.max(0, calc.remainingAfterExpenses)
  const isOverBudget = state.salary > 0 && state.savingsTarget > maxSavings

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const parsed = parseAmount(input)
    setRaw(parsed > 0 ? formatKRW(parsed) : input === '' ? '' : formatKRW(parsed))
    dispatch({ type: 'SET_SAVINGS_TARGET', payload: parsed })
  }

  function handleBlur() {
    setRaw(state.savingsTarget > 0 ? formatKRW(state.savingsTarget) : '')
  }

  return (
    <div className="rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--color-on-dark-mute)' }}>
          저축 목표
        </p>
        {state.salary > 0 && (
          <span className="text-xs" style={{ color: 'var(--color-on-dark-mute)' }}>
            최대{' '}
            <span className="font-semibold" style={{ color: 'var(--color-on-dark)' }}>
              {formatKRW(maxSavings)}원
            </span>
          </span>
        )}
      </div>

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
            border: `1px solid ${isOverBudget ? 'var(--color-danger)' : 'var(--color-hairline-dark)'}`,
          }}
          onFocus={(e) => (e.target.style.borderColor = isOverBudget ? 'var(--color-danger)' : 'rgba(255,255,255,0.4)')}
          onBlurCapture={(e) => (e.target.style.borderColor = isOverBudget ? 'var(--color-danger)' : 'var(--color-hairline-dark)')}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--color-on-dark-mute)' }}>
          원
        </span>
      </div>

      {isOverBudget && (
        <p className="text-xs mt-2" style={{ color: 'var(--color-danger)' }}>
          지출 후 잔액보다 목표가 높습니다
        </p>
      )}
    </div>
  )
}
