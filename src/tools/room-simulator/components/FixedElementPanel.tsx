import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { FixedElement, FixedElementType, Room, WallSide } from '../types'
import {
  FIXED_ELEMENT_COLORS,
  FIXED_ELEMENT_LABELS,
  WALL_SIDE_LABELS,
  makeWallElement,
  makeFloorElement,
} from '../utils/geometry'

interface Props {
  room: Room
  fixedElements: FixedElement[]
  onAdd: (el: Omit<FixedElement, 'id'>) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}

type PanelMode = 'list' | 'add'

const WALL_TYPES: FixedElementType[] = ['door', 'window', 'balconyDoor']
const FLOOR_TYPES: FixedElementType[] = ['builtInCloset', 'column', 'unavailableArea']
const ALL_TYPES: FixedElementType[] = [...WALL_TYPES, ...FLOOR_TYPES]

const DEFAULTS: Record<FixedElementType, { openingCm?: number; widthCm?: number; depthCm?: number }> = {
  door:            { openingCm: 80 },
  window:          { openingCm: 120 },
  balconyDoor:     { openingCm: 80 },
  builtInCloset:   { widthCm: 180, depthCm: 60 },
  column:          { widthCm: 30, depthCm: 30 },
  unavailableArea: { widthCm: 100, depthCm: 100 },
}

function getOpeningLabel(el: FixedElement): string {
  const isWall = WALL_TYPES.includes(el.type)
  if (!isWall) return `${el.widthCm}×${el.depthCm}cm`
  const opening = (el.wallSide === 'top' || el.wallSide === 'bottom') ? el.widthCm : el.depthCm
  return `${WALL_SIDE_LABELS[el.wallSide!]} · ${opening}cm`
}

export function FixedElementPanel({ room, fixedElements, onAdd, onDelete, onRename }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<PanelMode>('list')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [addType, setAddType] = useState<FixedElementType>('door')
  const [addWallSide, setAddWallSide] = useState<WallSide>('bottom')
  const [addWidth, setAddWidth] = useState('80')
  const [addDepth, setAddDepth] = useState('60')

  function handleTypeChange(type: FixedElementType) {
    setAddType(type)
    const d = DEFAULTS[type]
    setAddWidth(String(d.openingCm ?? d.widthCm ?? 80))
    setAddDepth(String(d.depthCm ?? 60))
  }

  function handleAdd() {
    const isWall = WALL_TYPES.includes(addType)
    const name = FIXED_ELEMENT_LABELS[addType]
    if (isWall) {
      const opening = Math.max(30, Math.min(room.width, parseInt(addWidth) || 80))
      onAdd(makeWallElement(room, addWallSide, opening, addType, name))
    } else {
      const w = Math.max(10, Math.min(room.width, parseInt(addWidth) || 100))
      const d = Math.max(10, Math.min(room.height, parseInt(addDepth) || 60))
      onAdd(makeFloorElement(room, w, d, addType, name))
    }
    setMode('list')
  }

  const isWallType = WALL_TYPES.includes(addType)

  const inputStyle: CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--on-dark)',
    fontSize: '14px',
    fontFamily: 'var(--font-number)',
    padding: '8px 10px',
    width: '100%',
    outline: 'none',
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => { setExpanded(v => !v); setMode('list') }}
        style={{
          padding: '11px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid var(--hairline)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--on-dark)' }}>
            방 구조 요소
          </span>
          {fixedElements.length > 0 && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'var(--surface-input)',
                color: 'var(--on-dark-mute)',
                borderRadius: 9999,
                padding: '1px 7px',
              }}
            >
              {fixedElements.length}
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {!expanded && (
        <div style={{ padding: '6px 16px 10px' }}>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            문·창문·붙박이장 등 방 구조 요소를 추가하세요
          </p>
        </div>
      )}

      {expanded && (
        <>
          {/* List mode */}
          {mode === 'list' && (
            <div>
              {fixedElements.length === 0 ? (
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>추가된 구조 요소가 없어요</p>
                </div>
              ) : (
                fixedElements.map(el => (
                  <div
                    key={el.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: FIXED_ELEMENT_COLORS[el.type],
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {renamingId === el.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={() => {
                            const trimmed = renameValue.trim()
                            if (trimmed) onRename(el.id, trimmed)
                            setRenamingId(null)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const trimmed = renameValue.trim()
                              if (trimmed) onRename(el.id, trimmed)
                              setRenamingId(null)
                            }
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onClick={e => e.stopPropagation()}
                          style={{
                            ...inputStyle,
                            padding: '3px 6px',
                            fontSize: '13px',
                            width: '100%',
                          }}
                        />
                      ) : (
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--on-dark)', cursor: 'text' }}
                          onClick={e => {
                            e.stopPropagation()
                            setRenameValue(el.name)
                            setRenamingId(el.id)
                          }}
                          title="탭하여 이름 변경"
                        >
                          {el.name}
                        </p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-number)' }}>
                        {getOpeningLabel(el)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(el.id)}
                      style={{
                        color: 'var(--muted)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        fontSize: '18px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
              <div style={{ padding: '10px 16px' }}>
                <button
                  onClick={e => { e.stopPropagation(); setMode('add') }}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: 'var(--radius-button)',
                    border: '1px dashed var(--hairline)',
                    backgroundColor: 'transparent',
                    color: 'var(--on-dark-mute)',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  + 구조 요소 추가
                </button>
              </div>
            </div>
          )}

          {/* Add mode */}
          {mode === 'add' && (
            <div style={{ padding: '12px 16px 16px' }}>
              {/* Type chips */}
              <p className="text-xs mb-2" style={{ color: 'var(--on-dark-mute)' }}>종류</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {ALL_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-pill)',
                      border: `1px solid ${addType === type ? FIXED_ELEMENT_COLORS[type] : 'var(--hairline)'}`,
                      backgroundColor: addType === type ? FIXED_ELEMENT_COLORS[type] + '22' : 'var(--surface-input)',
                      color: addType === type ? FIXED_ELEMENT_COLORS[type] : 'var(--on-dark-mute)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {FIXED_ELEMENT_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Wall side selector */}
              {isWallType && (
                <div style={{ marginBottom: 12 }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--on-dark-mute)' }}>벽 위치</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {(['top', 'bottom', 'left', 'right'] as WallSide[]).map(side => (
                      <button
                        key={side}
                        onClick={() => setAddWallSide(side)}
                        style={{
                          padding: '7px 4px',
                          borderRadius: 6,
                          border: `1px solid ${addWallSide === side ? 'var(--primary)' : 'var(--hairline)'}`,
                          backgroundColor: addWallSide === side ? 'var(--primary)' : 'var(--surface-input)',
                          color: addWallSide === side ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {WALL_SIDE_LABELS[side]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dimensions */}
              <div style={{ display: 'grid', gridTemplateColumns: isWallType ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
                    {isWallType ? '너비 (cm)' : '가로 (cm)'}
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={addWidth}
                    onChange={e => setAddWidth(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {!isWallType && (
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
                      세로 (cm)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={addDepth}
                      onChange={e => setAddDepth(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setMode('list')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-button)',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'transparent',
                    color: 'var(--on-dark-mute)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleAdd}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: 'var(--radius-button)',
                    border: 'none',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--on-primary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  추가하기
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
