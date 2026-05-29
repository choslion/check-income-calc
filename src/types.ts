export interface ExpenseItem {
  id: string
  name: string
  amount: number
}

export interface BudgetState {
  salary: number
  fixedExpenses: ExpenseItem[]
  variableExpenses: ExpenseItem[]
  savingsTarget: number
}

export interface BudgetCalculation {
  totalFixed: number
  totalVariable: number
  totalExpenses: number
  remainingAfterExpenses: number
  remainingAfterSavings: number
  savingsAchievable: boolean
  expenseRatio: number
}
