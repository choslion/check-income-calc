import type { SavedFurniture, SavedFurnitureCategory } from './savedFurnitureTypes'

export const SAVED_CATEGORY_LABELS: Record<SavedFurnitureCategory, string> = {
  bed: '침대',
  desk: '책상',
  table: '식탁',
  sofa: '소파',
  storage: '수납',
  living: '거실',
  bedroom: '침실',
  custom: '기타',
}

export const SAVED_CATEGORIES: SavedFurnitureCategory[] = [
  'bed', 'desk', 'table', 'sofa', 'storage', 'living', 'bedroom', 'custom',
]

function genId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function createSavedFurniture(input: {
  name: string
  category?: SavedFurnitureCategory
  widthMm: number
  depthMm: number
  heightMm?: number
  note?: string
}): SavedFurniture {
  const now = new Date().toISOString()
  return {
    id: genId(),
    name: input.name.trim(),
    category: input.category ?? 'custom',
    widthMm: input.widthMm,
    depthMm: input.depthMm,
    heightMm: input.heightMm,
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }
}

export function formatSavedFurnitureSize(f: SavedFurniture): string {
  const w = parseFloat((f.widthMm / 10).toFixed(1))
  const d = parseFloat((f.depthMm / 10).toFixed(1))
  return `${w} × ${d}cm`
}

export function findSimilarSavedFurniture(
  input: { name: string; widthMm: number; depthMm: number },
  list: SavedFurniture[],
  excludeId?: string,
): SavedFurniture[] {
  const nameLower = input.name.toLowerCase().trim()
  return list.filter(f => {
    if (excludeId && f.id === excludeId) return false
    const sameName = f.name.toLowerCase().trim() === nameLower
    const sameSize = f.widthMm === input.widthMm && f.depthMm === input.depthMm
    return sameName || sameSize
  })
}

// Converts stored mm values to cm integers for use in the room simulator
export function savedFurnitureToCanvasItem(f: SavedFurniture): {
  name: string
  width: number  // cm
  depth: number  // cm
} {
  return {
    name: f.name,
    width: Math.round(f.widthMm / 10),
    depth: Math.round(f.depthMm / 10),
  }
}
