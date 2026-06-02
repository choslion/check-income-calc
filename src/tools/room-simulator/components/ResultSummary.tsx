import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { Room, FurnitureItem, FixedElement } from '../types'
import {
  getRoomArea,
  getFurnitureArea,
  getOccupancyPercent,
  getOccupancyStatus,
  getFurnitureDimensions,
} from '../utils/geometry'
import { calculateLayoutScore, getScoreColor } from '../utils/layoutScore'
import { createLayoutBlob, shareOrDownload, canUseNativeShare, getExportFileName } from '../utils/export'

interface Props {
  room: Room
  furniture: FurnitureItem[]
  fixedElements: FixedElement[]
  layoutVersionName?: string
  onReset: () => void
  onBack: () => void
}

export function ResultSummary({ room, furniture, fixedElements, layoutVersionName, onReset, onBack }: Props) {
  const totalPct = getOccupancyPercent(room, furniture)
  const status = getOccupancyStatus(totalPct)
  const roomArea = getRoomArea(room)
  const scoreResult = calculateLayoutScore(room, furniture, fixedElements)
  const scoreColor = getScoreColor(scoreResult.status)

  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const supportsShare = canUseNativeShare()

  async function handleExport() {
    if (isExporting || furniture.length === 0) return
    setIsExporting(true)
    setExportError(null)
    try {
      const blob = await createLayoutBlob(room, furniture, fixedElements, layoutVersionName)
      await shareOrDownload(blob, getExportFileName())
    } catch {
      setExportError('이미지를 생성하지 못했습니다. 다시 시도해 주세요.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main occupancy card */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-card)',
          padding: '24px 20px',
          textAlign: 'center',
        }}
      >
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: 'var(--on-dark-mute)' }}
        >
          가구 점유율
        </p>

        {/* Gauge bar */}
        <div
          style={{
            width: '100%',
            height: 10,
            backgroundColor: 'var(--surface-input)',
            borderRadius: 9999,
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: `${Math.min(100, totalPct)}%`,
              height: '100%',
              backgroundColor: status.color,
              borderRadius: 9999,
              transition: 'width 0.6s ease',
            }}
          />
        </div>

        <div
          style={{
            fontSize: '60px',
            fontWeight: 900,
            color: status.color,
            letterSpacing: '-3px',
            lineHeight: 1,
            fontFamily: 'var(--font-number)',
          }}
        >
          {totalPct}%
        </div>
        <div className="mt-2 text-lg font-bold" style={{ color: 'var(--on-dark)' }}>
          {status.label}
        </div>
        <div className="mt-1 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          {status.sublabel}
        </div>
      </div>

      {/* Room stats */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-card)',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}
      >
        <Stat label="방 크기" value={`${room.width}×${room.height}cm`} />
        <Stat label="방 면적" value={`${(roomArea / 10000).toFixed(1)}m²`} />
        <Stat label="가구 수" value={`${furniture.length}개`} />
        <Stat label="남은 공간" value={`${Math.max(0, 100 - totalPct)}%`} />
      </div>

      {/* Per-furniture occupancy */}
      {furniture.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--hairline)' }}>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: 'var(--on-dark-mute)' }}
            >
              가구별 점유율
            </p>
          </div>
          {furniture.map(item => {
            const { w, h } = getFurnitureDimensions(item)
            const pct = Math.round((getFurnitureArea(item) / roomArea) * 100)
            return (
              <div
                key={item.id}
                style={{ padding: '12px 20px', borderTop: '1px solid var(--hairline)' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: 'var(--on-dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-number)', flexShrink: 0 }}
                    >
                      {w}×{h}cm
                    </span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: item.color, fontFamily: 'var(--font-number)', flexShrink: 0, marginLeft: 8 }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 4,
                    backgroundColor: 'var(--surface-input)',
                    borderRadius: 9999,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Layout score card */}
      {furniture.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
          }}
        >
          {/* Score header */}
          <div
            style={{
              padding: '16px 20px 14px',
              borderBottom: scoreResult.suggestions.length > 0 ? '1px solid var(--hairline)' : 'none',
            }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-2"
              style={{ color: 'var(--on-dark-mute)' }}
            >
              배치 점수
            </p>

            {/* Score number + status — single row, no competing column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    color: scoreColor,
                    fontFamily: 'var(--font-number)',
                    letterSpacing: '-2px',
                    lineHeight: 1,
                  }}
                >
                  {scoreResult.score}
                </span>
                <span style={{ fontSize: '15px', color: 'var(--muted)', fontFamily: 'var(--font-number)' }}>
                  / 100
                </span>
              </div>
              <span className="text-sm font-semibold" style={{ color: scoreColor }}>
                {scoreResult.statusLabel}
              </span>
            </div>

            {/* Breakdown as compact pills below */}
            {scoreResult.breakdown.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                {scoreResult.breakdown.slice(0, 4).map((item, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      color: 'var(--muted)',
                      backgroundColor: 'var(--surface-input)',
                      borderRadius: 4,
                      padding: '2px 7px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    -{item.penalty}점 · {item.label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs mt-2" style={{ color: '#4fc98a' }}>주요 경고 없음</p>
            )}
          </div>

          {/* Main suggestion */}
          {scoreResult.mainSuggestion && (
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: `${scoreColor}0d`,
                borderBottom: scoreResult.suggestions.length > 1 ? '1px solid var(--hairline)' : 'none',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: scoreColor, flexShrink: 0, fontSize: '14px', marginTop: 1 }}>💡</span>
              <p className="text-sm" style={{ color: 'var(--on-dark)', lineHeight: 1.5, fontWeight: 500 }}>
                {scoreResult.mainSuggestion}
              </p>
            </div>
          )}

          {/* Additional suggestions */}
          {scoreResult.suggestions.slice(1, 5).map((s, i) => (
            <div
              key={i}
              style={{
                padding: '10px 20px',
                borderTop: '1px solid var(--hairline)',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ color: 'var(--muted)', flexShrink: 0, fontSize: '12px', marginTop: 2 }}>›</span>
              <p className="text-sm" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.5 }}>
                {s}
              </p>
            </div>
          ))}

          {/* No issues message */}
          {scoreResult.suggestions.length === 0 && (
            <div
              style={{
                padding: '12px 20px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#4fc98a', fontSize: '16px' }}>✓</span>
              <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
                현재 기준에서 큰 경고가 없어요. 좋은 배치예요.
              </p>
            </div>
          )}

          <div
            style={{
              padding: '8px 20px 10px',
              borderTop: '1px solid var(--hairline)',
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
              점수는 통로·점유율·충돌 기준이에요. 실제 생활 환경에 따라 다를 수 있어요.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '13px',
            borderRadius: 'var(--radius-button)',
            border: '1px solid var(--hairline)',
            backgroundColor: 'transparent',
            color: 'var(--on-dark-mute)',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />수정하기
        </button>
        <button
          onClick={handleExport}
          disabled={furniture.length === 0 || isExporting}
          style={{
            flex: 1,
            padding: '13px',
            borderRadius: 'var(--radius-button)',
            border: 'none',
            backgroundColor: furniture.length === 0 || isExporting ? 'var(--surface-card)' : 'var(--primary)',
            color: furniture.length === 0 || isExporting ? 'var(--muted)' : 'var(--on-primary)',
            fontWeight: 700,
            fontSize: '15px',
            cursor: furniture.length === 0 || isExporting ? 'not-allowed' : 'pointer',
          }}
        >
          {isExporting ? '이미지 생성 중...' : supportsShare ? '공유하기' : '이미지 저장'}
        </button>
      </div>
      {exportError && (
        <p
          className="text-sm text-center"
          style={{ color: '#f76f6f', marginTop: -8 }}
        >
          {exportError}
        </p>
      )}
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '11px',
          borderRadius: 'var(--radius-button)',
          border: '1px solid var(--hairline)',
          backgroundColor: 'transparent',
          color: 'var(--muted)',
          fontSize: '14px',
          cursor: 'pointer',
        }}
      >
        처음부터 다시
      </button>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      <p
        className="font-bold mt-0.5 text-sm"
        style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}
      >
        {value}
      </p>
    </div>
  )
}
