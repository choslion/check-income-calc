import type { SavedFurniture } from './savedFurnitureTypes'

const STORAGE_KEY = 'my-furniture-v1'

export function loadSavedFurnitureList(): SavedFurniture[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedFurniture[]) : []
  } catch {
    return []
  }
}

export function persistSavedFurnitureList(list: SavedFurniture[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Ignore storage quota errors
  }
}

export function clearSavedFurnitureStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
