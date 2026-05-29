import { useBudget } from '../context/BudgetContext'
import { calculate, formatKRW } from '../lib/calc'

const R = 45
const CX = 60
const CY = 60
const STROKE = 16
const circumference = 2 * Math.PI * R

interface Segment {
  label: string
  value: number
  color: string
}

function DonutChart({ segments, total }: { segments: Segment[]; total: number }) {
  if (total <= 0) {
    return (
      <svg viewBox="0 0 120 120" width="120" height="120">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface-input)" strokeWidth={STROKE} />
      </svg>
    )
  }

  let cumulative = 0

  return (
    <svg viewBox="0 0 120 120" width="120" height="120">
      <g transform={`rotate(-90, ${CX}, ${CY})`}>
        {/* 배경 */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--surface-input)" strokeWidth={STROKE} />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null
          const ratio = Math.min(seg.value / total, 1)
          const dashLen = ratio * circumference
          const offset = cumulative
          cumulative += dashLen
          return (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={offset === 0 ? 0 : -offset}
              strokeLinecap="butt"
            />
          )
        })}
      </g>
    </svg>
  )
}

export function BudgetRatioDonutChart() {
  const { state } = useBudget()
  const calc = calculate(state)

  if (state.salary === 0) return null

  const remaining = Math.max(0, calc.remainingAfterExpenses)

  const segments: Segment[] = [
    { label: '고정 지출', value: calc.totalFixed, color: 'var(--danger)' },
    { label: '변동 지출', value: calc.totalVariable, color: '#f59e0b' },
    { label: '잔여/저축', value: remaining, color: 'var(--success)' },
  ]

  const total = calc.totalFixed + calc.totalVariable + remaining

  return (
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
        월간 비율
      </p>

      <div className="flex items-center gap-6">
        <div className="shrink-0">
          <DonutChart segments={segments} total={total} />
        </div>

        <div className="flex-1 space-y-3">
          {segments.map((seg) => {
            const pct = total > 0 ? (seg.value / total) * 100 : 0
            return (
              <div key={seg.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>{seg.label}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-input)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: seg.color }}
                  />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-number)' }}>
                  {formatKRW(seg.value)}원
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
