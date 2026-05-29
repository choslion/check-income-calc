import { SectionCard } from './shared'
import type { ResignationReason } from '../types'

const OPTIONS: { value: ResignationReason; label: string; level: 'high' | 'medium' | 'low' | 'caution' }[] = [
  { value: 'recommended',  label: '권고사직',           level: 'high' },
  { value: 'contract_end', label: '계약만료',           level: 'high' },
  { value: 'layoff',       label: '해고',               level: 'high' },
  { value: 'closure',      label: '폐업·도산',          level: 'high' },
  { value: 'wage_delay',   label: '임금체불',           level: 'high' },
  { value: 'long_commute', label: '장거리 통근·이사',   level: 'medium' },
  { value: 'health',       label: '건강 문제',          level: 'medium' },
  { value: 'voluntary',    label: '자발적 퇴사',        level: 'caution' },
  { value: 'misconduct',   label: '중대 귀책사유 해고', level: 'caution' },
  { value: 'unknown',      label: '모름',               level: 'medium' },
]

const LEVEL_COLOR = {
  high:    { bg: 'rgba(66,134,25,0.08)',   border: 'rgba(66,134,25,0.3)',   text: 'var(--success)' },
  medium:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
  low:     { bg: 'var(--surface-input)',  border: 'var(--hairline)',       text: 'var(--on-dark-mute)' },
  caution: { bg: 'rgba(226,59,74,0.08)',  border: 'rgba(226,59,74,0.3)',  text: 'var(--danger)' },
}

interface Props {
  value: ResignationReason
  onChange: (v: ResignationReason) => void
}

export function ResignationReasonSelector({ value, onChange }: Props) {
  return (
    <SectionCard title="퇴사 사유">
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((opt) => {
          const selected = value === opt.value
          const colors = selected ? LEVEL_COLOR[opt.level] : null
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="px-3 py-2.5 text-sm font-medium text-left transition-colors"
              style={{
                backgroundColor: selected ? colors!.bg : 'var(--surface-input)',
                border: `1px solid ${selected ? colors!.border : 'var(--hairline)'}`,
                borderRadius: 'var(--radius-input)',
                color: selected ? colors!.text : 'var(--on-dark-mute)',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {value === 'voluntary' && (
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(226,59,74,0.08)', border: '1px solid rgba(226,59,74,0.3)' }}>
          자발적 퇴사는 원칙적으로 실업급여 수급이 어렵습니다. 단, 불합리한 근무환경 등 인정 가능한 사유가 있을 수 있으므로 고용센터에 확인하세요.
        </p>
      )}
      {value === 'misconduct' && (
        <p className="text-xs mt-3 p-3 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'rgba(226,59,74,0.08)', border: '1px solid rgba(226,59,74,0.3)' }}>
          중대한 귀책사유에 의한 해고는 실업급여 수급이 제한될 수 있습니다.
        </p>
      )}
    </SectionCard>
  )
}
