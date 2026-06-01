import type { Room, FurnitureItem, ClearanceWarning } from '../types'

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

export function exportRoomAsImage(room: Room, furniture: FurnitureItem[]) {
  const EXPORT_W = 800
  const EXPORT_H = Math.round((EXPORT_W * room.height) / room.width)
  const DPR = 2
  const canvas = document.createElement('canvas')
  canvas.width = EXPORT_W * DPR
  canvas.height = EXPORT_H * DPR
  const ctx = canvas.getContext('2d')!
  ctx.scale(DPR, DPR)

  const s = EXPORT_W / room.width

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H)

  // Grid (100cm intervals)
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  for (let x = 100; x < room.width; x += 100) {
    ctx.beginPath()
    ctx.moveTo(x * s, 0)
    ctx.lineTo(x * s, EXPORT_H)
    ctx.stroke()
  }
  for (let y = 100; y < room.height; y += 100) {
    ctx.beginPath()
    ctx.moveTo(0, y * s)
    ctx.lineTo(EXPORT_W, y * s)
    ctx.stroke()
  }

  // Furniture
  for (const item of furniture) {
    const { w, h } = getFurnitureDimensions(item)
    ctx.fillStyle = item.color + 'aa'
    ctx.fillRect(item.x * s, item.y * s, w * s, h * s)
    ctx.strokeStyle = item.color
    ctx.lineWidth = 2
    ctx.strokeRect(item.x * s, item.y * s, w * s, h * s)

    const fontSize = Math.min(14, Math.max(8, Math.min(w, h) * s / 4))
    ctx.fillStyle = '#ffffff'
    ctx.font = `600 ${fontSize}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(item.name, (item.x + w / 2) * s, (item.y + h / 2) * s, w * s - 8)
  }

  // Room border
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'
  ctx.lineWidth = 3
  ctx.strokeRect(1.5, 1.5, EXPORT_W - 3, EXPORT_H - 3)

  // Dimension label
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '12px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${room.width}cm × ${room.height}cm`, EXPORT_W - 10, EXPORT_H - 8)

  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = '방-배치도.png'
  link.click()
}
