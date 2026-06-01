import { useState, useEffect, useRef } from 'react'
import type { LayoutVersion } from '../types'

interface Props {
  versions: LayoutVersion[]
  activeVersionId: string
  onSwitch: (id: string) => void
  onAdd: () => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

export function VersionTabs({
  versions,
  activeVersionId,
  onSwitch,
  onAdd,
  onRename,
  onDuplicate,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setRenaming(false)
  }, [activeVersionId])

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus()
  }, [renaming])

  const activeVersion = versions.find(v => v.id === activeVersionId)

  function startRename() {
    setRenameValue(activeVersion?.name ?? '')
    setRenaming(true)
    setMenuOpen(false)
  }

  function commitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && activeVersion && trimmed !== activeVersion.name) {
      onRename(activeVersion.id, trimmed)
    }
    setRenaming(false)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        padding: '10px 12px',
      }}
    >
      {/* Tab row */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          alignItems: 'center',
          scrollbarWidth: 'none',
        }}
      >
        {versions.map(v => {
          const isActive = v.id === activeVersionId
          if (isActive && renaming) {
            return (
              <input
                key={v.id}
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitRename()
                  if (e.key === 'Escape') setRenaming(false)
                }}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid var(--primary)',
                  backgroundColor: 'var(--surface-input)',
                  color: 'var(--on-dark)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none',
                  width: Math.max(72, renameValue.length * 9),
                  flexShrink: 0,
                }}
              />
            )
          }
          return (
            <button
              key={v.id}
              onClick={() => isActive ? setMenuOpen(o => !o) : onSwitch(v.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--hairline)'}`,
                backgroundColor: isActive ? 'rgba(var(--primary-rgb, 247,208,79), 0.12)' : 'var(--surface-input)',
                color: isActive ? 'var(--primary)' : 'var(--on-dark-mute)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {v.name}
              {isActive && (
                <span style={{ fontSize: '10px', opacity: 0.7, marginLeft: 2 }}>
                  {menuOpen ? '▲' : '▼'}
                </span>
              )}
            </button>
          )
        })}

        <button
          onClick={onAdd}
          style={{
            padding: '5px 10px',
            borderRadius: 'var(--radius-pill)',
            border: '1px dashed var(--hairline)',
            backgroundColor: 'transparent',
            color: 'var(--muted)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          + 추가
        </button>
      </div>

      {/* Action menu (inline, shown below tabs) */}
      {menuOpen && !renaming && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            gap: 8,
            paddingTop: 10,
            borderTop: '1px solid var(--hairline)',
          }}
        >
          <ActionBtn onClick={startRename}>✎ 이름 변경</ActionBtn>
          <ActionBtn
            onClick={() => {
              onDuplicate(activeVersionId)
              setMenuOpen(false)
            }}
          >
            ⊕ 복제
          </ActionBtn>
          {versions.length > 1 && (
            <ActionBtn
              onClick={() => {
                onDelete(activeVersionId)
                setMenuOpen(false)
              }}
              danger
            >
              삭제
            </ActionBtn>
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({
  onClick,
  children,
  danger = false,
}: {
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 6,
        border: `1px solid ${danger ? 'rgba(247,111,111,0.4)' : 'var(--hairline)'}`,
        backgroundColor: 'var(--surface-input)',
        color: danger ? '#f76f6f' : 'var(--on-dark-mute)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
