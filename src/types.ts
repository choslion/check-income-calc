export interface ExpenseItem {
  id: string
  name: string
  amount: number
  source?: string
}

export interface BudgetState {
  salary: number
  fixedExpenses: ExpenseItem[]
  variableExpenses: ExpenseItem[]
  savingsTarget: number
  goalTarget: number
  goalCurrentSaved: number
}

export interface BudgetCalculation {
  totalFixed: number
  totalVariable: number
  totalExpenses: number
  remainingAfterExpenses: number
  remainingAfterSavings: number
  savingsAchievable: boolean
  expenseRatio: number
  annualSavings: number
  healthScore: number
}
