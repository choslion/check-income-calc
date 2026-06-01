import type { Room, FurnitureItem, ClearanceWarning, FixedElement, FixedElementType, WallSide } from '../types'

export function getFurnitureDimensions(item: FurnitureItem): { w: number; h: number } {
  return item.rotated
    ? { w: item.depth, h: item.width }
    : { w: item.width, h: item.depth }
}

export function getRoomArea(room: Room): number {
  return room.width * room.height
}

export function getFurnitureArea(item: FurnitureItem): number {
  return item.width * item.depth
}

export function getOccupancyPercent(room: Room, furniture: FurnitureItem[]): number {
  const roomArea = getRoomArea(room)
  if (roomArea === 0) return 0
  const total = furniture.reduce((sum, f) => sum + getFurnitureArea(f), 0)
  return Math.round((total / roomArea) * 100)
}

export function getOccupancyStatus(pct: number): {
  label: string
  sublabel: string
  color: string
} {
  if (pct <= 20) return { label: '여유 있음', sublabel: '공간이 넉넉해요', color: '#4fc98a' }
  if (pct <= 35) return { label: '적당함', sublabel: '생활하기 좋은 수준이에요', color: '#4f80f7' }
  if (pct <= 50) return { label: '좀 빡빡함', sublabel: '움직임이 불편할 수 있어요', color: '#f7d04f' }
  return { label: '매우 비좁음', sublabel: '가구를 줄이거나 배치를 바꿔보세요', color: '#f76f6f' }
}

export function checkClearances(
  room: Room,
  furniture: FurnitureItem[],
  threshold = 60
): ClearanceWarning[] {
  const warnings: ClearanceWarning[] = []

  for (const item of furniture) {
    const { w, h } = getFurnitureDimensions(item)
    const right = item.x + w
    const bottom = item.y + h

    const wallGaps = [
      { label: '왼쪽', gap: item.x },
      { label: '오른쪽', gap: room.width - right },
      { label: '위쪽', gap: item.y },
      { label: '아래쪽', gap: room.height - bottom },
    ]

    for (const { label, gap } of wallGaps) {
      if (gap > 0 && gap < threshold) {
        warnings.push({
          id: `${item.id}-wall-${label}`,
          message: `${item.name} ${label} 통로가 ${Math.round(gap)}cm로 좁을 수 있어요.`,
        })
      }
    }
  }

  for (let i = 0; i < furniture.length; i++) {
    for (let j = i + 1; j < furniture.length; j++) {
      const a = furniture[i]
      const b = furniture[j]
      const { w: aw, h: ah } = getFurnitureDimensions(a)
      const { w: bw, h: bh } = getFurnitureDimensions(b)

      // Horizontal gap (only when Y extents overlap)
      const yOverlap = Math.min(a.y + ah, b.y + bh) > Math.max(a.y, b.y)
      if (yOverlap) {
        const gap = Math.max(a.x, b.x) - Math.min(a.x + aw, b.x + bw)
        if (gap > 0 && gap < threshold) {
          warnings.push({
            id: `${a.id}-${b.id}-h`,
            message: `${a.name}와 ${b.name} 사이 통로가 ${Math.round(gap)}cm로 좁을 수 있어요.`,
          })
        }
      }

      // Vertical gap (only when X extents overlap)
      const xOverlap = Math.min(a.x + aw, b.x + bw) > Math.max(a.x, b.x)
      if (xOverlap) {
        const gap = Math.max(a.y, b.y) - Math.min(a.y + ah, b.y + bh)
        if (gap > 0 && gap < threshold) {
          warnings.push({
            id: `${a.id}-${b.id}-v`,
            message: `${a.name}와 ${b.name} 사이 통로가 ${Math.round(gap)}cm로 좁을 수 있어요.`,
          })
        }
      }
    }
  }

  return warnings
}

export function findInitialPosition(
  room: Room,
  existing: FurnitureItem[],
  item: FurnitureItem,
): { x: number; y: number } {
  const { w, h } = getFurnitureDimensions(item)
  if (w > room.width || h > room.height) return { x: 0, y: 0 }

  const STEP = 10
  for (let y = 0; y <= room.height - h; y += STEP) {
    for (let x = 0; x <= room.width - w; x += STEP) {
      const overlaps = existing.some(e => {
        const { w: ew, h: eh } = getFurnitureDimensions(e)
        return !(x + w <= e.x || e.x + ew <= x || y + h <= e.y || e.y + eh <= y)
      })
      if (!overlaps) return { x, y }
    }
  }
  return { x: 0, y: 0 }
}

export function getWallClearance(
  room: Room,
  item: FurnitureItem,
): { left: number; right: number; top: number; bottom: number } {
  const { w, h } = getFurnitureDimensions(item)
  return {
    left: item.x,
    right: room.width - (item.x + w),
    top: item.y,
    bottom: room.height - (item.y + h),
  }
}

export type NearestGapResult = {
  item: FurnitureItem
  gap: number
  direction: 'right' | 'left' | 'below' | 'above'
}

export function getNearestFurnitureGap(
  selected: FurnitureItem,
  all: FurnitureItem[],
): NearestGapResult | null {
  const { w: sw, h: sh } = getFurnitureDimensions(selected)
  let nearest: NearestGapResult | null = null

  for (const item of all) {
    if (item.id === selected.id) continue
    const { w, h } = getFurnitureDimensions(item)

    // Skip overlapping pairs
    const overlapX = selected.x < item.x + w && selected.x + sw > item.x
    const overlapY = selected.y < item.y + h && selected.y + sh > item.y
    if (overlapX && overlapY) continue

    // Horizontal gap — only when Y extents share a corridor
    const yOverlap = Math.min(selected.y + sh, item.y + h) > Math.max(selected.y, item.y)
    if (yOverlap) {
      if (item.x >= selected.x + sw) {
        const gap = item.x - (selected.x + sw)
        if (nearest === null || gap < nearest.gap) nearest = { item, gap, direction: 'right' }
      } else if (item.x + w <= selected.x) {
        const gap = selected.x - (item.x + w)
        if (nearest === null || gap < nearest.gap) nearest = { item, gap, direction: 'left' }
      }
    }

    // Vertical gap — only when X extents share a corridor
    const xOverlap = Math.min(selected.x + sw, item.x + w) > Math.max(selected.x, item.x)
    if (xOverlap) {
      if (item.y >= selected.y + sh) {
        const gap = item.y - (selected.y + sh)
        if (nearest === null || gap < nearest.gap) nearest = { item, gap, direction: 'below' }
      } else if (item.y + h <= selected.y) {
        const gap = selected.y - (item.y + h)
        if (nearest === null || gap < nearest.gap) nearest = { item, gap, direction: 'above' }
      }
    }
  }

  return nearest
}

// ─── Fixed Elements ───────────────────────────────────────────────────────────

export const FIXED_ELEMENT_COLORS: Record<FixedElementType, string> = {
  door:            '#4ecdc4',
  window:          '#74b9ff',
  balconyDoor:     '#55efc4',
  builtInCloset:   '#a29bfe',
  column:          '#95a5a6',
  unavailableArea: '#e17055',
}

export const FIXED_ELEMENT_LABELS: Record<FixedElementType, string> = {
  door:            '문',
  window:          '창문',
  balconyDoor:     '발코니 문',
  builtInCloset:   '붙박이장',
  column:          '기둥/장애물',
  unavailableArea: '사용불가 영역',
}

export const WALL_SIDE_LABELS: Record<WallSide, string> = {
  top:    '위쪽',
  right:  '오른쪽',
  bottom: '아래쪽',
  left:   '왼쪽',
}

const WALL_DEPTH_CM = 8
const DOOR_CLEARANCE_CM = 80

export function makeWallElement(
  room: Room,
  wallSide: WallSide,
  openingCm: number,
  type: FixedElementType,
  name: string,
): Omit<FixedElement, 'id'> {
  let xCm: number, yCm: number, widthCm: number, depthCm: number
  switch (wallSide) {
    case 'top':
      xCm = Math.max(0, Math.round((room.width - openingCm) / 2))
      yCm = 0; widthCm = openingCm; depthCm = WALL_DEPTH_CM
      break
    case 'bottom':
      xCm = Math.max(0, Math.round((room.width - openingCm) / 2))
      yCm = room.height - WALL_DEPTH_CM; widthCm = openingCm; depthCm = WALL_DEPTH_CM
      break
    case 'left':
      xCm = 0
      yCm = Math.max(0, Math.round((room.height - openingCm) / 2))
      widthCm = WALL_DEPTH_CM; depthCm = openingCm
      break
    case 'right':
      xCm = room.width - WALL_DEPTH_CM
      yCm = Math.max(0, Math.round((room.height - openingCm) / 2))
      widthCm = WALL_DEPTH_CM; depthCm = openingCm
      break
  }
  return { type, name, xCm, yCm, widthCm, depthCm, wallSide }
}

export function makeFloorElement(
  room: Room,
  widthCm: number,
  depthCm: number,
  type: FixedElementType,
  name: string,
): Omit<FixedElement, 'id'> {
  const xCm = Math.max(0, Math.round((room.width - widthCm) / 2))
  const yCm = Math.max(0, Math.round((room.height - depthCm) / 2))
  return { type, name, xCm, yCm, widthCm, depthCm }
}

export function getDoorClearanceZone(
  el: FixedElement,
): { x: number; y: number; w: number; h: number } | null {
  if ((el.type !== 'door' && el.type !== 'balconyDoor') || !el.wallSide) return null
  switch (el.wallSide) {
    case 'top':
      return { x: el.xCm, y: el.yCm + el.depthCm, w: el.widthCm, h: DOOR_CLEARANCE_CM }
    case 'bottom':
      return { x: el.xCm, y: el.yCm - DOOR_CLEARANCE_CM, w: el.widthCm, h: DOOR_CLEARANCE_CM }
    case 'left':
      return { x: el.xCm + el.widthCm, y: el.yCm, w: DOOR_CLEARANCE_CM, h: el.depthCm }
    case 'right':
      return { x: el.xCm - DOOR_CLEARANCE_CM, y: el.yCm, w: DOOR_CLEARANCE_CM, h: el.depthCm }
  }
}

export function getMinimumClearanceCm(room: Room, furniture: FurnitureItem[]): number | null {
  if (furniture.length === 0) return null
  let min = Infinity

  for (const item of furniture) {
    const { w, h } = getFurnitureDimensions(item)
    const gaps = [item.x, room.width - (item.x + w), item.y, room.height - (item.y + h)]
    for (const gap of gaps) {
      if (gap > 0) min = Math.min(min, gap)
    }
  }

  for (let i = 0; i < furniture.length; i++) {
    for (let j = i + 1; j < furniture.length; j++) {
      const a = furniture[i]
      const b = furniture[j]
      const { w: aw, h: ah } = getFurnitureDimensions(a)
      const { w: bw, h: bh } = getFurnitureDimensions(b)
      const yOverlap = Math.min(a.y + ah, b.y + bh) > Math.max(a.y, b.y)
      if (yOverlap) {
        const gap = Math.max(a.x, b.x) - Math.min(a.x + aw, b.x + bw)
        if (gap > 0) min = Math.min(min, gap)
      }
      const xOverlap = Math.min(a.x + aw, b.x + bw) > Math.max(a.x, b.x)
      if (xOverlap) {
        const gap = Math.max(a.y, b.y) - Math.min(a.y + ah, b.y + bh)
        if (gap > 0) min = Math.min(min, gap)
      }
    }
  }

  return min === Infinity ? null : Math.round(min)
}

function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

export function checkFixedElementConflicts(
  furniture: FurnitureItem[],
  fixedElements: FixedElement[],
): ClearanceWarning[] {
  if (fixedElements.length === 0) return []
  const warnings: ClearanceWarning[] = []

  for (const f of furniture) {
    const { w: fw, h: fh } = getFurnitureDimensions(f)

    for (const el of fixedElements) {
      const overlaps = rectsOverlap(f.x, f.y, fw, fh, el.xCm, el.yCm, el.widthCm, el.depthCm)

      if (overlaps && (el.type === 'builtInCloset' || el.type === 'column' || el.type === 'unavailableArea')) {
        warnings.push({
          id: `${f.id}-${el.id}-overlap`,
          message: `${f.name}이(가) ${el.name}과(와) 겹쳐 있어요.`,
        })
        continue
      }

      if (el.type === 'door' || el.type === 'balconyDoor') {
        const zone = getDoorClearanceZone(el)
        if (zone && rectsOverlap(f.x, f.y, fw, fh, zone.x, zone.y, zone.w, zone.h)) {
          warnings.push({
            id: `${f.id}-${el.id}-door-clearance`,
            message: `${f.name}이(가) ${el.name} 앞에 있어 통행이 불편할 수 있어요.`,
          })
        }
      }

      if (el.type === 'window' && overlaps) {
        warnings.push({
          id: `${f.id}-${el.id}-window`,
          message: `${f.name}이(가) ${el.name} 앞을 가릴 수 있어요.`,
        })
      }
    }
  }

  return warnings
}
