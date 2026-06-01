import type { Room, FurnitureItem, FixedElement } from '../types'
import {
  getFurnitureDimensions,
  getOccupancyPercent,
  getOccupancyStatus,
  checkClearances,
  checkFixedElementConflicts,
  getDoorClearanceZone,
  FIXED_ELEMENT_COLORS,
} from './geometry'

export { canUseNativeShare, getExportFileName } from '../../../features/room-layout/export/exportLayoutImage'

// ─── Canvas image creation ────────────────────────────────────────────────────

const EXPORT_W = 1080
const PADDING = 40
const CONTENT_W = EXPORT_W - PADDING * 2
const MAX_CANVAS_H = 680
const HEADER_H = 72
const DPR = 2  // retina

export async function createLayoutBlob(
  room: Room,
  furniture: FurnitureItem[],
  fixedElements: FixedElement[] = [],
  layoutVersionName?: string,
): Promise<Blob> {
  const pct = getOccupancyPercent(room, furniture)
  const status = getOccupancyStatus(pct)
  const fixedWarnings = checkFixedElementConflicts(furniture, fixedElements)
  const clearanceWarnings = checkClearances(room, furniture)
  const allWarnings = [...fixedWarnings, ...clearanceWarnings]
  const mainWarning =
    allWarnings.find(w => w.id.includes('overlap')) ??
    allWarnings[0] ??
    null

  // Scale room to fit CONTENT_W × MAX_CANVAS_H
  const scaleByW = CONTENT_W / room.width
  const scaleByH = MAX_CANVAS_H / room.height
  const s = Math.min(scaleByW, scaleByH)
  const canvasW = Math.round(room.width * s)
  const canvasH = Math.round(room.height * s)
  const canvasX = PADDING + Math.round((CONTENT_W - canvasW) / 2)

  const hasWarning = !!mainWarning
  const FOOTER_H = hasWarning ? 92 : 72
  const TOTAL_H = PADDING + HEADER_H + canvasH + 24 + FOOTER_H + PADDING

  const el = document.createElement('canvas')
  el.width = EXPORT_W * DPR
  el.height = TOTAL_H * DPR
  const ctx = el.getContext('2d')!
  ctx.scale(DPR, DPR)

  // ── Background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#0b0e11'
  ctx.fillRect(0, 0, EXPORT_W, TOTAL_H)

  let y = PADDING

  // ── Header ──────────────────────────────────────────────────────────────────
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'

  ctx.fillStyle = '#ffffff'
  ctx.font = '700 18px Inter, -apple-system, sans-serif'
  const headerTitle = layoutVersionName
    ? `방 가구 배치 · ${layoutVersionName}`
    : '방 가구 배치 시뮬레이터'
  ctx.fillText(headerTitle, PADDING, y)

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '400 12px Inter, sans-serif'
  ctx.fillText(
    new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }),
    PADDING,
    y + 26,
  )

  y += HEADER_H

  // ── Room canvas ─────────────────────────────────────────────────────────────

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(canvasX, y, canvasW, canvasH)

  // Grid lines
  const gridInterval = Math.max(room.width, room.height) <= 300 ? 50 : 100
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  for (let gx = gridInterval; gx < room.width; gx += gridInterval) {
    ctx.beginPath()
    ctx.moveTo(canvasX + gx * s, y)
    ctx.lineTo(canvasX + gx * s, y + canvasH)
    ctx.stroke()
  }
  for (let gy = gridInterval; gy < room.height; gy += gridInterval) {
    ctx.beginPath()
    ctx.moveTo(canvasX, y + gy * s)
    ctx.lineTo(canvasX + canvasW, y + gy * s)
    ctx.stroke()
  }

  // Fixed elements
  for (const el of fixedElements) {
    const color = FIXED_ELEMENT_COLORS[el.type]
    const ex = canvasX + el.xCm * s
    const ey = y + el.yCm * s
    const ew = el.widthCm * s
    const eh = el.depthCm * s
    const isWall = !!el.wallSide

    // Clearance zone
    const zone = getDoorClearanceZone(el)
    if (zone) {
      ctx.fillStyle = color + '20'
      ctx.fillRect(canvasX + zone.x * s, y + zone.y * s, zone.w * s, zone.h * s)
      ctx.setLineDash([4, 3])
      ctx.strokeStyle = color + '55'
      ctx.lineWidth = 1
      ctx.strokeRect(canvasX + zone.x * s, y + zone.y * s, zone.w * s, zone.h * s)
      ctx.setLineDash([])
    }

    // Element fill
    if (isWall) {
      ctx.fillStyle = color + 'cc'
    } else {
      ctx.fillStyle = color + '33'
      // Diagonal hatching
      ctx.save()
      ctx.beginPath()
      ctx.rect(ex, ey, ew, eh)
      ctx.clip()
      ctx.strokeStyle = color + '44'
      ctx.lineWidth = 1
      for (let d = -eh; d < ew + eh; d += 8) {
        ctx.beginPath()
        ctx.moveTo(ex + d, ey)
        ctx.lineTo(ex + d + eh, ey + eh)
        ctx.stroke()
      }
      ctx.restore()
    }
    ctx.fillRect(ex, ey, ew, eh)
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(ex, ey, ew, eh)

    // Label
    if (ew > 20 && eh > 10) {
      const labelPx = Math.min(10, Math.max(7, Math.min(ew, eh) / 2))
      ctx.fillStyle = isWall ? '#ffffff' : color
      ctx.font = `600 ${labelPx}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(el.name, ex + ew / 2, ey + eh / 2, ew - 4)
    }
  }

  // Furniture
  for (const item of furniture) {
    const { w, h } = getFurnitureDimensions(item)
    const fx = canvasX + item.x * s
    const fy = y + item.y * s
    const fw = w * s
    const fh = h * s

    ctx.fillStyle = item.color + 'aa'
    ctx.fillRect(fx, fy, fw, fh)
    ctx.strokeStyle = item.color
    ctx.lineWidth = 2
    ctx.strokeRect(fx, fy, fw, fh)

    if (fw > 28 && fh > 16) {
      const namePx = Math.min(14, Math.max(8, Math.min(fw, fh) / 3.5))
      ctx.fillStyle = '#ffffff'
      ctx.font = `700 ${namePx}px Inter, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(item.name, fx + fw / 2, fy + fh / 2, fw - 6)

      if (fw > 58 && fh > 38) {
        const sizePx = Math.max(7, namePx - 2)
        ctx.fillStyle = 'rgba(255,255,255,0.65)'
        ctx.font = `500 ${sizePx}px "IBM Plex Mono", monospace`
        ctx.fillText(
          `${w}×${h}cm`,
          fx + fw / 2,
          fy + fh / 2 + namePx + 2,
          fw - 6,
        )
      }
    }
  }

  // Room border
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(canvasX, y, canvasW, canvasH)

  // Room size label (bottom-right inside canvas)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.font = '11px "IBM Plex Mono", monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${room.width} × ${room.height}cm`, canvasX + canvasW - 8, y + canvasH - 6)

  y += canvasH + 24

  // ── Divider ─────────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING, y)
  ctx.lineTo(EXPORT_W - PADDING, y)
  ctx.stroke()
  y += 18

  // ── Footer ──────────────────────────────────────────────────────────────────

  // Occupancy %
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = '900 26px "IBM Plex Mono", monospace'
  ctx.fillStyle = status.color
  ctx.fillText(`${pct}%`, PADDING, y)

  // Status label
  ctx.font = '600 14px Inter, sans-serif'
  ctx.fillStyle = status.color
  ctx.fillText(status.label, PADDING + 72, y + 5)

  // Room + furniture info (right-aligned)
  ctx.font = '400 12px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.textAlign = 'right'
  ctx.fillText(
    `방 ${room.width}×${room.height}cm · 가구 ${furniture.length}개`,
    EXPORT_W - PADDING,
    y + 6,
  )

  // Warning line
  if (mainWarning) {
    y += 30
    ctx.font = '400 12px Inter, sans-serif'
    ctx.fillStyle = '#f7d04f'
    ctx.textAlign = 'left'
    ctx.fillText(`⚠ ${mainWarning.message}`, PADDING, y, CONTENT_W)
  }

  // Watermark
  ctx.font = '400 10px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.13)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText('생활계산소', EXPORT_W - PADDING, TOTAL_H - PADDING + 14)

  return new Promise<Blob>((resolve, reject) => {
    el.toBlob(
      blob => {
        if (blob) resolve(blob)
        else reject(new Error('이미지 생성 실패'))
      },
      'image/png',
    )
  })
}

// ─── Share / Download ─────────────────────────────────────────────────────────

export async function shareOrDownload(blob: Blob, fileName: string): Promise<void> {
  const file = new File([blob], fileName, { type: 'image/png' })

  try {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: '방 가구 배치',
        text: '방 가구 배치 시뮬레이터로 만든 레이아웃이에요.',
        files: [file],
      })
      return
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    // other error → fallback to download below
  }

  downloadBlob(blob, fileName)
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
