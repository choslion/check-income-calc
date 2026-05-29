import { describe, it, expect } from 'vitest'
import {
  calcDailyUnemploymentBenefit,
  calcSeverancePay,
  calcAverageDailyWage,
  calcBenefitDurationDays,
  calcSurvivalMonths,
  calcEmploymentDays,
} from '../calc'
import { getPolicyByYear, getPolicyForResignation } from '../policyLoader'

// ── 정책 데이터 로드 ──────────────────────────────────────────────────────────

describe('getPolicyByYear', () => {
  it('2026년 상한액', () => {
    expect(getPolicyByYear(2026)?.dailyUpperLimit).toBe(68_100)
  })

  it('2026년 하한액', () => {
    expect(getPolicyByYear(2026)?.dailyLowerLimit).toBe(66_048)
  })

  it('2026년 월 상한액', () => {
    expect(getPolicyByYear(2026)?.monthlyUpperLimit).toBe(2_043_000)
  })

  it('2026년 월 하한액', () => {
    expect(getPolicyByYear(2026)?.monthlyLowerLimit).toBe(1_981_440)
  })

  it('2025년 상한액', () => {
    expect(getPolicyByYear(2025)?.dailyUpperLimit).toBe(66_000)
  })

  it('없는 연도는 null 반환', () => {
    expect(getPolicyByYear(2027)).toBeNull()
  })
})

// ── 퇴사일 기준 정책 선택 ──────────────────────────────────────────────────────

describe('getPolicyForResignation', () => {
  it('2025년 12월 퇴사 → 2025년 기준', () => {
    expect(getPolicyForResignation('2025-12-31')?.year).toBe(2025)
  })

  it('2026년 1월 퇴사 → 2026년 기준', () => {
    expect(getPolicyForResignation('2026-01-01')?.year).toBe(2026)
  })

  it('미래 연도 퇴사 → 가장 최근 연도 fallback', () => {
    const policy = getPolicyForResignation('2027-06-01')
    expect(policy?.year).toBe(2026)
  })

  it('빈 날짜 → 최신 연도 폴백', () => {
    expect(getPolicyForResignation('')?.year).toBe(2026)
  })
})

// ── 실업급여 일 수령액 ────────────────────────────────────────────────────────

describe('calcDailyUnemploymentBenefit', () => {
  const policy2026 = {
    replaceRate: 0.6,
    dailyUpperLimit: 68_100,
    dailyLowerLimit: 66_048,
  }

  it('정상 계산 (평균 일급 100,000원 → 60% = 60,000원 → 하한 적용 → 66,048원)', () => {
    expect(calcDailyUnemploymentBenefit(100_000, policy2026)).toBe(66_048)
  })

  it('상한 적용 (평균 일급 200,000원 → 120,000원 → 상한 적용 → 68,100원)', () => {
    expect(calcDailyUnemploymentBenefit(200_000, policy2026)).toBe(68_100)
  })

  it('중간값 (평균 일급 120,000원 → 72,000원 → 상한 68,100원 적용)', () => {
    expect(calcDailyUnemploymentBenefit(120_000, policy2026)).toBe(68_100)
  })

  it('하한과 상한 사이 (평균 일급 111,000원 → 66,600원)', () => {
    expect(calcDailyUnemploymentBenefit(111_000, policy2026)).toBe(66_600)
  })
})

// ── 퇴직금 ───────────────────────────────────────────────────────────────────

describe('calcSeverancePay', () => {
  it('정상 계산 (일급 100,000원 × 30 × 365일/365)', () => {
    expect(calcSeverancePay(100_000, 365)).toBe(3_000_000)
  })

  it('2년 근속 (일급 100,000원 × 30 × 730/365)', () => {
    expect(calcSeverancePay(100_000, 730)).toBe(6_000_000)
  })

  it('1년 미만 → null', () => {
    expect(calcSeverancePay(100_000, 364)).toBeNull()
  })

  it('일급 0 → null', () => {
    expect(calcSeverancePay(0, 365)).toBeNull()
  })
})

// ── 평균 일급 ────────────────────────────────────────────────────────────────

describe('calcAverageDailyWage', () => {
  it('기본 계산 (3,000,000원 ÷ 92일)', () => {
    const wage = calcAverageDailyWage(3_000_000, 92, 0, 0, 0)
    expect(wage).toBeCloseTo(3_000_000 / 92, 5)
  })

  it('3개월 일수 0이면 null', () => {
    expect(calcAverageDailyWage(3_000_000, 0, 0, 0, 0)).toBeNull()
  })
})

// ── 지급 기간 ────────────────────────────────────────────────────────────────

describe('calcBenefitDurationDays', () => {
  it('40세, 피보험 2년 → 150일', () => {
    expect(calcBenefitDurationDays(40, 2)).toBe(150)
  })

  it('55세, 피보험 5년 → 240일', () => {
    expect(calcBenefitDurationDays(55, 5)).toBe(240)
  })

  it('30세, 피보험 10년 이상 → 240일', () => {
    expect(calcBenefitDurationDays(30, 10)).toBe(240)
  })

  it('60세, 피보험 10년 이상 → 270일', () => {
    expect(calcBenefitDurationDays(60, 10)).toBe(270)
  })
})

// ── 생존 기간 ────────────────────────────────────────────────────────────────

describe('calcSurvivalMonths', () => {
  it('정상 계산', () => {
    expect(calcSurvivalMonths(1_000_000, 3_000_000, 2_000_000, 1_000_000)).toBe(6)
  })

  it('월 생활비 0 → null', () => {
    expect(calcSurvivalMonths(0, 0, 0, 0)).toBeNull()
  })
})

// ── 근속 일수 ────────────────────────────────────────────────────────────────

describe('calcEmploymentDays', () => {
  it('1년 정확히 (비윤년 기준)', () => {
    expect(calcEmploymentDays('2023-01-01', '2024-01-01')).toBe(365)
  })

  it('퇴사일이 더 이르면 null', () => {
    expect(calcEmploymentDays('2025-01-01', '2024-01-01')).toBeNull()
  })

  it('빈 날짜 → null', () => {
    expect(calcEmploymentDays('', '2025-01-01')).toBeNull()
  })
})
