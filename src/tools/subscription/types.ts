export type SubscriptionCycle = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'considering' | 'cancelCandidate'

// Category values match preset group names so chips and form dropdown are consistent.
export type SubscriptionCategory =
  | 'OTT'
  | '음악'
  | 'AI'
  | '쇼핑·멤버십'
  | '클라우드'
  | '교육'
  | '게임'
  | '피트니스'
  | '기타'

export const SUBSCRIPTION_CATEGORIES: SubscriptionCategory[] = [
  'OTT', '음악', 'AI', '쇼핑·멤버십', '클라우드', '교육', '게임', '피트니스', '기타',
]

export interface Subscription {
  id: string
  name: string
  amount: number           // actual price entered (e.g. 14900/month or 120000/year)
  cycle: SubscriptionCycle
  category: SubscriptionCategory
  paymentDay: number       // 1–31, day of month when billed
  status: SubscriptionStatus
  memo: string
  nextPaymentDate?: string  // YYYY-MM-DD, for yearly subscriptions
  createdAt: string        // ISO date string
  updatedAt?: string       // ISO date string, set on edit
  color: string
}
