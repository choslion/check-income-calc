import { useBudget } from '../context/BudgetContext'
import { calculate, formatKRW } from '../lib/calc'

interface SummaryRowProps {
  label: string
  value: number
  highlight?: boolean
  danger?: boolean
  success?: boolean
  percent?: number
  isLast?: boolean
}

function SummaryRow({ label, value, highlight, danger, success, percent, isLast }: SummaryRowProps) {
  const color = danger
    ? 'var(--color-danger)'
    : success
    ? 'var(--color-success)'
    : highlight
    ? 'var(--color-on-dark)'
    : 'var(--color-on-dark)'

  return (
    <div
      className="flex items-center justify-between py-3.5"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-hairline-dark)' }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--color-on-dark-mute)' }}>
          {label}
        </span>
        {percent !== undefined && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: 'var(--color-surface-deep)',
              color: 'var(--color-on-dark-mute)',
            }}
          >
            {percent.toFixed(1)}%
          </span>
        )}
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color, letterSpacing: '-0.2px' }}
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

  const rows = [
    { label: '월 소득', value: state.salary, highlight: true },
    {
      label: '고정 지출',
      value: calc.totalFixed,
      percent: state.salary > 0 ? (calc.totalFixed / state.salary) * 100 : 0,
    },
    {
      label: '변동 지출',
      value: calc.totalVariable,
      percent: state.salary > 0 ? (calc.totalVariable / state.salary) * 100 : 0,
    },
    {
      label: '총 지출',
      value: calc.totalExpenses,
      percent: calc.expenseRatio,
      danger: calc.expenseRatio > 80,
    },
    {
      label: '지출 후 잔액',
      value: calc.remainingAfterExpenses,
      danger: calc.remainingAfterExpenses < 0,
      success: calc.remainingAfterExpenses >= 0,
    },
    ...(state.savingsTarget > 0
      ? [
          { label: '저축 목표', value: state.savingsTarget },
          {
            label: '저축 후 잔액',
            value: calc.remainingAfterSavings,
            danger: calc.remainingAfterSavings < 0,
            success: calc.remainingAfterSavings >= 0,
          },
        ]
      : []),
  ]

  return (
    <div className="rounded-[20px] p-6" style={{ backgroundColor: 'var(--color-surface-elevated)' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--color-on-dark-mute)' }}>
        월간 요약
      </p>
      <div>
        {rows.map((row, i) => (
          <SummaryRow key={row.label} {...row} isLast={i === rows.length - 1} />
        ))}
      </div>
    </div>
  )
}
