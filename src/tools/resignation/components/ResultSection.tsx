import { Download } from 'lucide-react'
import { SectionCard, ResultRow, AmountField } from './shared'
import { formatKRW } from '../../../lib/calc'
import { getPolicyForResignation } from '../utils/policyLoader'
import type { ResignationState } from '../types'
import {
  calcEmploymentDays,
  calcAge,
  calcAverageDailyWage,
  calcSeverancePay,
  calcDailyUnemploymentBenefit,
  calcBenefitDurationDays,
  calcTotalUnemploymentBenefit,
  calcSurvivalMonths,
  formatEmploymentPeriod,
  safeInt,
} from '../utils/calc'

interface Props {
  state: ResignationState
  onSurvivalChange: (field: 'currentSavings' | 'monthlyLivingExpenses', value: string) => void
}

function loadBudgetExpenses(): number | null {
  try {
    const raw = localStorage.getItem('budget-calculator-v1')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const fixed = (parsed.fixedExpenses ?? []).filter((e: { name: string }) => e.name.trim() !== '')
      .reduce((s: number, e: { amount: number }) => s + e.amount, 0)
    const variable = (parsed.variableExpenses ?? []).filter((e: { name: string }) => e.name.trim() !== '')
      .reduce((s: number, e: { amount: number }) => s + e.amount, 0)
    const total = fixed + variable
    return total > 0 ? total : null
  } catch {
    return null
  }
}

export function ResultSection({ state, onSurvivalChange }: Props) {
  const { employment, salary, survival, pensionType } = state

  // 퇴사일 기준 정책 로드
  const policy = getPolicyForResignation(employment.resignationDate)

  // 계산값 도출
  const totalDays = calcEmploymentDays(employment.hireDate, employment.resignationDate)
  const age = calcAge(employment.birthYear)
  const threeMonthSalary = safeInt(salary.recentThreeMonthSalary)
  const threeMonthDays = safeInt(salary.recentThreeMonthDays, 92)
  const bonus = safeInt(salary.bonusAmount)
  const unusedLeave = safeInt(salary.unusedLeaveDays)
  const insurancePeriodYears = safeInt(employment.insurancePeriodMonths) / 12
  const currentSavings = safeInt(survival.currentSavings)
  const monthlyExpenses = safeInt(survival.monthlyLivingExpenses)

  const avgDailyWage = threeMonthSalary > 0
    ? calcAverageDailyWage(threeMonthSalary, threeMonthDays, bonus, unusedLeave,
        totalDays ? threeMonthSalary / threeMonthDays : 0)
    : null

  const severancePay = avgDailyWage && totalDays
    ? calcSeverancePay(avgDailyWage, totalDays)
    : null

  const dailyBenefit = avgDailyWage && policy
    ? calcDailyUnemploymentBenefit(avgDailyWage, policy)
    : null

  const benefitDays = age && insurancePeriodYears > 0
    ? calcBenefitDurationDays(age, insurancePeriodYears)
    : null

  const totalBenefit = dailyBenefit && benefitDays
    ? calcTotalUnemploymentBenefit(dailyBenefit, benefitDays)
    : null

  const survivalMonths = calcSurvivalMonths(
    currentSavings,
    severancePay ?? 0,
    totalBenefit ?? 0,
    monthlyExpenses
  )

  const totalAvailable = currentSavings + (severancePay ?? 0) + (totalBenefit ?? 0)

  const budgetExpenses = loadBudgetExpenses()
  const hasAnyResult = avgDailyWage !== null

  if (!hasAnyResult) return null

  return (
    <>
      {/* 퇴직금 */}
      {avgDailyWage && totalDays && (
        <SectionCard title="퇴직금 추정">
          {pensionType === 'dc' && (
            <p className="text-xs mb-3 p-3 rounded-lg" style={{ color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)' }}>
              DC형은 실제 수령액이 투자 성과에 따라 달라집니다.
            </p>
          )}
          {totalDays < 365 ? (
            <p className="text-sm" style={{ color: '#f59e0b' }}>
              근속기간 1년 미만으로 퇴직금이 발생하지 않습니다.
            </p>
          ) : (
            <div>
              <ResultRow label="평균 일급" value={`${formatKRW(Math.round(avgDailyWage))}원`} />
              <ResultRow label="총 근속기간" value={formatEmploymentPeriod(totalDays)} mono={false} />
              <ResultRow
                label="퇴직금 추정액"
                value={`${formatKRW(Math.round(severancePay ?? 0))}원`}
                color="var(--primary)"
                isLast
              />
            </div>
          )}
        </SectionCard>
      )}

      {/* 실업급여 — 정책 데이터 없음 fallback */}
      {avgDailyWage && !policy && employment.resignationDate && (
        <SectionCard title="실업급여 추정">
          <p className="text-sm" style={{ color: '#f59e0b' }}>
            {new Date(employment.resignationDate).getFullYear()}년 기준 정책 데이터가 아직 준비되지 않았습니다.
            실업급여 계산을 위해 퇴사일을 다시 확인해주세요.
          </p>
        </SectionCard>
      )}

      {/* 실업급여 */}
      {dailyBenefit && policy && (
        <SectionCard title="실업급여 추정">
          {/* 연도 뱃지 */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs px-2 py-0.5 font-semibold"
              style={{ backgroundColor: 'rgba(252,213,53,0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-pill)' }}
            >
              {policy.year}년 기준
            </span>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              업데이트: {policy.updatedAt}
            </span>
          </div>
          <div>
            <ResultRow label="평균 일급" value={`${formatKRW(Math.round(avgDailyWage!))}원`} />
            <ResultRow label={`추정 일 수령액 (상한 ${formatKRW(policy.dailyUpperLimit)}원)`} value={`${formatKRW(Math.round(dailyBenefit))}원`} />
            {benefitDays ? (
              <>
                <ResultRow label="추정 지급 기간" value={`${benefitDays}일`} />
                <ResultRow label="추정 총 수령액" value={`${formatKRW(Math.round(totalBenefit ?? 0))}원`} color="var(--primary)" isLast />
              </>
            ) : (
              <p className="text-xs py-2" style={{ color: 'var(--on-dark-mute)' }}>
                출생연도와 피보험 기간을 입력하면 지급 기간을 확인할 수 있습니다.
              </p>
            )}
          </div>
          {/* 출처 */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--hairline)' }}>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              출처: {policy.sources.map(s => s.name).join(' · ')}
            </p>
          </div>
        </SectionCard>
      )}

      {/* 퇴사 후 생존 기간 */}
      <SectionCard title="퇴사 후 생존 기간 계산">
        <div className="space-y-4 mb-4">
          <AmountField
            label="현재 저축액 (선택)"
            value={survival.currentSavings}
            onChange={(v) => onSurvivalChange('currentSavings', v)}
          />
          <div>
            <AmountField
              label="월 생활비"
              value={survival.monthlyLivingExpenses}
              onChange={(v) => onSurvivalChange('monthlyLivingExpenses', v)}
            />
            {budgetExpenses && !survival.monthlyLivingExpenses && (
              <button
                onClick={() => onSurvivalChange('monthlyLivingExpenses', formatKRW(budgetExpenses))}
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition-colors"
                style={{
                  color: 'var(--on-primary)',
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-pill)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Download size={12} />
                예산 계산기에서 가져오기 ({formatKRW(budgetExpenses)}원)
              </button>
            )}
          </div>
        </div>

        {monthlyExpenses > 0 ? (
          <div
            className="p-4 text-center rounded-xl"
            style={{ backgroundColor: 'var(--surface-input)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>
              퇴직금 + 실업급여 + 저축으로
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-number)', letterSpacing: '-0.6px' }}>
              약 {survivalMonths?.toFixed(1) ?? '-'}개월
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--on-dark-mute)' }}>
              생활비를 충당할 수 있습니다
            </p>
            <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
              총 가용 금액: {formatKRW(Math.round(totalAvailable))}원
            </p>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>
            월 생활비를 입력하면 생존 가능 기간을 확인할 수 있습니다.
          </p>
        )}
      </SectionCard>

      {/* 전체 요약 */}
      {(severancePay || totalBenefit || survivalMonths) && (
        <SectionCard title="최종 요약">
          {severancePay !== null && (
            <ResultRow label="퇴직금 추정액" value={`${formatKRW(Math.round(severancePay))}원`} />
          )}
          {dailyBenefit !== null && (
            <ResultRow label="실업급여 일 수령액 (추정)" value={`${formatKRW(Math.round(dailyBenefit))}원`} />
          )}
          {benefitDays !== null && (
            <ResultRow label="실업급여 지급 기간 (추정)" value={`${benefitDays}일`} />
          )}
          {totalBenefit !== null && (
            <ResultRow label="실업급여 합계 (추정)" value={`${formatKRW(Math.round(totalBenefit))}원`} />
          )}
          {monthlyExpenses > 0 && (
            <ResultRow
              label="예상 생존 기간"
              value={survivalMonths !== null ? `약 ${survivalMonths.toFixed(1)}개월` : '-'}
              color="var(--primary)"
              isLast
            />
          )}
        </SectionCard>
      )}
    </>
  )
}
