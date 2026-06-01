import { useState, useEffect } from 'react'
import { parseFurnitureSizeText } from '../../../features/room-layout/furniture-size-parser/parseFurnitureSizeText'
import { mmToCmStr } from '../../../features/room-layout/furniture-size-parser/unitConversion'
import type { FurnitureSizeParseResult } from '../../../features/room-layout/furniture-size-parser/parsedSizeTypes'

interface Props {
  onApply: (widthCm: number, depthCm: number) => void
}

export function FurnitureSizePasteInput({ onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [result, setResult] = useState<FurnitureSizeParseResult | null>(null)
  const [editWidth, setEditWidth] = useState('')
  const [editDepth, setEditDepth] = useState('')

  // Debounced parsing
  useEffect(() => {
    if (!text.trim()) {
      setResult(null)
      return
    }
    const timer = setTimeout(() => {
      const r = parseFurnitureSizeText(text)
      setResult(r)
      if (r.success && r.parsed) {
        setEditWidth(mmToCmStr(r.parsed.widthMm))
        setEditDepth(mmToCmStr(r.parsed.depthMm))
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [text])

  function handleApply() {
    const w = parseFloat(editWidth)
    const d = parseFloat(editDepth)
    if (!w || !d || w <= 0 || d <= 0) return
    onApply(Math.round(w), Math.round(d))
    setOpen(false)
    setText('')
    setResult(null)
  }

  function handleToggle() {
    setOpen(v => !v)
    if (open) {
      setText('')
      setResult(null)
    }
  }

  const canApply =
    result?.success &&
    parseFloat(editWidth) > 0 &&
    parseFloat(editDepth) > 0

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '7px 12px',
          borderRadius: 'var(--radius-pill)',
          border: `1px ${open ? 'solid' : 'dashed'} ${open ? 'var(--primary)' : 'var(--hairline)'}`,
          backgroundColor: open ? 'rgba(var(--primary-rgb,247,208,79),0.1)' : 'transparent',
          color: open ? 'var(--primary)' : 'var(--on-dark-mute)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '14px' }}>📋</span>
        사이즈 문구 붙여넣기
        <span style={{ fontSize: '10px', opacity: 0.7 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {/* Textarea */}
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={'상품 사이즈 문구를 붙여넣으세요.\n예: W 1400 × D 650 × H 720mm\n예: 가로 1400mm 깊이 650mm 높이 720mm'}
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--surface-input)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-input)',
              color: 'var(--on-dark)',
              fontSize: '13px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />

          {/* Parsing in progress indicator (brief) */}
          {text.trim() && !result && (
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: 6 }}>
              인식 중…
            </p>
          )}

          {/* Error */}
          {result && !result.success && (
            <div
              style={{
                marginTop: 8,
                padding: '10px 12px',
                backgroundColor: 'rgba(247,111,111,0.08)',
                border: '1px solid rgba(247,111,111,0.2)',
                borderRadius: 8,
              }}
            >
              <p style={{ fontSize: '12px', color: '#f76f6f' }}>
                {result.errorMessage}
              </p>
            </div>
          )}

          {/* Success preview */}
          {result?.success && result.parsed && (
            <div
              style={{
                marginTop: 8,
                padding: '12px',
                backgroundColor: 'var(--surface-input)',
                border: '1px solid var(--hairline)',
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--on-dark-mute)',
                  marginBottom: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                인식된 사이즈
              </p>

              {/* Editable width/depth */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--on-dark-mute)', display: 'block', marginBottom: 4 }}>
                    가로 · W (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editWidth}
                    onChange={e => setEditWidth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--primary)',
                      borderRadius: 6,
                      color: 'var(--on-dark)',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-number)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--on-dark-mute)', display: 'block', marginBottom: 4 }}>
                    깊이 · D (cm)
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editDepth}
                    onChange={e => setEditDepth(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--primary)',
                      borderRadius: 6,
                      color: 'var(--on-dark)',
                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-number)',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Height (reference only) */}
              {result.parsed.heightMm && (
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: 8 }}>
                  높이 {mmToCmStr(result.parsed.heightMm)}cm — 2D 배치에는 사용하지 않아요
                </p>
              )}

              {/* Assumptions / notes */}
              {result.parsed.assumptions.map((note, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: '11px',
                    color: result.parsed!.confidence === 'medium' ? '#f7d04f' : 'var(--muted)',
                    marginBottom: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {result.parsed!.confidence === 'medium' ? '⚠ ' : ''}
                  {note}
                </p>
              ))}

              {/* Apply button */}
              <button
                onClick={handleApply}
                disabled={!canApply}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '9px',
                  borderRadius: 'var(--radius-button)',
                  border: 'none',
                  backgroundColor: canApply ? 'var(--primary)' : 'var(--surface-card)',
                  color: canApply ? 'var(--on-primary)' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: canApply ? 'pointer' : 'not-allowed',
                }}
              >
                적용하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
