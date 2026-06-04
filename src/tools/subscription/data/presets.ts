import type { SubscriptionCategory, SubscriptionCycle } from '../types'

// Group labels in preset chips use the same SubscriptionCategory values as the form dropdown,
// so the name the user sees in the chip section matches what they select in the category field.
export const PRESET_GROUPS: SubscriptionCategory[] = [
  'OTT', '음악', 'AI', '쇼핑·멤버십', '클라우드', '교육',
]

export interface SubPreset {
  name: string
  suggestedPrice: number   // suggested price only — user can edit before adding
  cycle: SubscriptionCycle
  category: SubscriptionCategory
}

export const QUICK_ADD_PRESETS: SubPreset[] = [
  // OTT
  { name: '넷플릭스',       suggestedPrice: 13500, cycle: 'monthly', category: 'OTT' },
  { name: '티빙',           suggestedPrice:  9900, cycle: 'monthly', category: 'OTT' },
  { name: '왓챠',           suggestedPrice:  7900, cycle: 'monthly', category: 'OTT' },
  { name: '웨이브',         suggestedPrice:  7900, cycle: 'monthly', category: 'OTT' },
  { name: '쿠팡플레이',     suggestedPrice:  4990, cycle: 'monthly', category: 'OTT' },
  { name: '라프텔',         suggestedPrice:  9900, cycle: 'monthly', category: 'OTT' },
  { name: '디즈니+',        suggestedPrice:  9900, cycle: 'monthly', category: 'OTT' },
  { name: '애플 TV+',       suggestedPrice:  9900, cycle: 'monthly', category: 'OTT' },
  { name: '유튜브 프리미엄', suggestedPrice: 14900, cycle: 'monthly', category: 'OTT' },
  // 음악
  { name: '멜론',           suggestedPrice:  7900, cycle: 'monthly', category: '음악' },
  { name: '스포티파이',     suggestedPrice: 10900, cycle: 'monthly', category: '음악' },
  { name: '애플 뮤직',     suggestedPrice:  8900, cycle: 'monthly', category: '음악' },
  { name: '유튜브 뮤직',   suggestedPrice: 10900, cycle: 'monthly', category: '음악' },
  // AI · 생산성
  { name: 'ChatGPT',       suggestedPrice: 27000, cycle: 'monthly', category: 'AI' },
  { name: 'Claude',        suggestedPrice: 27000, cycle: 'monthly', category: 'AI' },
  { name: 'Gemini',        suggestedPrice: 27000, cycle: 'monthly', category: 'AI' },
  { name: 'Perplexity',    suggestedPrice: 27000, cycle: 'monthly', category: 'AI' },
  { name: 'Cursor',        suggestedPrice: 27000, cycle: 'monthly', category: 'AI' },
  { name: '마이크로소프트 365', suggestedPrice: 89000, cycle: 'yearly', category: 'AI' },
  // 쇼핑·멤버십
  { name: '쿠팡 로켓와우', suggestedPrice:  7890, cycle: 'monthly', category: '쇼핑·멤버십' },
  { name: '배민클럽',       suggestedPrice:  3900, cycle: 'monthly', category: '쇼핑·멤버십' },
  { name: '네이버 플러스', suggestedPrice:  4900, cycle: 'monthly', category: '쇼핑·멤버십' },
  // 클라우드
  { name: 'iCloud+',       suggestedPrice:  3300, cycle: 'monthly', category: '클라우드' },
  { name: 'Google One',    suggestedPrice:  2900, cycle: 'monthly', category: '클라우드' },
  { name: 'OneDrive',      suggestedPrice:  8900, cycle: 'monthly', category: '클라우드' },
  // 교육
  { name: '밀리의 서재',   suggestedPrice:  9900, cycle: 'monthly', category: '교육' },
  { name: '리디셀렉트',    suggestedPrice:  9900, cycle: 'monthly', category: '교육' },
  { name: '슈퍼 듀오링고', suggestedPrice: 14900, cycle: 'monthly', category: '교육' },
]

export const SUBSCRIPTION_COLORS = [
  '#4f80f7', '#f7934f', '#4fc98a', '#f76f6f', '#c084fc',
  '#f7d04f', '#38c8f7', '#f472b6', '#a3e635', '#fb923c',
]
