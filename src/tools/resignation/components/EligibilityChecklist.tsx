import { SectionCard } from './shared'
import type { EligibilityChecklist as ChecklistType, EligibilityStatus } from '../types'

const ITEMS: { key: keyof ChecklistType; label: string }[] = [
  { key: 'insuredDays',        label: '최근 18개월 내 고용보험 피보험기간 180일 이상' },
  { key: 'unemployed',         label: '현재 실직 상태이거나 퇴사 예정' },
  { key: 'ableToWork',         label: '취업 의지와 능력이 있음' },
  { key: 'activeJobSearch',    label: '적극적으로 구직 활동을 할 예정' },
  { key: 'notDisqualified',    label: '수급자격 제한 사유가 없음' },
  { key: 'understandsProcess', label: '최종 수급 여부는 고용센터에서 결정됨을 이해함' },
]

const STATUS_CONFIG: Record<EligibilityStatus, { label: string; color: string; bg: string; border: string }> = {
  high:    { label: '수급 가능성 높음',   color: 'var(--success)', bg: 'rgba(66,134,25,0.08)',  border: 'rgba(66,134,25,0.3)' },
  medium:  { label: '검토가 필요합니다',  color: '#f59e0b',        bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)' },
  low:     { label: '수급이 어려울 수 있습니다', color: 'var(--danger)', bg: 'rgba(226,59,74,0.08)', border: 'rgba(226,59,74,0.3)' },
  unknown: { label: '퇴사 사유를 선택해주세요', color: 'var(--on-dark-mute)', bg: 'var(--surface-input)', border: 'var(--hairline)' },
}

interface Props {
  data: ChecklistType
  status: EligibilityStatus
  onChange: (key: keyof ChecklistType, value: boolean) => void
}

export function EligibilityChecklist({ data, status, onChange }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <SectionCard title="실업급여 수급 가능성 체크리스트">
      <div className="space-y-3 mb-4">
        {ITEMS.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer w-fit"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={data[key]}
              onChange={() => onChange(key, !data[key])}
            />
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors"
              style={{
                backgroundColor: data[key] ? 'var(--primary)' : 'var(--surface-input)',
                border: `1px solid ${data[key] ? 'var(--primary)' : 'var(--hairline)'}`,
              }}
            >
              {data[key] && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="var(--on-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm" style={{ color: data[key] ? 'var(--on-dark)' : 'var(--on-dark-mute)' }}>
              {label}
            </span>
          </label>
        ))}
      </div>

      <div
        className="px-4 py-3 rounded-xl"
        style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
      >
        <p className="text-sm font-semibold" style={{ color: config.color }}>{config.label}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--on-dark-mute)' }}>
          최종 수급 여부는 반드시 고용센터에서 확인하세요.
        </p>
      </div>
    </SectionCard>
  )
}
