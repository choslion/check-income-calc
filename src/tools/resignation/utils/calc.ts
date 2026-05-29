import { UNEMPLOYMENT, BENEFIT_DURATION_RULES } from '../constants/policy'
import type { ResignationState, EligibilityStatus, ResignationReason } from '../types'

// ── 날짜 유틸 ────────────────────────────────────────────────────────────────

export function calcEmploymentDays(hireDate: string, resignationDate: string): number | null {
  if (!hireDate || !resignationDate) return null
  const hire = new Date(hireDate)
  const resign = new Date(resignationDate)
  if (isNaN(hire.getTime()) || isNaN(resign.getTime())) return null
  const diff = Math.floor((resign.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

export function calcAge(birthYear: string): number | null {
  const year = parseInt(birthYear, 10)
  if (isNaN(year) || year < 1940 || year > 2010) return null
  return new Date().getFullYear() - year
}

export function formatEmploymentPeriod(days: number): string {
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  if (years === 0) return `${months}개월`
  if (months === 0) return `${years}년`
  return `${years}년 ${months}개월`
}

// ── 급여 계산 ────────────────────────────────────────────────────────────────

export function calcAverageDailyWage(
  threeMonthSalary: number,
  threeMonthDays: number,
  bonusAmount: number,
  unusedLeaveDays: number,
  dailyWageForLeave: number
): number | null {
  if (threeMonthDays <= 0 || threeMonthSalary < 0) return null
  const bonusAdj = bonusAmount / 12 * 3          // 3개월 상당 상여금
  const leaveAdj = unusedLeaveDays * dailyWageForLeave
  const adjusted = threeMonthSalary + bonusAdj + leaveAdj
  return adjusted / threeMonthDays
}

// ── 퇴직금 ───────────────────────────────────────────────────────────────────

export function calcSeverancePay(
  averageDailyWage: number,
  totalDays: number
): number | null {
  if (averageDailyWage <= 0 || totalDays <= 0) return null
  if (totalDays < 365) return null  // 1년 미만 시 퇴직금 없음
  return averageDailyWage * 30 * (totalDays / 365)
}

// ── 실업급여 ─────────────────────────────────────────────────────────────────

export function calcDailyUnemploymentBenefit(averageDailyWage: number): number {
  const raw = averageDailyWage * UNEMPLOYMENT.replaceRate
  return Math.max(
    UNEMPLOYMENT.dailyLowerLimit,
    Math.min(raw, UNEMPLOYMENT.dailyUpperLimit)
  )
}

export function calcBenefitDurationDays(age: number, insuranceYears: number): number | null {
  if (age <= 0 || insuranceYears < 0) return null
  const rule = BENEFIT_DURATION_RULES.find(
    r => age >= r.ageMin && age < r.ageMax &&
         insuranceYears >= r.yearsMin && insuranceYears < r.yearsMax
  )
  return rule?.days ?? null
}

export function calcTotalUnemploymentBenefit(
  dailyBenefit: number,
  durationDays: number
): number {
  return dailyBenefit * durationDays
}

// ── 생존 기간 ────────────────────────────────────────────────────────────────

export function calcSurvivalMonths(
  currentSavings: number,
  severancePay: number,
  totalUnemploymentBenefit: number,
  monthlyExpenses: number
): number | null {
  if (monthlyExpenses <= 0) return null
  const total = currentSavings + severancePay + totalUnemploymentBenefit
  return total / monthlyExpenses
}

// ── 수급 가능성 ──────────────────────────────────────────────────────────────

const HIGH_REASON: ResignationReason[] = ['recommended', 'contract_end', 'layoff', 'closure', 'wage_delay']
const MEDIUM_REASON: ResignationReason[] = ['long_commute', 'health']
const LOW_REASON: ResignationReason[] = ['voluntary', 'misconduct']

export function calcEligibilityStatus(
  reason: ResignationReason,
  checklist: ResignationState['checklist']
): EligibilityStatus {
  if (!reason) return 'unknown'

  const checkScore = Object.values(checklist).filter(Boolean).length
  const totalChecks = Object.keys(checklist).length

  if (LOW_REASON.includes(reason)) return 'low'
  if (MEDIUM_REASON.includes(reason)) {
    return checkScore >= totalChecks - 1 ? 'medium' : 'low'
  }
  if (HIGH_REASON.includes(reason)) {
    if (checkScore >= totalChecks - 1) return 'high'
    if (checkScore >= totalChecks - 2) return 'medium'
    return 'low'
  }
  return 'unknown'
}

// ── 안전 파싱 유틸 ───────────────────────────────────────────────────────────

export function safeInt(value: string, fallback = 0): number {
  const n = parseInt(value.replace(/,/g, ''), 10)
  return isNaN(n) || n < 0 ? fallback : n
}

export function safeFloat(value: string, fallback = 0): number {
  const n = parseFloat(value.replace(/,/g, ''))
  return isNaN(n) || n < 0 ? fallback : n
}
