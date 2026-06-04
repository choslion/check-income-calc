import type { Subscription } from './types'

const KEY = 'subscription-list-v1'

// Tolerant migration: handles old shape (price) and new shape (amount), fills missing fields with defaults.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(items: any[]): Subscription[] {
  return items.map(item => ({
    id:         typeof item.id === 'string'         ? item.id          : crypto.randomUUID(),
    name:       typeof item.name === 'string'       ? item.name        : '',
    amount:     typeof item.amount === 'number'     ? item.amount
              : typeof item.price  === 'number'     ? item.price       : 0,
    cycle:      item.cycle === 'yearly'             ? 'yearly'         : 'monthly',
    category:   item.category === '스트리밍'  ? 'OTT'
              : item.category === '생산성'   ? 'AI'
              : item.category               ?? '기타',
    paymentDay: typeof item.paymentDay === 'number' ? item.paymentDay  : 1,
    status:     item.status === 'considering'     ? 'considering'
              : item.status === 'cancelCandidate' ? 'cancelCandidate' : 'active',
    memo:       typeof item.memo === 'string'       ? item.memo        : '',
    createdAt:  typeof item.createdAt === 'string'  ? item.createdAt   : new Date().toISOString(),
    color:      typeof item.color === 'string'      ? item.color       : '#4f80f7',
    ...(typeof item.nextPaymentDate === 'string' ? { nextPaymentDate: item.nextPaymentDate } : {}),
    ...(typeof item.updatedAt === 'string' ? { updatedAt: item.updatedAt } : {}),
  }))
}

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return migrate(parsed)
  } catch {
    return []
  }
}

export function saveSubscriptions(subs: Subscription[]): void {
  localStorage.setItem(KEY, JSON.stringify(subs))
}
