import { useRef, useEffect, useState } from 'react'
import type { Room, FurnitureItem, FixedElement, ClearanceWarning } from '../types'
import {
  getFurnitureDimensions,
  getWallClearance,
  getNearestFurnitureGap,
  getDoorClearanceZone,
  FIXED_ELEMENT_COLORS,
} from '../utils/geometry'
import { formatFurnitureSize, formatDistance } from '../utils/formatters'
import type { CanvasDisplayOptions } from '../utils/canvasDisplay'
import { getDefaultCanvasDisplayOptions } from '../utils/canvasDisplay'

const CLEARANCE_CM = 60
const MIN_CLEARANCE_CM = 60

interface Props {
  room: Room
  furniture: FurnitureItem[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
  displayOptions?: CanvasDisplayOptions
  readonly?: boolean
  fixedElements?: FixedElement[]
  onFixedMove?: (id: string, xCm: number, yCm: number) => void
  warnings?: ClearanceWarning[]
}

export function RoomCanvas({
  room,
  furniture,
  selectedId,
  onSelect,
  onMove,
  displayOptions = getDefaultCanvasDisplayOptions(),
  readonly = false,
  fixedElements = [],
  onFixedMove,
  warnings = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(320)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth || 320)
    const obs = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const scale = containerWidth / room.width
  const canvasHeight = Math.round(room.height * scale)

  const gridInterval = Math.max(room.width, room.height) <= 300 ? 50 : 100
  const xGridLines: number[] = []
  const yGridLines: number[] = []
  for (let v = gridInterval; v < room.width; v += gridInterval) xGridLines.push(v)
  for (let v = gridInterval; v < room.height; v += gridInterval) yGridLines.push(v)

  // Compute which furniture items have active warnings
  const warnedFurnitureIds = new Set<string>()
  if (warnings.length > 0) {
    for (const f of furniture) {
      if (warnings.some(w => w.id.includes(f.id))) {
        warnedFurnitureIds.add(f.id)
      }
    }
  }

  return (
    <div
      ref={containerRef}
      onClick={() => !readonly && onSelect(null)}
      style={{
        width: '100%',
        height: canvasHeight,
        position: 'relative',
        backgroundColor: '#0d1117',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '2px solid var(--hairline)',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Grid lines */}
      {xGridLines.map(v => (
        <div
          key={`x-${v}`}
          style={{
            position: 'absolute',
            left: v * scale,
            top: 0,
            width: 1,
            height: '100%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
      ))}
      {yGridLines.map(v => (
        <div
          key={`y-${v}`}
          style={{
            position: 'absolute',
            top: v * scale,
            left: 0,
            height: 1,
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Dimension label */}
      <div
        style={{
          position: 'absolute',
          bottom: 6,
          right: 8,
          fontSize: '10px',
          color: 'rgba(255,255,255,0.2)',
          fontFamily: 'var(--font-number)',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        {room.width}×{room.height}cm
      </div>

      {/* Fixed elements */}
      {fixedElements.map(el => (
        <FixedElementRect
          key={el.id}
          el={el}
          scale={scale}
          room={room}
          readonly={readonly}
          showFixedElementLabels={displayOptions.showFixedElementLabels}
          onMove={onFixedMove}
        />
      ))}

      {/* Furniture items */}
      {furniture.map(item => (
        <FurnitureRect
          key={item.id}
          item={item}
          scale={scale}
          room={room}
          isSelected={item.id === selectedId}
          showClearance={displayOptions.showSpacingGuides || item.showClearance}
          showFurnitureSizes={displayOptions.showFurnitureSizes}
          hasWarning={warnedFurnitureIds.has(item.id)}
          showWarningIcon={displayOptions.showWarningIcons}
          readonly={readonly}
          onSelect={onSelect}
          onMove={onMove}
        />
      ))}

      {/* Measurement overlay for selected furniture */}
      {!readonly && selectedId && (
        <MeasurementOverlay
          room={room}
          furniture={furniture}
          selectedId={selectedId}
          scale={scale}
          containerWidth={containerWidth}
          canvasHeight={canvasHeight}
        />
      )}
    </div>
  )
}

// ─── Measurement Overlay ──────────────────────────────────────────────────

interface MeasurementOverlayProps {
  room: Room
  furniture: FurnitureItem[]
  selectedId: string
  scale: number
  containerWidth: number
  canvasHeight: number
}

function MeasurementOverlay({
  room,
  furniture,
  selectedId,
  scale,
  containerWidth,
  canvasHeight,
}: MeasurementOverlayProps) {
  const selected = furniture.find(f => f.id === selectedId)
  if (!selected) return null

  const { w: sw, h: sh } = getFurnitureDimensions(selected)
  const clearance = getWallClearance(room, selected)
  const nearest = getNearestFurnitureGap(selected, furniture)

  const fx = selected.x * scale
  const fy = selected.y * scale
  const fw = sw * scale
  const fh = sh * scale
  const fCenterX = fx + fw / 2
  const fCenterY = fy + fh / 2
  const rw = room.width * scale
  const rh = room.height * scale

  // Pick one horizontal line (nearest wall) + one vertical line (nearest wall)
  const hSide: 'left' | 'right' =
    clearance.left > 0 && (clearance.right <= 0 || clearance.left <= clearance.right)
      ? 'left'
      : 'right'
  const vSide: 'top' | 'bottom' =
    clearance.top > 0 && (clearance.bottom <= 0 || clearance.top <= clearance.bottom)
      ? 'top'
      : 'bottom'

  const showHLine = clearance[hSide] > 0
  const showVLine = clearance[vSide] > 0

  return (
    <svg
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
      width={containerWidth}
      height={canvasHeight}
    >
      {/* Horizontal wall measurement line */}
      {showHLine && (
        <MeasureLine
          x1={hSide === 'left' ? 0 : fx + fw}
          y1={fCenterY}
          x2={hSide === 'left' ? fx : rw}
          y2={fCenterY}
          label={formatDistance(clearance[hSide])}
          isWarning={clearance[hSide] < MIN_CLEARANCE_CM}
          orientation="horizontal"
        />
      )}

      {/* Vertical wall measurement line */}
      {showVLine && (
        <MeasureLine
          x1={fCenterX}
          y1={vSide === 'top' ? 0 : fy + fh}
          x2={fCenterX}
          y2={vSide === 'top' ? fy : rh}
          label={formatDistance(clearance[vSide])}
          isWarning={clearance[vSide] < MIN_CLEARANCE_CM}
          orientation="vertical"
        />
      )}

      {/* Nearest furniture gap line */}
      {nearest && nearest.gap > 0 && (
        <FurnitureGapLine
          selected={selected}
          nearest={nearest}
          scale={scale}
        />
      )}
    </svg>
  )
}

// ─── MeasureLine ─────────────────────────────────────────────────────────

interface MeasureLineProps {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  isWarning: boolean
  orientation: 'horizontal' | 'vertical'
}

function MeasureLine({ x1, y1, x2, y2, label, isWarning, orientation }: MeasureLineProps) {
  const stroke = isWarning ? '#f7d04f' : 'rgba(255,255,255,0.35)'
  const textFill = isWarning ? '#f7d04f' : 'rgba(255,255,255,0.75)'
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const bgW = label.length * 6.5 + 8
  const bgH = 13

  // Only draw if line is long enough to show label
  const lineLen = Math.abs(orientation === 'horizontal' ? x2 - x1 : y2 - y1)
  if (lineLen < 14) return null

  return (
    <g>
      {/* Main line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={stroke}
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      {/* End ticks */}
      {orientation === 'horizontal' ? (
        <>
          <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} stroke={stroke} strokeWidth="1" />
          <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} stroke={stroke} strokeWidth="1" />
        </>
      ) : (
        <>
          <line x1={x1 - 4} y1={y1} x2={x1 + 4} y2={y1} stroke={stroke} strokeWidth="1" />
          <line x1={x2 - 4} y1={y2} x2={x2 + 4} y2={y2} stroke={stroke} strokeWidth="1" />
        </>
      )}
      {/* Label background */}
      <rect
        x={midX - bgW / 2}
        y={midY - bgH / 2}
        width={bgW}
        height={bgH}
        rx="3"
        fill="rgba(13,17,23,0.85)"
      />
      {/* Label text */}
      <text
        x={midX}
        y={midY + 1}
        fill={textFill}
        fontSize="9"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight="500"
      >
        {label}
      </text>
    </g>
  )
}

// ─── FurnitureGapLine ─────────────────────────────────────────────────────

interface FurnitureGapLineProps {
  selected: FurnitureItem
  nearest: ReturnType<typeof getNearestFurnitureGap> & {}
  scale: number
}

function FurnitureGapLine({ selected, nearest, scale }: FurnitureGapLineProps) {
  if (!nearest) return null

  const { w: sw, h: sh } = getFurnitureDimensions(selected)
  const { w: tw, h: th } = getFurnitureDimensions(nearest.item)
  const t = nearest.item

  let x1: number, y1: number, x2: number, y2: number

  if (nearest.direction === 'right') {
    const yCenter =
      (Math.max(selected.y, t.y) + Math.min(selected.y + sh, t.y + th)) / 2
    x1 = (selected.x + sw) * scale
    x2 = t.x * scale
    y1 = y2 = yCenter * scale
  } else if (nearest.direction === 'left') {
    const yCenter =
      (Math.max(selected.y, t.y) + Math.min(selected.y + sh, t.y + th)) / 2
    x1 = selected.x * scale
    x2 = (t.x + tw) * scale
    y1 = y2 = yCenter * scale
  } else if (nearest.direction === 'below') {
    const xCenter =
      (Math.max(selected.x, t.x) + Math.min(selected.x + sw, t.x + tw)) / 2
    x1 = x2 = xCenter * scale
    y1 = (selected.y + sh) * scale
    y2 = t.y * scale
  } else {
    // above
    const xCenter =
      (Math.max(selected.x, t.x) + Math.min(selected.x + sw, t.x + tw)) / 2
    x1 = x2 = xCenter * scale
    y1 = selected.y * scale
    y2 = (t.y + th) * scale
  }

  const isWarning = nearest.gap < MIN_CLEARANCE_CM
  const label = formatDistance(nearest.gap)
  const orientation = nearest.direction === 'left' || nearest.direction === 'right'
    ? 'horizontal'
    : 'vertical'

  return (
    <MeasureLine
      x1={x1} y1={y1} x2={x2} y2={y2}
      label={label}
      isWarning={isWarning}
      orientation={orientation}
    />
  )
}

// ─── FixedElementRect ────────────────────────────────────────────────────────

interface FixedElementRectProps {
  el: FixedElement
  scale: number
  room: Room
  readonly: boolean
  showFixedElementLabels: boolean
  onMove?: (id: string, xCm: number, yCm: number) => void
}

function FixedElementRect({ el, scale, room, readonly, showFixedElementLabels, onMove }: FixedElementRectProps) {
  const color = FIXED_ELEMENT_COLORS[el.type]
  const isWall = !!el.wallSide
  const clearanceZone = getDoorClearanceZone(el)
  const draggable = !readonly && !!onMove

  const dragRef = useRef<{
    startPointerX: number
    startPointerY: number
    startXCm: number
    startYCm: number
  } | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    if (!draggable) return
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startXCm: el.xCm,
      startYCm: el.yCm,
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !onMove) return
    const dx = (e.clientX - dragRef.current.startPointerX) / scale
    const dy = (e.clientY - dragRef.current.startPointerY) / scale
    let newX = dragRef.current.startXCm + dx
    let newY = dragRef.current.startYCm + dy

    if (el.wallSide === 'top' || el.wallSide === 'bottom') {
      newX = Math.max(0, Math.min(room.width - el.widthCm, newX))
      newY = dragRef.current.startYCm
    } else if (el.wallSide === 'left' || el.wallSide === 'right') {
      newX = dragRef.current.startXCm
      newY = Math.max(0, Math.min(room.height - el.depthCm, newY))
    } else {
      newX = Math.max(0, Math.min(room.width - el.widthCm, newX))
      newY = Math.max(0, Math.min(room.height - el.depthCm, newY))
    }
    onMove(el.id, newX, newY)
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  const pxW = el.widthCm * scale
  const pxH = el.depthCm * scale
  const showLabel = showFixedElementLabels && pxW > 24 && pxH > 14

  // Minimum touch target: 32px. Expand outward from the visual center.
  const MIN_TOUCH = 32
  const hitW = Math.max(pxW, MIN_TOUCH)
  const hitH = Math.max(pxH, MIN_TOUCH)
  const hitOffX = (hitW - pxW) / 2
  const hitOffY = (hitH - pxH) / 2

  return (
    <>
      {/* Door clearance zone */}
      {clearanceZone && (
        <div
          style={{
            position: 'absolute',
            left: clearanceZone.x * scale,
            top: clearanceZone.y * scale,
            width: clearanceZone.w * scale,
            height: clearanceZone.h * scale,
            backgroundColor: color + '18',
            border: `1px dashed ${color}55`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Transparent touch-target wrapper (min 32×32px) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: el.xCm * scale - hitOffX,
          top: el.yCm * scale - hitOffY,
          width: hitW,
          height: hitH,
          cursor: draggable ? 'grab' : 'default',
          zIndex: 2,
          touchAction: 'none',
        }}
      >
        {/* Visual element — actual size, centred in the touch area */}
        <div
          style={{
            position: 'absolute',
            left: hitOffX,
            top: hitOffY,
            width: pxW,
            height: pxH,
            backgroundColor: isWall ? color + 'cc' : color + '30',
            backgroundImage: isWall
              ? 'none'
              : `repeating-linear-gradient(45deg, ${color}28 0, ${color}28 3px, transparent 3px, transparent 9px)`,
            border: `2px solid ${color}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: isWall ? 2 : 3,
            padding: '2px 3px',
          }}
        >
          {showLabel && (
            <span
              style={{
                fontSize: Math.min(11, Math.max(7, Math.min(pxW, pxH) / 2.5)),
                color: isWall ? '#fff' : color,
                fontWeight: 700,
                textAlign: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                textShadow: isWall ? '0 1px 3px rgba(0,0,0,0.9)' : 'none',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.25,
              }}
            >
              {el.name}
            </span>
          )}
        </div>
      </div>
    </>
  )
}

// ─── FurnitureRect ────────────────────────────────────────────────────────

interface FurnitureRectProps {
  item: FurnitureItem
  scale: number
  room: Room
  isSelected: boolean
  showClearance: boolean
  showFurnitureSizes: boolean
  hasWarning: boolean
  showWarningIcon: boolean
  readonly: boolean
  onSelect: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
}

function FurnitureRect({
  item,
  scale,
  room,
  isSelected,
  showClearance,
  showFurnitureSizes,
  hasWarning,
  showWarningIcon,
  readonly,
  onSelect,
  onMove,
}: FurnitureRectProps) {
  const { w, h } = getFurnitureDimensions(item)
  const dragRef = useRef<{
    startPointerX: number
    startPointerY: number
    startItemX: number
    startItemY: number
  } | null>(null)

  const cx = Math.max(0, item.x - CLEARANCE_CM)
  const cy = Math.max(0, item.y - CLEARANCE_CM)
  const cRight = Math.min(room.width, item.x + w + CLEARANCE_CM)
  const cBottom = Math.min(room.height, item.y + h + CLEARANCE_CM)
  const cw = cRight - cx
  const ch = cBottom - cy

  const pxW = w * scale
  const pxH = h * scale

  // Size label: show when explicitly enabled or the item is selected
  const showSizeLabel = (showFurnitureSizes || isSelected) && pxW > 58 && pxH > 42
  const showNameOnly = pxW > 28 && pxH > 18

  const nameFontSize = Math.min(13, Math.max(7, Math.min(w, h) * scale / 5))
  const sizeFontSize = Math.max(7, nameFontSize - 1.5)

  function handlePointerDown(e: React.PointerEvent) {
    if (readonly) return
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startItemX: item.x,
      startItemY: item.y,
    }
    onSelect(item.id)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return
    const dx = (e.clientX - dragRef.current.startPointerX) / scale
    const dy = (e.clientY - dragRef.current.startPointerY) / scale
    const { w: curW, h: curH } = getFurnitureDimensions(item)
    const newX = Math.max(0, Math.min(room.width - curW, dragRef.current.startItemX + dx))
    const newY = Math.max(0, Math.min(room.height - curH, dragRef.current.startItemY + dy))
    onMove(item.id, newX, newY)
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  return (
    <>
      {showClearance && (
        <div
          style={{
            position: 'absolute',
            left: cx * scale,
            top: cy * scale,
            width: cw * scale,
            height: ch * scale,
            backgroundColor: item.color + '14',
            border: `1px dashed ${item.color}40`,
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: item.x * scale,
          top: item.y * scale,
          width: pxW,
          height: pxH,
          backgroundColor: item.color + (isSelected ? 'dd' : '88'),
          border: `2px solid ${item.color}`,
          borderRadius: 3,
          cursor: readonly ? 'default' : 'grab',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          overflow: 'hidden',
          zIndex: isSelected ? 10 : 2,
          boxShadow: isSelected
            ? `0 0 0 2px rgba(255,255,255,0.6), 0 0 0 4px ${item.color}80`
            : 'none',
          touchAction: 'none',
          transition: 'box-shadow 0.15s',
          padding: '2px 3px',
        }}
      >
        {/* Warning icon badge */}
        {hasWarning && showWarningIcon && (
          <div
            style={{
              position: 'absolute',
              top: 2,
              right: 3,
              fontSize: '9px',
              color: '#f7d04f',
              lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            ⚠
          </div>
        )}

        {showNameOnly && (
          <span
            style={{
              fontSize: nameFontSize,
              color: '#fff',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.25,
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </span>
        )}
        {showSizeLabel && (
          <span
            style={{
              fontSize: sizeFontSize,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 500,
              textAlign: 'center',
              lineHeight: 1.2,
              pointerEvents: 'none',
              userSelect: 'none',
              textShadow: '0 1px 2px rgba(0,0,0,0.9)',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {formatFurnitureSize(item)}
          </span>
        )}
      </div>
    </>
  )
}
