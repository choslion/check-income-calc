import { Field, SectionCard } from './shared'
import type { EmploymentInfo } from '../types'
import { calcEmploymentDays, formatEmploymentPeriod } from '../utils/calc'

interface Props {
  data: EmploymentInfo
  onChange: (field: keyof EmploymentInfo, value: string) => void
}

export function EmploymentInfoForm({ data, onChange }: Props) {
  const totalDays = calcEmploymentDays(data.hireDate, data.resignationDate)
  const dateError =
    data.hireDate && data.resignationDate && totalDays === null
      ? '퇴사 예정일이 입사일보다 빠릅니다'
      : undefined
  const shortTenure = totalDays !== null && totalDays < 365

  return (
    <SectionCard title="고용 정보">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="입사일"
            type="date"
            value={data.hireDate}
            onChange={(e) => onChange('hireDate', e.target.value)}
          />
          <Field
            label="퇴사 예정일"
            type="date"
            value={data.resignationDate}
            onChange={(e) => onChange('resignationDate', e.target.value)}
            error={dateError}
          />
        </div>

        {totalDays && !dateError && (
          <div
            className="px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: shortTenure ? 'rgba(245,158,11,0.08)' : 'var(--surface-input)',
              color: shortTenure ? '#f59e0b' : 'var(--on-dark-mute)',
              border: `1px solid ${shortTenure ? 'rgba(245,158,11,0.3)' : 'var(--hairline)'}`,
            }}
          >
            총 근무기간: <span className="font-semibold" style={{ fontFamily: 'var(--font-number)' }}>{formatEmploymentPeriod(totalDays)}</span>
            {shortTenure && ' — 1년 미만으로 퇴직금이 발생하지 않을 수 있습니다'}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="출생연도"
            type="number"
            placeholder="예: 1990"
            min={1940}
            max={2010}
            value={data.birthYear}
            onChange={(e) => onChange('birthYear', e.target.value)}
          />
          <Field
            label="총 피보험 기간"
            hint="현 직장 포함 모든 고용보험 가입 기간"
            type="number"
            placeholder="예: 36"
            min={0}
            value={data.insurancePeriodMonths}
            onChange={(e) => onChange('insurancePeriodMonths', e.target.value)}
            unit="개월"
          />
        </div>

        <Field
          label="일 근무시간"
          type="number"
          placeholder="8"
          min={1}
          max={24}
          value={data.dailyWorkingHours}
          onChange={(e) => onChange('dailyWorkingHours', e.target.value)}
          unit="시간"
        />
      </div>
    </SectionCard>
  )
}
