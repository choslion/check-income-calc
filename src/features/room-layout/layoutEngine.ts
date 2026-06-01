import type { Room, Furniture, LayoutSummary } from './types'
import {
  getRoomArea,
  getTotalFurnitureArea,
  getOccupancyPercent,
  getOccupancyStatus,
  detectAllFurnitureOverlaps,
  detectWallClearanceWarnings,
  detectFurnitureGapWarnings,
} from './geometry'
import { DEFAULT_MIN_CLEARANCE_CM } from './unit'

export function getLayoutSummary(
  room: Room,
  furnitureList: Furniture[],
  minClearanceCm = DEFAULT_MIN_CLEARANCE_CM,
): LayoutSummary {
  const roomAreaCm2 = getRoomArea(room)
  const totalFurnitureAreaCm2 = getTotalFurnitureArea(furnitureList)
  const occupancyPercent = getOccupancyPercent(room, furnitureList)
  const status = getOccupancyStatus(occupancyPercent)

  const overlapWarnings = detectAllFurnitureOverlaps(furnitureList)
  const wallWarnings = furnitureList.flatMap(f =>
    detectWallClearanceWarnings(room, f, minClearanceCm),
  )
  const gapWarnings = detectFurnitureGapWarnings(furnitureList, minClearanceCm)

  return {
    roomAreaCm2,
    totalFurnitureAreaCm2,
    occupancyPercent,
    status,
    warnings: [...overlapWarnings, ...wallWarnings, ...gapWarnings],
  }
}

export {
  convertToCm,
  validatePositiveNumber,
  DEFAULT_MIN_CLEARANCE_CM,
} from './unit'

export {
  getFurnitureEffectiveSize,
  getRoomArea,
  getFurnitureArea,
  getTotalFurnitureArea,
  getOccupancyPercent,
  getOccupancyStatus,
  clampFurnitureInsideRoom,
  moveFurniture,
  rotateFurniture,
  detectFurnitureOverlap,
  detectAllFurnitureOverlaps,
  getWallClearance,
  detectWallClearanceWarnings,
  detectFurnitureGapWarnings,
} from './geometry'

export type {
  Unit,
  Room,
  Furniture,
  FurnitureEffectiveSize,
  WallClearance,
  OccupancyStatus,
  LayoutWarning,
  LayoutWarningType,
  LayoutSummary,
} from './types'
