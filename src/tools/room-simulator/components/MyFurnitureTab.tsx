import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { SavedFurniture, SavedFurnitureCategory } from '../../../features/room-layout/saved-furniture/savedFurnitureTypes'
import {
  SAVED_CATEGORY_LABELS,
  SAVED_CATEGORIES,
  formatSavedFurnitureSize,
  findSimilarSavedFurniture,
} from '../../../features/room-layout/saved-furniture/savedFurnitureUtils'

interface Props {
  list: SavedFurniture[]
  onAddToCanvas: (f: SavedFurniture) => void
  onEditRequest: (f: SavedFurniture) => void
  onDelete: (id: string) => void
  onClearAll: () => void
  inputStyle: CSSProperties
}

export function MyFurnitureTab({
  list,
  onAddToCanvas,
  onEditRequest,
  onDelete,
  onClearAll,
  inputStyle,
}: Props) {
  const [filterCat, setFilterCat] = useState<SavedFurnitureCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  if (list.length === 0) {
    return (
      <div style={{ padding: '28px 16px', textAlign: 'center' }}>
        <p className="text-sm" style={{ color: 'var(--on-dark)', fontWeight: 600, marginBottom: 6 }}>
          저장된 가구가 없어요
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          자주 쓰는 책상, 침대, 선반 등을 저장해 두면<br />
          다시 치수를 입력하지 않아도 돼요.
        </p>
        <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
          ↓ 직접 입력에서 <strong style={{ color: 'var(--on-dark-mute)' }}>내 가구에도 저장</strong>을 체크하세요
        </p>
      </div>
    )
  }

  const usedCats = SAVED_CATEGORIES.filter(c => list.some(f => f.category === c))

  const filtered = list.filter(f => {
    if (filterCat !== 'all' && f.category !== filterCat) return false
    if (search.trim() && !f.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Search */}
      <div style={{ padding: '0 16px 10px' }}>
        <input
          type="text"
          placeholder="이름 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            fontSize: '13px',
            padding: '8px 12px',
          }}
        />
      </div>

      {/* Category filter */}
      {usedCats.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '0 16px 10px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {(['all', ...usedCats] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: '4px 11px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${filterCat === cat ? 'var(--primary)' : 'var(--hairline)'}`,
                backgroundColor: filterCat === cat ? 'var(--primary)' : 'var(--surface-input)',
                color: filterCat === cat ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {cat === 'all' ? '전체' : SAVED_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      )}

      {/* Empty search result */}
      {filtered.length === 0 && (
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>검색 결과가 없어요</p>
        </div>
      )}

      {/* Furniture grid */}
      {filtered.length > 0 && (
        <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {filtered.map(f => (
            <SavedFurnitureCard
              key={f.id}
              f={f}
              isConfirmingDelete={confirmDeleteId === f.id}
              onAdd={() => onAddToCanvas(f)}
              onEdit={() => onEditRequest(f)}
              onDeleteRequest={() => setConfirmDeleteId(f.id)}
              onDeleteConfirm={() => {
                onDelete(f.id)
                setConfirmDeleteId(null)
              }}
              onDeleteCancel={() => setConfirmDeleteId(null)}
            />
          ))}
        </div>
      )}

      {/* Clear all */}
      <div
        style={{
          padding: '12px 16px 0',
          borderTop: '1px solid var(--hairline)',
          marginTop: 14,
        }}
      >
        {confirmClearAll ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <p className="text-xs" style={{ color: '#f76f6f', flex: 1 }}>
              저장된 가구 {list.length}개를 모두 삭제할까요?
            </p>
            <button
              onClick={() => { onClearAll(); setConfirmClearAll(false) }}
              style={dangerSmallBtn}
            >
              삭제
            </button>
            <button
              onClick={() => setConfirmClearAll(false)}
              style={ghostSmallBtn}
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClearAll(true)}
            style={{ ...ghostSmallBtn, fontSize: '11px', color: 'var(--muted)' }}
          >
            전체 삭제
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Saved Furniture Card ──────────────────────────────────────────────────────

interface CardProps {
  f: SavedFurniture
  isConfirmingDelete: boolean
  onAdd: () => void
  onEdit: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function SavedFurnitureCard({
  f,
  isConfirmingDelete,
  onAdd,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: CardProps) {
  return (
    <div
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 8,
        backgroundColor: 'var(--surface-input)',
        overflow: 'hidden',
      }}
    >
      {isConfirmingDelete ? (
        <div style={{ padding: '10px 10px 12px' }}>
          <p style={{ fontSize: '12px', color: '#f76f6f', marginBottom: 8, lineHeight: 1.4 }}>
            <strong>{f.name}</strong>을(를) 삭제할까요?
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onDeleteConfirm} style={{ ...dangerSmallBtn, flex: 1 }}>삭제</button>
            <button onClick={onDeleteCancel} style={{ ...ghostSmallBtn, flex: 1 }}>취소</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ padding: '10px 10px 8px' }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--on-dark)',
                marginBottom: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {f.name}
            </p>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                fontFamily: 'var(--font-number)',
              }}
            >
              {SAVED_CATEGORY_LABELS[f.category]} · {formatSavedFurnitureSize(f)}
            </p>
            {f.note && (
              <p
                style={{
                  fontSize: '10px',
                  color: 'var(--muted)',
                  marginTop: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.note}
              </p>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <button
              onClick={onAdd}
              style={{
                flex: 1,
                padding: '7px 0',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              추가
            </button>
            <button
              onClick={onEdit}
              style={{
                padding: '7px 10px',
                border: 'none',
                borderLeft: '1px solid var(--hairline)',
                backgroundColor: 'transparent',
                color: 'var(--on-dark-mute)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ✎
            </button>
            <button
              onClick={onDeleteRequest}
              style={{
                padding: '7px 10px',
                border: 'none',
                borderLeft: '1px solid var(--hairline)',
                backgroundColor: 'transparent',
                color: 'var(--muted)',
                fontSize: '14px',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Inline Edit Form ──────────────────────────────────────────────────────────

interface EditFormProps {
  f: SavedFurniture
  list: SavedFurniture[]
  onSave: (updates: Partial<SavedFurniture>) => void
  onCancel: () => void
  inputStyle: CSSProperties
}

export function SavedFurnitureEditForm({ f, list, onSave, onCancel, inputStyle }: EditFormProps) {
  const [name, setName] = useState(f.name)
  const [category, setCategory] = useState<SavedFurnitureCategory>(f.category)
  const [width, setWidth] = useState(String(parseFloat((f.widthMm / 10).toFixed(1))))
  const [depth, setDepth] = useState(String(parseFloat((f.depthMm / 10).toFixed(1))))
  const [height, setHeight] = useState(f.heightMm ? String(parseFloat((f.heightMm / 10).toFixed(1))) : '')
  const [note, setNote] = useState(f.note ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const duplicates = findSimilarSavedFurniture(
    { name, widthMm: parseFloat(width) * 10, depthMm: parseFloat(depth) * 10 },
    list,
    f.id,
  )

  function handleSave() {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = '이름을 입력해 주세요'
    const w = parseFloat(width)
    const d = parseFloat(depth)
    if (!w || w <= 0) errs.width = '유효한 너비를 입력해 주세요'
    if (!d || d <= 0) errs.depth = '유효한 깊이를 입력해 주세요'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const h = parseFloat(height)
    onSave({
      name: name.trim(),
      category,
      widthMm: Math.round(w * 10),
      depthMm: Math.round(d * 10),
      heightMm: h > 0 ? Math.round(h * 10) : undefined,
      note: note.trim() || undefined,
    })
  }

  return (
    <div style={{ padding: '12px 16px 16px' }}>
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: 'var(--on-dark-mute)' }}
      >
        가구 수정
      </p>

      <div className="space-y-3">
        {/* Name */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ ...inputStyle, borderColor: errors.name ? 'var(--danger)' : 'var(--hairline)' }}
          />
          {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>}
        </div>

        {/* Category chips */}
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>카테고리</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {SAVED_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${category === cat ? 'var(--primary)' : 'var(--hairline)'}`,
                  backgroundColor: category === cat ? 'var(--primary)' : 'var(--surface-input)',
                  color: category === cat ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {SAVED_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Width / Depth */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>너비 · W (cm)</label>
            <input
              type="number"
              inputMode="numeric"
              value={width}
              onChange={e => setWidth(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.width ? 'var(--danger)' : 'var(--hairline)' }}
            />
            {errors.width && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.width}</p>}
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>깊이 · D (cm)</label>
            <input
              type="number"
              inputMode="numeric"
              value={depth}
              onChange={e => setDepth(e.target.value)}
              style={{ ...inputStyle, borderColor: errors.depth ? 'var(--danger)' : 'var(--hairline)' }}
            />
            {errors.depth && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.depth}</p>}
          </div>
        </div>

        {/* Height (optional) */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>
            높이 · H (cm) — 선택
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="참고용 (2D 배치에 사용 안 함)"
            value={height}
            onChange={e => setHeight(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Note (optional) */}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--on-dark-mute)' }}>메모 — 선택</label>
          <input
            type="text"
            placeholder="예: IKEA KALLAX 4칸"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Duplicate warning */}
        {duplicates.length > 0 && (
          <p className="text-xs" style={{ color: '#f7d04f' }}>
            ⚠ 비슷한 가구가 이미 있어요: {duplicates.map(d => d.name).join(', ')}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
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
            onClick={handleSave}
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
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Shared small button styles ────────────────────────────────────────────────

const dangerSmallBtn: CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  border: '1px solid rgba(247,111,111,0.4)',
  backgroundColor: 'rgba(247,111,111,0.12)',
  color: '#f76f6f',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
}

const ghostSmallBtn: CSSProperties = {
  padding: '5px 10px',
  borderRadius: 6,
  border: '1px solid var(--hairline)',
  backgroundColor: 'transparent',
  color: 'var(--on-dark-mute)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'none',
}
