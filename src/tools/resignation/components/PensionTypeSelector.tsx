import { SectionCard } from './shared'
import type { PensionType } from '../types'

const OPTIONS: { value: PensionType; label: string; desc: string }[] = [
  { value: 'general', label: '일반 퇴직금', desc: '회사가 직접 지급하는 방식' },
  { value: 'db',      label: 'DB형 (확정급여)',  desc: '회사가 운용, 퇴직 시 확정 금액 지급' },
  { value: 'dc',      label: 'DC형 (확정기여)',  desc: '근로자가 운용, 적립금+수익 수령' },
  { value: 'unknown', label: '잘 모름',          desc: '회사에 확인 후 설정 권장' },
]

interface Props {
  value: PensionType
  onChange: (v: PensionType) => void
}

export function PensionTypeSelector({ value, onChange }: Props) {
  return (
    <SectionCard title="퇴직연금 유형">
      <div className="space-y-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="w-full text-left px-4 py-3 transition-colors"
              style={{
                backgroundColor: selected ? 'rgba(252,213,53,0.08)' : 'var(--surface-input)',
                border: `1px solid ${selected ? 'var(--primary)' : 'var(--hairline)'}`,
                borderRadius: 'var(--radius-input)',
                cursor: 'pointer',
              }}
            >
              <p className="text-sm font-semibold" style={{ color: selected ? 'var(--primary)' : 'var(--on-dark)' }}>
                {opt.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--on-dark-mute)' }}>{opt.desc}</p>
            </button>
          )
        })}
      </div>

      {value === 'dc' && (
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
          DC형은 실제 수령액이 운용 성과에 따라 달라집니다. 아래 추정액은 참고용이며 실제와 다를 수 있습니다.
        </p>
      )}
    </SectionCard>
  )
}
