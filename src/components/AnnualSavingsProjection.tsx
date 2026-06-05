import { useBudget } from '../context/BudgetContext'
import { calculate, formatKRW } from '../lib/calc'

export function AnnualSavingsProjection() {
  const { state } = useBudget()
  const calc = calculate(state)

  if (state.salary === 0) return null

  const monthly = calc.remainingAfterExpenses
  const isNegative = monthly <= 0

  return (
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
        연간 저축 예상
      </p>

      {isNegative ? (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>
          현재 지출이 소득을 초과하여 저축이 불가능합니다.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>월 가용 저축액</span>
            <span className="font-semibold text-sm" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
              {formatKRW(monthly)}원
            </span>
          </div>
          <div
            className="py-3 px-4 rounded-xl"
            style={{ backgroundColor: 'var(--surface-input)' }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--on-dark-mute)' }}>이 속도라면 1년 후</p>
            <p
              className="text-xl font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-number)', letterSpacing: '-0.5px' }}
            >
              {formatKRW(calc.annualSavings)}원
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
