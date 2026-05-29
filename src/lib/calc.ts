import type { BudgetState, BudgetCalculation } from '../types'

export const MAX_AMOUNT = 999_999_999

export function calculate(state: BudgetState): BudgetCalculation {
  // 이름이 없는 빈 행은 계산에서 제외
  const validFixed = state.fixedExpenses.filter(e => e.name.trim() !== '')
  const validVariable = state.variableExpenses.filter(e => e.name.trim() !== '')

  const totalFixed = validFixed.reduce((sum, e) => sum + e.amount, 0)
  const totalVariable = validVariable.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = totalFixed + totalVariable
  const remainingAfterExpenses = state.salary - totalExpenses
  const remainingAfterSavings = remainingAfterExpenses - state.savingsTarget
  const savingsAchievable = remainingAfterSavings >= 0
  const expenseRatio = state.salary > 0 ? (totalExpenses / state.salary) * 100 : 0
  const monthlySavings = Math.max(0, remainingAfterExpenses)
  const annualSavings = monthlySavings * 12
  const healthScore = calcHealthScore(expenseRatio)

  return {
    totalFixed,
    totalVariable,
    totalExpenses,
    remainingAfterExpenses,
    remainingAfterSavings,
    savingsAchievable,
    expenseRatio,
    annualSavings,
    healthScore,
  }
}

function calcHealthScore(expenseRatio: number): number {
  if (expenseRatio <= 50) return Math.round(100 - (expenseRatio / 50) * 10)
  if (expenseRatio <= 70) return Math.round(89 - ((expenseRatio - 51) / 19) * 19)
  if (expenseRatio <= 90) return Math.round(69 - ((expenseRatio - 71) / 19) * 29)
  return Math.max(0, Math.round(39 - ((expenseRatio - 91) / 9) * 39))
}

export function calcMonthsToGoal(
  target: number,
  currentSaved: number,
  monthlySavings: number
): number | null {
  if (monthlySavings <= 0) return null
  const remaining = target - currentSaved
  if (remaining <= 0) return 0
  return Math.ceil(remaining / monthlySavings)
}

export function formatMonthsToGoal(months: number): string {
  if (months === 0) return '이미 목표를 달성했습니다'
  if (months < 12) return `약 ${months}개월`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `약 ${years}년`
  return `약 ${years}년 ${remainingMonths}개월`
}

export function formatKRW(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/,/g, '').replace(/[^0-9]/g, '')
  if (cleaned === '') return 0
  const parsed = parseInt(cleaned, 10)
  if (isNaN(parsed)) return 0
  return Math.min(parsed, MAX_AMOUNT)
}
