import type {
  Room,
  Furniture,
  FurnitureEffectiveSize,
  WallClearance,
  LayoutWarning,
  OccupancyStatus,
} from './types'
import { DEFAULT_MIN_CLEARANCE_CM } from './unit'

export function getFurnitureEffectiveSize(furniture: Furniture): FurnitureEffectiveSize {
  return furniture.rotated
    ? { widthCm: furniture.depthCm, depthCm: furniture.widthCm }
    : { widthCm: furniture.widthCm, depthCm: furniture.depthCm }
}

export function getRoomArea(room: Room): number {
  return room.widthCm * room.heightCm
}

export function getFurnitureArea(furniture: Furniture): number {
  return furniture.widthCm * furniture.depthCm
}

export function getTotalFurnitureArea(furnitureList: Furniture[]): number {
  return furnitureList.reduce((sum, f) => sum + getFurnitureArea(f), 0)
}

export function getOccupancyPercent(room: Room, furnitureList: Furniture[]): number {
  const roomArea = getRoomArea(room)
  if (roomArea === 0) return 0
  return (getTotalFurnitureArea(furnitureList) / roomArea) * 100
}

export function getOccupancyStatus(percent: number): OccupancyStatus {
  if (percent <= 20) return 'Spacious'
  if (percent <= 35) return 'Normal'
  if (percent <= 50) return 'Tight'
  return 'Very tight'
}

export function clampFurnitureInsideRoom(room: Room, furniture: Furniture): Furniture {
  const { widthCm, depthCm } = getFurnitureEffectiveSize(furniture)
  const xCm = Math.max(0, Math.min(room.widthCm - widthCm, furniture.xCm))
  const yCm = Math.max(0, Math.min(room.heightCm - depthCm, furniture.yCm))
  if (xCm === furniture.xCm && yCm === furniture.yCm) return furniture
  return { ...furniture, xCm, yCm }
}

export function moveFurniture(
  room: Room,
  furniture: Furniture,
  xCm: number,
  yCm: number,
): Furniture {
  return clampFurnitureInsideRoom(room, { ...furniture, xCm, yCm })
}

export function rotateFurniture(room: Room, furniture: Furniture): Furniture {
  return clampFurnitureInsideRoom(room, { ...furniture, rotated: !furniture.rotated })
}

export function detectFurnitureOverlap(a: Furniture, b: Furniture): boolean {
  const aSize = getFurnitureEffectiveSize(a)
  const bSize = getFurnitureEffectiveSize(b)
  const noOverlapX = a.xCm + aSize.widthCm <= b.xCm || b.xCm + bSize.widthCm <= a.xCm
  const noOverlapY = a.yCm + aSize.depthCm <= b.yCm || b.yCm + bSize.depthCm <= a.yCm
  return !(noOverlapX || noOverlapY)
}

export function detectAllFurnitureOverlaps(furnitureList: Furniture[]): LayoutWarning[] {
  const warnings: LayoutWarning[] = []
  for (let i = 0; i < furnitureList.length; i++) {
    for (let j = i + 1; j < furnitureList.length; j++) {
      const a = furnitureList[i]
      const b = furnitureList[j]
      if (detectFurnitureOverlap(a, b)) {
        warnings.push({
          type: 'overlap',
          message: `${a.name} overlaps with ${b.name}.`,
          furnitureIds: [a.id, b.id],
        })
      }
    }
  }
  return warnings
}

export function getWallClearance(room: Room, furniture: Furniture): WallClearance {
  const { widthCm, depthCm } = getFurnitureEffectiveSize(furniture)
  return {
    left: furniture.xCm,
    right: room.widthCm - (furniture.xCm + widthCm),
    top: furniture.yCm,
    bottom: room.heightCm - (furniture.yCm + depthCm),
  }
}

export function detectWallClearanceWarnings(
  room: Room,
  furniture: Furniture,
  minClearanceCm = DEFAULT_MIN_CLEARANCE_CM,
): LayoutWarning[] {
  const warnings: LayoutWarning[] = []
  const clearance = getWallClearance(room, furniture)
  const sides = [
    { key: 'left' as const, label: 'left' },
    { key: 'right' as const, label: 'right' },
    { key: 'top' as const, label: 'top' },
    { key: 'bottom' as const, label: 'bottom' },
  ]
  for (const { key, label } of sides) {
    const gap = clearance[key]
    // Only warn when there is a positive gap smaller than the threshold
    // (gap of 0 means furniture is touching the wall — no pathway to check)
    if (gap > 0 && gap < minClearanceCm) {
      warnings.push({
        type: 'clearance',
        message: `Less than ${minClearanceCm}cm of space remains on the ${label} side near ${furniture.name}.`,
        furnitureIds: [furniture.id],
      })
    }
  }
  return warnings
}

export function detectFurnitureGapWarnings(
  furnitureList: Furniture[],
  minClearanceCm = DEFAULT_MIN_CLEARANCE_CM,
): LayoutWarning[] {
  const warnings: LayoutWarning[] = []
  for (let i = 0; i < furnitureList.length; i++) {
    for (let j = i + 1; j < furnitureList.length; j++) {
      const a = furnitureList[i]
      const b = furnitureList[j]

      // Skip overlapping pairs — handled by overlap detection
      if (detectFurnitureOverlap(a, b)) continue

      const aSize = getFurnitureEffectiveSize(a)
      const bSize = getFurnitureEffectiveSize(b)

      // Horizontal gap (relevant when their Y extents share a horizontal corridor)
      const yExtentOverlap =
        Math.min(a.yCm + aSize.depthCm, b.yCm + bSize.depthCm) > Math.max(a.yCm, b.yCm)
      if (yExtentOverlap) {
        const hGap =
          Math.max(a.xCm, b.xCm) - Math.min(a.xCm + aSize.widthCm, b.xCm + bSize.widthCm)
        if (hGap > 0 && hGap < minClearanceCm) {
          warnings.push({
            type: 'clearance',
            message: `Less than ${minClearanceCm}cm of space between ${a.name} and ${b.name}.`,
            furnitureIds: [a.id, b.id],
          })
          continue
        }
      }

      // Vertical gap (relevant when their X extents share a vertical corridor)
      const xExtentOverlap =
        Math.min(a.xCm + aSize.widthCm, b.xCm + bSize.widthCm) > Math.max(a.xCm, b.xCm)
      if (xExtentOverlap) {
        const vGap =
          Math.max(a.yCm, b.yCm) - Math.min(a.yCm + aSize.depthCm, b.yCm + bSize.depthCm)
        if (vGap > 0 && vGap < minClearanceCm) {
          warnings.push({
            type: 'clearance',
            message: `Less than ${minClearanceCm}cm of space between ${a.name} and ${b.name}.`,
            furnitureIds: [a.id, b.id],
          })
        }
      }
    }
  }
  return warnings
}
