import type { SubscriptionCycle } from '../types'

export interface SubTotals {
  monthlyTotal: number
  yearlyTotal: number
  dailyTotal: number
}

// All calculations use monthly as the base unit.
export function toMonthlyCost(amount: number, cycle: SubscriptionCycle): number {
  return cycle === 'yearly' ? amount / 12 : amount
}

export function toYearlyCost(amount: number, cycle: SubscriptionCycle): number {
  return cycle === 'monthly' ? amount * 12 : amount
}

export function calcTotals(subs: Array<{ amount: number; cycle: SubscriptionCycle }>): SubTotals {
  const yearlyTotal = subs.reduce((sum, s) => sum + toYearlyCost(s.amount, s.cycle), 0)
  return {
    monthlyTotal: yearlyTotal / 12,
    yearlyTotal,
    dailyTotal: yearlyTotal / 365,
  }
}

export interface UpcomingPayments {
  // Monthly subs: monthly amount. Yearly subs: full yearly amount (the actual charge).
  within7Days: number  // due today through 7 days from now (inclusive)
  thisMonth: number    // due today through end of current month (inclusive)
}

// Parse "YYYY-MM-DD" as a local date. new Date(string) treats bare dates as UTC
// which shifts them by the local UTC offset — wrong in Korea (UTC+9).
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export function calcUpcomingPayments(
  subs: Array<{ amount: number; cycle: SubscriptionCycle; paymentDay: number; nextPaymentDate?: string }>
): UpcomingPayments {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMs = today.getTime()
  const in7DaysMs = todayMs + 7 * 24 * 60 * 60 * 1000
  const yr = today.getFullYear()
  const mo = today.getMonth()

  function lastDay(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate()
  }

  let within7Days = 0
  let thisMonth = 0

  for (const sub of subs) {
    if (sub.cycle === 'yearly') {
      // Yearly: requires nextPaymentDate; uses full yearly amount when due.
      if (!sub.nextPaymentDate) continue
      const nextDate = parseLocalDate(sub.nextPaymentDate)
      const npMs = nextDate.getTime()
      if (npMs < todayMs) continue  // past — skip
      if (nextDate.getFullYear() === yr && nextDate.getMonth() === mo) thisMonth += sub.amount
      if (npMs <= in7DaysMs) within7Days += sub.amount
      continue
    }

    // Monthly: uses paymentDay; items without a valid paymentDay are excluded.
    const pd = sub.paymentDay
    if (pd < 1 || pd > 31) continue

    // Next occurrence of this payment day in the current month (clamped to last valid day).
    let nextDate = new Date(yr, mo, Math.min(pd, lastDay(yr, mo)))
    nextDate.setHours(0, 0, 0, 0)

    // If already passed, advance to next month.
    if (nextDate.getTime() < todayMs) {
      const nm = mo + 1
      const ny = nm > 11 ? yr + 1 : yr
      const nmi = nm > 11 ? 0 : nm
      nextDate = new Date(ny, nmi, Math.min(pd, lastDay(ny, nmi)))
      nextDate.setHours(0, 0, 0, 0)
    }

    const npMs = nextDate.getTime()
    if (nextDate.getFullYear() === yr && nextDate.getMonth() === mo) thisMonth += sub.amount
    if (npMs <= in7DaysMs) within7Days += sub.amount
  }

  return { within7Days, thisMonth }
}

export interface CategoryTotal {
  category: string
  monthly: number
  count: number
}

export function calcCategoryTotals(
  subs: Array<{ amount: number; cycle: SubscriptionCycle; category: string }>
): CategoryTotal[] {
  const monthlyMap = new Map<string, number>()
  const countMap = new Map<string, number>()
  for (const sub of subs) {
    const monthly = toMonthlyCost(sub.amount, sub.cycle)
    monthlyMap.set(sub.category, (monthlyMap.get(sub.category) ?? 0) + monthly)
    countMap.set(sub.category, (countMap.get(sub.category) ?? 0) + 1)
  }
  return Array.from(monthlyMap.entries())
    .map(([category, monthly]) => ({ category, monthly, count: countMap.get(category) ?? 0 }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.monthly - a.monthly)
}
