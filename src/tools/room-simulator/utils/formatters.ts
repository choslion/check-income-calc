import type { FurnitureItem } from '../types'
import { getFurnitureDimensions } from './geometry'

function formatDim(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatFurnitureSize(item: FurnitureItem): string {
  const { w, h } = getFurnitureDimensions(item)
  return `${formatDim(w)} × ${formatDim(h)}cm`
}

export function formatDistance(cm: number): string {
  return `${Math.round(cm)}cm`
}
