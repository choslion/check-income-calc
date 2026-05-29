import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { TOOLS, getToolById } from '../data/tools'
import { getLastUsedTool } from '../utils/recentTools'
import { ToolCard } from '../components/tools/ToolCard'
import { AdBannerSlot } from '../components/ads/AdBannerSlot'
import { formatKRW } from '../lib/calc'
import type { BudgetState } from '../types'

function loadBudgetPreview(): BudgetState | null {
  try {
    const raw = localStorage.getItem('budget-calculator-v1')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.salary !== 'number') return null
    return parsed as BudgetState
  } catch {
    return null
  }
}

function BudgetPreviewCard() {
  const navigate = useNavigate()
  const data = loadBudgetPreview()

  if (!data || data.salary === 0) {
    return (
      <div
        className="p-5 flex flex-col gap-2"
        style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--hairline)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--on-dark-mute)' }}>
          월간 요약
        </p>
        <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          예산 계산기를 시작하면 여기서 월간 요약을 확인할 수 있습니다.
        </p>
        <button
          onClick={() => navigate('/tools/budget')}
          className="mt-1 text-xs font-semibold self-start"
          style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          예산 계산기 시작하기
        </button>
      </div>
    )
  }

  const validFixed = data.fixedExpenses.filter(e => e.name.trim() !== '')
  const validVariable = data.variableExpenses.filter(e => e.name.trim() !== '')
  const totalFixed = validFixed.reduce((s, e) => s + e.amount, 0)
  const totalVariable = validVariable.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = totalFixed + totalVariable
  const remaining = data.salary - totalExpenses
  const expenseRatio = data.salary > 0 ? (totalExpenses / data.salary) * 100 : 0

  const rows = [
    { label: '월 소득', value: data.salary, color: 'var(--primary)' },
    { label: '총 지출', value: totalExpenses, color: expenseRatio > 80 ? 'var(--danger)' : 'var(--on-dark)' },
    { label: '잔여 금액', value: remaining, color: remaining < 0 ? 'var(--danger)' : 'var(--success)' },
  ]

  return (
    <div
      className="p-5 cursor-pointer transition-colors"
      style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--hairline)' }}
      onClick={() => navigate('/tools/budget')}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--on-dark-mute)' }}>
          월간 요약
        </p>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>지출 비율 {expenseRatio.toFixed(1)}%</span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>{row.label}</span>
            <span className="text-sm font-semibold" style={{ color: row.color, fontFamily: 'var(--font-number)' }}>
              {formatKRW(Math.abs(row.value))}원
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentToolCard() {
  const navigate = useNavigate()
  const recent = getLastUsedTool()
  if (!recent) return null

  const tool = getToolById(recent.toolId)
  if (!tool) return null

  const date = new Date(recent.lastUsedAt)
  const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일`

  return (
    <div
      className="p-4 flex items-center justify-between cursor-pointer transition-colors"
      style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--hairline)' }}
      onClick={() => navigate(tool.path)}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
    >
      <div>
        <p className="text-xs mb-0.5" style={{ color: 'var(--muted)' }}>최근 사용 · {dateStr}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--on-dark)' }}>{tool.title}</p>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const featuredTools = TOOLS.filter(t => t.status === 'available').slice(0, 2)
  const comingSoon = TOOLS.filter(t => t.status === 'coming-soon').slice(0, 3)

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* 히어로 */}
        <div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: 'var(--on-dark)', letterSpacing: '-0.8px', lineHeight: 1.1 }}
          >
            생활계산소
          </h1>
          <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
            월급, 지출, 저축처럼 자주 필요한 생활 계산을<br />빠르게 정리해보세요.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate('/tools/budget')}
              className="px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-pill)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              예산 계산기 시작
            </button>
            <button
              onClick={() => navigate('/tools')}
              className="px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--surface-card)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
            >
              전체 도구 보기
            </button>
          </div>
        </div>

        {/* 최근 사용 */}
        <RecentToolCard />

        {/* 월간 요약 */}
        <BudgetPreviewCard />

        {/* 추천 도구 */}
        {featuredTools.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
              추천 도구
            </p>
            <div className="flex flex-col gap-3">
              {featuredTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        {/* 출시 예정 */}
        {comingSoon.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
              출시 예정
            </p>
            <div className="flex flex-col gap-3">
              {comingSoon.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        <AdBannerSlot />
      </div>
    </div>
  )
}
