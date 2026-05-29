import { useBudget } from '../context/BudgetContext'
import { calculate, formatKRW } from '../lib/calc'

interface SummaryRowProps {
  label: string
  value: number
  highlight?: boolean
  danger?: boolean
  success?: boolean
  isPercent?: boolean
  percent?: number
}

function SummaryRow({ label, value, highlight, danger, success, percent }: SummaryRowProps) {
  const color = danger
    ? 'var(--color-trading-down)'
    : success
    ? 'var(--color-trading-up)'
    : highlight
    ? 'var(--color-primary)'
    : 'var(--color-on-dark)'

  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid var(--color-hairline-on-dark)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {label}
        </span>
        {percent !== undefined && (
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-surface-elevated-dark)',
              color: 'var(--color-muted-strong)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {percent.toFixed(1)}%
          </span>
        )}
      </div>
      <span
        className="font-mono font-semibold text-sm"
        style={{ color, fontFamily: 'var(--font-mono)' }}
      >
        {value < 0 ? '-' : ''}{formatKRW(Math.abs(value))}원
      </span>
    </div>
  )
}

export function BudgetSummary() {
  const { state } = useBudget()
  const calc = calculate(state)

  if (state.salary === 0) return null

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: 'var(--color-surface-card-dark)' }}
    >
      <h2
        className="text-base font-semibold mb-2"
        style={{ color: 'var(--color-on-dark)' }}
      >
        월간 요약
      </h2>

      <div>
        <SummaryRow label="월 소득" value={state.salary} highlight />
        <SummaryRow
          label="고정 지출"
          value={calc.totalFixed}
          percent={state.salary > 0 ? (calc.totalFixed / state.salary) * 100 : 0}
        />
        <SummaryRow
          label="변동 지출"
          value={calc.totalVariable}
          percent={state.salary > 0 ? (calc.totalVariable / state.salary) * 100 : 0}
        />
        <SummaryRow
          label="총 지출"
          value={calc.totalExpenses}
          percent={calc.expenseRatio}
          danger={calc.expenseRatio > 80}
        />
        <SummaryRow
          label="지출 후 잔액"
          value={calc.remainingAfterExpenses}
          danger={calc.remainingAfterExpenses < 0}
          success={calc.remainingAfterExpenses > 0}
        />
        {state.savingsTarget > 0 && (
          <>
            <SummaryRow label="저축 목표" value={state.savingsTarget} />
            <SummaryRow
              label="저축 후 잔액"
              value={calc.remainingAfterSavings}
              danger={calc.remainingAfterSavings < 0}
              success={calc.remainingAfterSavings >= 0}
            />
          </>
        )}
      </div>
    </div>
  )
}
