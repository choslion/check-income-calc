import type { BudgetState, BudgetCalculation } from '../types'

export const MAX_AMOUNT = 999_999_999

export function calculate(state: BudgetState): BudgetCalculation {
  const totalFixed = state.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalVariable = state.variableExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = totalFixed + totalVariable
  const remainingAfterExpenses = state.salary - totalExpenses
  const remainingAfterSavings = remainingAfterExpenses - state.savingsTarget
  const savingsAchievable = remainingAfterSavings >= 0
  const expenseRatio = state.salary > 0 ? (totalExpenses / state.salary) * 100 : 0

  return {
    totalFixed,
    totalVariable,
    totalExpenses,
    remainingAfterExpenses,
    remainingAfterSavings,
    savingsAchievable,
    expenseRatio,
  }
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
