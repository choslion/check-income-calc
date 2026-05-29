import { WASTE_ITEMS } from '../data/wasteItems'
import { matchChosung } from './chosung'
import type { WasteItem } from '../types'

export function searchWasteItems(query: string): WasteItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return WASTE_ITEMS.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(q)
    const aliasMatch = item.aliases.some((a) => a.toLowerCase().includes(q))
    const chosungMatch = matchChosung(item.name, q) ||
      item.aliases.some((a) => matchChosung(a, q))
    return nameMatch || aliasMatch || chosungMatch
  }).sort((a, b) => {
    // 이름 정확 일치 우선
    const aExact = a.name.toLowerCase() === q ? 2 : a.name.toLowerCase().startsWith(q) ? 1 : 0
    const bExact = b.name.toLowerCase() === q ? 2 : b.name.toLowerCase().startsWith(q) ? 1 : 0
    return bExact - aExact
  })
}

export function getItemsByCategory(categoryId: string): WasteItem[] {
  return WASTE_ITEMS.filter((item) => item.category === categoryId)
}

export function getItemById(id: string): WasteItem | undefined {
  return WASTE_ITEMS.find((item) => item.id === id)
}

export function getRelatedItems(item: WasteItem): WasteItem[] {
  if (!item.relatedIds?.length) return []
  return item.relatedIds.flatMap((id) => getItemById(id) ?? [])
}
