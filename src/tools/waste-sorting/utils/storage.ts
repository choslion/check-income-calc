import type { RecentSearch, ResultType } from '../types'

const RECENT_KEY = 'lifestyle-tools:waste-sorting:recent-searches'
const FAVORITES_KEY = 'lifestyle-tools:waste-sorting:favorites'
const MAX_RECENT = 10

export function getRecentSearches(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentSearch(itemId: string, itemName: string, resultType: ResultType): void {
  try {
    const recent = getRecentSearches().filter((r) => r.itemId !== itemId)
    recent.unshift({ itemId, itemName, resultType, searchedAt: new Date().toISOString() })
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch {
    // 무시
  }
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_KEY)
}

export function getFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function toggleFavorite(itemId: string): boolean {
  try {
    const favs = getFavorites()
    const isFav = favs.includes(itemId)
    const next = isFav ? favs.filter((id) => id !== itemId) : [...favs, itemId]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
    return !isFav
  } catch {
    return false
  }
}
