import { useBudget } from '../context/BudgetContext'
import { calculate } from '../lib/calc'

interface ScoreConfig {
  label: string
  color: string
  bg: string
  message: string
}

function getScoreConfig(score: number): ScoreConfig {
  if (score >= 90) return {
    label: '매우 좋음',
    color: 'var(--success)',
    bg: 'rgba(66,134,25,0.08)',
    message: '지출 비율이 낮아 저축 여력이 충분합니다.',
  }
  if (score >= 70) return {
    label: '양호',
    color: '#84cc16',
    bg: 'rgba(132,204,22,0.08)',
    message: '지출이 적정 수준입니다. 저축 목표를 높여보세요.',
  }
  if (score >= 40) return {
    label: '주의',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    message: '지출이 소득의 70% 이상입니다. 변동 지출을 점검해보세요.',
  }
  return {
    label: '위험',
    color: 'var(--danger)',
    bg: 'rgba(226,59,74,0.08)',
    message: '지출이 소득의 90% 이상입니다. 즉시 지출 조정이 필요합니다.',
  }
}

export function SpendingHealthScore() {
  const { state } = useBudget()
  const calc = calculate(state)

  if (state.salary === 0) return null

  const { healthScore } = calc
  const config = getScoreConfig(healthScore)
  const arcPercent = healthScore / 100

  // SVG 아크 게이지
  const r = 36
  const cx = 50
  const cy = 50
  const circumference = Math.PI * r // 반원 둘레
  const dashLen = arcPercent * circumference

  return (
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
        지출 건강 점수
      </p>

      <div className="flex items-center gap-5">
        {/* 반원 게이지 */}
        <div className="shrink-0" style={{ width: '100px', height: '56px' }}>
          <svg viewBox="0 0 100 56" width="100" height="56">
            {/* 배경 트랙 */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="var(--surface-input)"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* 점수 아크 */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke={config.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dashLen} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            {/* 점수 텍스트 */}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fontSize="18"
              fontWeight="700"
              fill={config.color}
              fontFamily="var(--font-number)"
            >
              {healthScore}
            </text>
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs px-2 py-0.5 font-semibold"
              style={{ backgroundColor: config.bg, color: config.color, borderRadius: 'var(--radius-pill)' }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--on-dark-mute)' }}>
            {config.message}
          </p>
        </div>
      </div>
    </div>
  )
}
