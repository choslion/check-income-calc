import type { FurnitureItem } from '../types'

const HEIGHT_RULES: { keywords: string[]; heightCm: number }[] = [
  { keywords: ['침대', '더블', '퀸', '킹', '싱글', '슈퍼싱글'], heightCm: 45 },
  { keywords: ['책상', '데스크'], heightCm: 72 },
  { keywords: ['식탁', '테이블'], heightCm: 75 },
  { keywords: ['소파'], heightCm: 80 },
  { keywords: ['옷장', '장롱'], heightCm: 200 },
  { keywords: ['행거'], heightCm: 160 },
  { keywords: ['책장'], heightCm: 180 },
  { keywords: ['서랍장', '화장대'], heightCm: 80 },
  { keywords: ['tv장', 'TV장', '거실장'], heightCm: 50 },
  { keywords: ['협탁'], heightCm: 50 },
]

const FALLBACK_HEIGHT_CM = 70

export function getFurnitureHeightCm(item: Pick<FurnitureItem, 'name' | 'heightCm'>): number {
  if (item.heightCm !== undefined) return item.heightCm
  const name = item.name
  for (const rule of HEIGHT_RULES) {
    if (rule.keywords.some(k => name.includes(k))) return rule.heightCm
  }
  return FALLBACK_HEIGHT_CM
}
