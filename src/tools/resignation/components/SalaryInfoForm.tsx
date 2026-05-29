import { ChevronDown, ChevronUp } from 'lucide-react'
import { Field, AmountField, SectionCard } from './shared'
import type { SalaryInfo } from '../types'

interface Props {
  data: SalaryInfo
  onChange: (field: keyof SalaryInfo, value: string | boolean) => void
}

export function SalaryInfoForm({ data, onChange }: Props) {
  return (
    <SectionCard title="급여 정보">
      <div className="space-y-4">
        <AmountField
          label="최근 3개월 총 급여"
          hint="세전 기본급 + 각종 수당 합계"
          value={data.recentThreeMonthSalary}
          onChange={(v) => onChange('recentThreeMonthSalary', v)}
        />
        <Field
          label="최근 3개월 일수"
          hint="퇴직일 기준으로 역산한 3개월의 실제 달력 일수"
          type="number"
          placeholder="92"
          min={1}
          max={120}
          value={data.recentThreeMonthDays}
          onChange={(e) => onChange('recentThreeMonthDays', e.target.value)}
          unit="일"
        />

        {/* 고급 항목 토글 */}
        <button
          onClick={() => onChange('showAdvanced', !data.showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {data.showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          고급 항목 {data.showAdvanced ? '접기' : '펼치기'} (상여금, 미사용 연차)
        </button>

        {data.showAdvanced && (
          <div className="space-y-4 pt-1">
            <AmountField
              label="연간 상여금"
              hint="퇴직금 산정 시 3개월분 포함됩니다"
              value={data.bonusAmount}
              onChange={(v) => onChange('bonusAmount', v)}
            />
            <Field
              label="미사용 연차 일수"
              hint="퇴사 시 미사용 연차수당으로 반영됩니다"
              type="number"
              placeholder="0"
              min={0}
              value={data.unusedLeaveDays}
              onChange={(e) => onChange('unusedLeaveDays', e.target.value)}
              unit="일"
            />
          </div>
        )}
      </div>
    </SectionCard>
  )
}
