export type SavedFurnitureCategory =
  | 'bed'
  | 'desk'
  | 'table'
  | 'sofa'
  | 'storage'
  | 'living'
  | 'bedroom'
  | 'custom'

export interface SavedFurniture {
  id: string
  name: string
  category: SavedFurnitureCategory
  widthMm: number
  depthMm: number
  heightMm?: number
  note?: string
  createdAt: string
  updatedAt: string
}
