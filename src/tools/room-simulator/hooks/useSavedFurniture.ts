import { useState } from 'react'
import type { SavedFurniture, SavedFurnitureCategory } from '../../../features/room-layout/saved-furniture/savedFurnitureTypes'
import {
  loadSavedFurnitureList,
  persistSavedFurnitureList,
  clearSavedFurnitureStorage,
} from '../../../features/room-layout/saved-furniture/savedFurnitureStorage'
import { createSavedFurniture } from '../../../features/room-layout/saved-furniture/savedFurnitureUtils'

export function useSavedFurniture() {
  const [list, setList] = useState<SavedFurniture[]>(() => loadSavedFurnitureList())

  function commit(next: SavedFurniture[]) {
    setList(next)
    persistSavedFurnitureList(next)
  }

  function add(input: {
    name: string
    category?: SavedFurnitureCategory
    widthMm: number
    depthMm: number
    heightMm?: number
    note?: string
  }): SavedFurniture {
    const item = createSavedFurniture(input)
    commit([...list, item])
    return item
  }

  function update(
    id: string,
    updates: Partial<Omit<SavedFurniture, 'id' | 'createdAt'>>,
  ) {
    commit(
      list.map(f =>
        f.id === id
          ? { ...f, ...updates, updatedAt: new Date().toISOString() }
          : f,
      ),
    )
  }

  function remove(id: string) {
    commit(list.filter(f => f.id !== id))
  }

  function clear() {
    setList([])
    clearSavedFurnitureStorage()
  }

  return { list, add, update, remove, clear }
}
