// Lightweight localStorage readers for cross-tool data access.
// Pure functions — no React or feature module imports.

const SUB_KEY = 'subscription-list-v1'
const BUDGET_KEY = 'budget-calculator-v1'

export interface SubscriptionSummary {
  monthlyTotal: number
  count: number
}

export function getSubscriptionSummary(): SubscriptionSummary {
  try {
    const raw = localStorage.getItem(SUB_KEY)
    if (!raw) return { monthlyTotal: 0, count: 0 }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return { monthlyTotal: 0, count: 0 }
    let monthlyTotal = 0
    let count = 0
    for (const s of parsed) {
      if (typeof s !== 'object' || s === null) continue
      const item = s as Record<string, unknown>
      if (item.status !== 'active' && item.status !== 'considering') continue
      const amount =
        typeof item.amount === 'number' ? item.amount :
        typeof item.price  === 'number' ? item.price  : 0
      monthlyTotal += item.cycle === 'yearly' ? (amount as number) / 12 : (amount as number)
      count++
    }
    return { monthlyTotal, count }
  } catch {
    return { monthlyTotal: 0, count: 0 }
  }
}

export function getBudgetSalary(): number {
  try {
    const raw = localStorage.getItem(BUDGET_KEY)
    if (!raw) return 0
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return 0
    const salary = (parsed as Record<string, unknown>).salary
    return typeof salary === 'number' ? salary : 0
  } catch {
    return 0
  }
}
