import { useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { FurnitureItem, Room } from '../types'
import type { SavedFurniture } from '../../../features/room-layout/saved-furniture/savedFurnitureTypes'
import type { SavedFurnitureCategory } from '../../../features/room-layout/saved-furniture/savedFurnitureTypes'
import {
  FURNITURE_PRESETS,
  FURNITURE_COLORS,
  FURNITURE_CATEGORIES,
  CATEGORY_LABELS,
  getFurniturePresetsByCategory,
  type FurnitureCategory,
} from '../data/presets'
import { getFurnitureDimensions, getWallClearance, getNearestFurnitureGap } from '../utils/geometry'
import { formatFurnitureSize, formatDistance } from '../utils/formatters'
import { FurnitureSizePasteInput } from './FurnitureSizePasteInput'
import { MyFurnitureTab, SavedFurnitureEditForm } from './MyFurnitureTab'
import { useSavedFurniture } from '../hooks/useSavedFurniture'
import { findSimilarSavedFurniture, SAVED_CATEGORY_LABELS, SAVED_CATEGORIES, savedFurnitureToCanvasItem } from '../../../features/room-layout/saved-furniture/savedFurnitureUtils'

const MIN_CLEARANCE_CM = 60

interface Props {
  room: Room
  furniture: FurnitureItem[]
  selectedId: string | null
  onAdd: (item: Omit<FurnitureItem, 'id' | 'x' | 'y'>) => void
  onUpdate: (id: string, updates: Partial<FurnitureItem>) => void
  onDelete: (id: string) => void
  onSelect: (id: string | null) => void
}

type AddTab = FurnitureCategory | 'my-furniture'
type PanelMode = 'list' | 'add' | 'custom' | 'edit-saved'

export function FurniturePanel({
  room,
  furniture,
  selectedId,
  onAdd,
  onUpdate,
  onDelete,
  onSelect,
}: Props) {
  const [mode, setMode] = useState<PanelMode>('list')
  const [activeTab, setActiveTab] = useState<AddTab>('bed')
  const [customForm, setCustomForm] = useState({ name: '', width: '', depth: '' })
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({})
  const [saveToMine, setSaveToMine] = useState(false)
  const [savedCategory, setSavedCategory] = useState<SavedFurnitureCategory>('custom')
  const [editingSaved, setEditingSaved] = useState<SavedFurniture | null>(null)

  const saved = useSavedFurniture()

  useEffect(() => {
    if (selectedId !== null) setMode('list')
  }, [selectedId])

  const selectedItem = furniture.find(f => f.id === selectedId)
  const nextColor = FURNITURE_COLORS[furniture.length % FURNITURE_COLORS.length]

  // Duplicate check for "내 가구에도 저장" in custom mode
  const w = parseInt(customForm.width) || 0
  const d = parseInt(customForm.depth) || 0
  const saveDuplicates = saveToMine && customForm.name.trim()
    ? findSimilarSavedFurniture(
        { name: customForm.name.trim(), widthMm: w * 10, depthMm: d * 10 },
        saved.list,
      )
    : []

  function handleAddPreset(preset: (typeof FURNITURE_PRESETS)[0]) {
    onAdd({
      name: preset.name,
      width: preset.width,
      depth: preset.depth,
      rotated: false,
      color: nextColor,
      showClearance: false,
    })
    setMode('list')
  }

  function handleAddFromSaved(f: SavedFurniture) {
    const base = savedFurnitureToCanvasItem(f)
    onAdd({
      ...base,
      rotated: false,
      color: nextColor,
      showClearance: false,
    })
    setMode('list')
  }

  function handleAddCustom() {
    const errs: Record<string, string> = {}
    if (!customForm.name.trim()) errs.name = '이름을 입력해주세요'
    if (!w || w <= 0) errs.width = '유효한 너비를 입력해주세요'
    if (!d || d <= 0) errs.depth = '유효한 깊이를 입력해주세요'
    setCustomErrors(errs)
    if (Object.keys(errs).length > 0) return

    onAdd({
      name: customForm.name.trim(),
      width: w,
      depth: d,
      rotated: false,
      color: nextColor,
      showClearance: false,
    })

    if (saveToMine) {
      saved.add({
        name: customForm.name.trim(),
        category: savedCategory,
        widthMm: w * 10,
        depthMm: d * 10,
      })
    }

    setCustomForm({ name: '', width: '', depth: '' })
    setCustomErrors({})
    setSaveToMine(false)
    setMode('list')
  }

  function handleEditSaved(f: SavedFurniture) {
    setEditingSaved(f)
    setMode('edit-saved')
  }

  function handleSaveEdit(updates: Partial<SavedFurniture>) {
    if (!editingSaved) return
    saved.update(editingSaved.id, updates)
    setEditingSaved(null)
    setMode('add')
    setActiveTab('my-furniture')
  }

  const inputStyle: CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--on-dark)',
    fontSize: '15px',
    padding: '10px 12px',
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
      {/* Selected furniture action bar */}
      {selectedItem && mode === 'list' && (
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--hairline)',
            backgroundColor: selectedItem.color + '15',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: selectedItem.color,
              flexShrink: 0,
            }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--on-dark)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {selectedItem.name}
          </span>
          <button
            onClick={() => onUpdate(selectedItem.id, { rotated: !selectedItem.rotated })}
            style={actionBtnStyle}
          >
            ↻ 회전
          </button>
          <button
            onClick={() => onUpdate(selectedItem.id, { showClearance: !selectedItem.showClearance })}
            style={{
              ...actionBtnStyle,
              backgroundColor: selectedItem.showClearance ? 'var(--primary)' : 'var(--surface-input)',
              color: selectedItem.showClearance ? 'var(--on-primary)' : 'var(--on-dark-mute)',
              borderColor: selectedItem.showClearance ? 'var(--primary)' : 'var(--hairline)',
            }}
          >
            간격
          </button>
          <button
            onClick={() => { onDelete(selectedItem.id); onSelect(null) }}
            style={{ ...actionBtnStyle, color: 'var(--danger)', borderColor: 'transparent' }}
          >
            삭제
          </button>
        </div>
      )}

      {/* Selected furniture detail */}
      {selectedItem && mode === 'list' && (
        <SelectedDetail room={room} item={selectedItem} furniture={furniture} />
      )}

      {/* Panel header */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: mode !== 'list' ? '1px solid var(--hairline)' : 'none',
        }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--on-dark)' }}>
          {mode === 'list'
            ? `가구 목록 (${furniture.length}개)`
            : mode === 'add'
              ? '가구 선택'
              : mode === 'custom'
                ? '직접 입력'
                : '내 가구 수정'}
        </span>
        {mode === 'list' ? (
          <button
            onClick={() => setMode('add')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            + 추가
          </button>
        ) : (
          <button
            onClick={() => { setMode('list'); setEditingSaved(null) }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--hairline)',
              backgroundColor: 'transparent',
              color: 'var(--on-dark-mute)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            취소
          </button>
        )}
      </div>

      {/* ── Add mode: category tabs + content ── */}
      {mode === 'add' && (
        <div>
          {/* Category chips including "내 가구" */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '0 16px 10px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {/* 내 가구 tab */}
            <button
              onClick={() => setActiveTab('my-furniture')}
              style={{
                padding: '5px 13px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${activeTab === 'my-furniture' ? 'var(--primary)' : 'var(--hairline)'}`,
                backgroundColor: activeTab === 'my-furniture' ? 'var(--primary)' : 'var(--surface-input)',
                color: activeTab === 'my-furniture' ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              ⭐ 내 가구
              {saved.list.length > 0 && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: activeTab === 'my-furniture' ? 'rgba(0,0,0,0.15)' : 'var(--surface-card)',
                    borderRadius: 9999,
                    padding: '1px 5px',
                  }}
                >
                  {saved.list.length}
                </span>
              )}
            </button>

            {/* Preset categories */}
            {FURNITURE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  padding: '5px 13px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${activeTab === cat ? 'var(--primary)' : 'var(--hairline)'}`,
                  backgroundColor: activeTab === cat ? 'var(--primary)' : 'var(--surface-input)',
                  color: activeTab === cat ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* My furniture tab content */}
          {activeTab === 'my-furniture' && (
            <MyFurnitureTab
              list={saved.list}
              onAddToCanvas={handleAddFromSaved}
              onEditRequest={handleEditSaved}
              onDelete={saved.remove}
              onClearAll={saved.clear}
              inputStyle={inputStyle}
            />
          )}

          {/* Preset grid for regular categories */}
          {activeTab !== 'my-furniture' && (
            <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {getFurniturePresetsByCategory(activeTab).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleAddPreset(preset)}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid var(--hairline)',
                    borderRadius: 8,
                    backgroundColor: 'var(--surface-input)',
                    color: 'var(--on-dark)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{preset.name}</div>
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: 2,
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-number)',
                    }}
                  >
                    {preset.width} × {preset.depth}cm
                  </div>
                </button>
              ))}
              <button
                onClick={() => setMode('custom')}
                style={{
                  padding: '10px 12px',
                  border: '1px dashed var(--hairline)',
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                  color: 'var(--on-dark-mute)',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600 }}>직접 입력</div>
                <div style={{ fontSize: '11px', marginTop: 2, color: 'var(--muted)' }}>
                  원하는 크기로
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Custom mode ── */}
      {mode === 'custom' && (
        <div style={{ padding: '12px 16px 16px' }}>
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
                가구 이름
              </label>
              <input
                type="text"
                value={customForm.name}
                onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))}
                placeholder="예: 내 침대"
                style={{
                  ...inputStyle,
                  borderColor: customErrors.name ? 'var(--danger)' : 'var(--hairline)',
                }}
              />
              {customErrors.name && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                  {customErrors.name}
                </p>
              )}
            </div>

            {/* Size paste input */}
            <FurnitureSizePasteInput
              onApply={(w, d) =>
                setCustomForm(p => ({ ...p, width: String(w), depth: String(d) }))
              }
            />

            {/* Width / Depth */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
                  너비 · W (cm)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customForm.width}
                  onChange={e => setCustomForm(p => ({ ...p, width: e.target.value }))}
                  placeholder="예: 120"
                  style={{
                    ...inputStyle,
                    borderColor: customErrors.width ? 'var(--danger)' : 'var(--hairline)',
                  }}
                />
                {customErrors.width && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                    {customErrors.width}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
                  깊이 · D (cm)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customForm.depth}
                  onChange={e => setCustomForm(p => ({ ...p, depth: e.target.value }))}
                  placeholder="예: 60"
                  style={{
                    ...inputStyle,
                    borderColor: customErrors.depth ? 'var(--danger)' : 'var(--hairline)',
                  }}
                />
                {customErrors.depth && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                    {customErrors.depth}
                  </p>
                )}
              </div>
            </div>

            {/* Dimension guidance */}
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>
              상품 페이지의 너비(W)와 깊이(D) 값을 입력하세요. 높이(H)는 2D 평면도에 사용하지 않아요.
            </p>

            {/* Save to My Furniture checkbox */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: saveToMine ? 'rgba(var(--primary-rgb,247,208,79),0.06)' : 'var(--surface-input)',
                border: `1px solid ${saveToMine ? 'var(--primary)' : 'var(--hairline)'}`,
                borderRadius: 8,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={saveToMine}
                  onChange={e => setSaveToMine(e.target.checked)}
                  style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-dark)' }}>
                  내 가구에도 저장
                </span>
              </label>

              {/* Category selector (shown when checkbox is checked) */}
              {saveToMine && (
                <div style={{ marginTop: 10 }}>
                  <p className="text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>카테고리</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {SAVED_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSavedCategory(cat)}
                        style={{
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-pill)',
                          border: `1px solid ${savedCategory === cat ? 'var(--primary)' : 'var(--hairline)'}`,
                          backgroundColor: savedCategory === cat ? 'var(--primary)' : 'transparent',
                          color: savedCategory === cat ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {SAVED_CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>

                  {/* Duplicate warning */}
                  {saveDuplicates.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: '#f7d04f' }}>
                      ⚠ 비슷한 가구가 이미 있어요: {saveDuplicates.map(f => f.name).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleAddCustom}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-button)',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              추가하기
            </button>
          </div>
        </div>
      )}

      {/* ── Edit saved furniture mode ── */}
      {mode === 'edit-saved' && editingSaved && (
        <SavedFurnitureEditForm
          f={editingSaved}
          list={saved.list}
          onSave={handleSaveEdit}
          onCancel={() => { setMode('add'); setActiveTab('my-furniture'); setEditingSaved(null) }}
          inputStyle={inputStyle}
        />
      )}

      {/* ── Furniture list ── */}
      {mode === 'list' && (
        <div>
          {furniture.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>아직 추가된 가구가 없어요</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                + 추가 버튼을 눌러 가구를 배치해보세요
              </p>
            </div>
          ) : (
            <div>
              {furniture.map(item => {
                const { w, h } = getFurnitureDimensions(item)
                const isSelected = item.id === selectedId
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(isSelected ? null : item.id)}
                    style={{
                      padding: '11px 16px',
                      borderTop: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? item.color + '12' : 'transparent',
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: 'var(--on-dark)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-number)' }}
                      >
                        {w}×{h}cm{item.rotated ? ' · 회전됨' : ''}
                      </p>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onDelete(item.id)
                        if (selectedId === item.id) onSelect(null)
                      }}
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
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const actionBtnStyle: CSSProperties = {
  padding: '5px 10px',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--hairline)',
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark-mute)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  flexShrink: 0,
}

// ─── Selected Detail Panel ─────────────────────────────────────────────────────

interface SelectedDetailProps {
  room: Room
  item: FurnitureItem
  furniture: FurnitureItem[]
}

function SelectedDetail({ room, item, furniture }: SelectedDetailProps) {
  const clearance = getWallClearance(room, item)
  const nearest = getNearestFurnitureGap(item, furniture)
  const { w, h } = getFurnitureDimensions(item)

  const sideColor = (gap: number) => {
    if (gap === 0) return 'var(--muted)'
    if (gap < MIN_CLEARANCE_CM) return '#f7d04f'
    return 'var(--on-dark-mute)'
  }

  const nearestWarning = nearest && nearest.gap > 0 && nearest.gap < MIN_CLEARANCE_CM
  const anyWallWarning =
    (clearance.left > 0 && clearance.left < MIN_CLEARANCE_CM) ||
    (clearance.right > 0 && clearance.right < MIN_CLEARANCE_CM) ||
    (clearance.top > 0 && clearance.top < MIN_CLEARANCE_CM) ||
    (clearance.bottom > 0 && clearance.bottom < MIN_CLEARANCE_CM)

  return (
    <div
      style={{
        padding: '10px 16px 12px',
        borderBottom: '1px solid var(--hairline)',
        backgroundColor: 'rgba(0,0,0,0.12)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span
          style={{
            fontFamily: 'var(--font-number)',
            fontWeight: 700,
            fontSize: '14px',
            color: 'var(--on-dark)',
          }}
        >
          {formatFurnitureSize(item)}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
          {w * h < 10000
            ? `${Math.round(w * h / 100) / 100}m²`
            : `${(w * h / 10000).toFixed(2)}m²`}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4, marginBottom: nearest ? 8 : 0 }}>
        {(
          [
            { icon: '←', val: clearance.left },
            { icon: '→', val: clearance.right },
            { icon: '↑', val: clearance.top },
            { icon: '↓', val: clearance.bottom },
          ] as const
        ).map(({ icon, val }) => (
          <div
            key={icon}
            style={{
              textAlign: 'center',
              padding: '4px 2px',
              borderRadius: 5,
              backgroundColor: 'var(--surface-input)',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{icon}</div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-number)',
                fontWeight: 600,
                color: sideColor(val),
                marginTop: 1,
              }}
            >
              {formatDistance(val)}
            </div>
          </div>
        ))}
      </div>

      {nearest && nearest.gap > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 8px',
            borderRadius: 5,
            backgroundColor: nearestWarning ? 'rgba(247,208,79,0.08)' : 'var(--surface-input)',
            border: `1px solid ${nearestWarning ? 'rgba(247,208,79,0.2)' : 'var(--hairline)'}`,
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--muted)', flexShrink: 0 }}>가장 가까운 가구</span>
          <span
            style={{
              flex: 1,
              fontSize: '12px',
              fontWeight: 600,
              color: nearestWarning ? '#f7d04f' : 'var(--on-dark-mute)',
              fontFamily: 'var(--font-number)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {nearest.item.name}까지 {formatDistance(nearest.gap)}
          </span>
          {nearestWarning && <span style={{ fontSize: '11px', flexShrink: 0 }}>⚠</span>}
        </div>
      )}

      {(anyWallWarning || nearestWarning) && (
        <p style={{ fontSize: '11px', color: '#f7d04f', marginTop: 6, lineHeight: 1.4 }}>
          ⚠ 60cm 미만 통로가 있어요. 실제 생활에서 좁게 느껴질 수 있어요.
        </p>
      )}
    </div>
  )
}
