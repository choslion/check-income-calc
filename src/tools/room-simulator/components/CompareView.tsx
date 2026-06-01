import { ChevronLeft } from 'lucide-react'
import type { LayoutVersion, LayoutVersionSummary } from '../types'
import { getFurnitureDimensions, FIXED_ELEMENT_COLORS } from '../utils/geometry'

interface Props {
  versions: LayoutVersion[]
  summaries: LayoutVersionSummary[]
  activeVersionId: string
  onSelect: (id: string) => void
  onClose: () => void
}

export function CompareView({ versions, summaries, activeVersionId, onSelect, onClose }: Props) {
  const recommended = summaries.find(s => s.isRecommended)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--surface-card)',
          borderRadius: 'var(--radius-card)',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-0.5"
            style={{ color: 'var(--on-dark-mute)' }}
          >
            Layout Compare
          </p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            배치를 탭하면 해당 버전으로 전환돼요
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '7px 14px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--hairline)',
            backgroundColor: 'var(--surface-input)',
            color: 'var(--on-dark-mute)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />배치로
        </button>
      </div>

      {/* Recommended banner */}
      {recommended && (
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-card)',
            padding: '12px 16px',
            borderLeft: '3px solid #4fc98a',
          }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: '#4fc98a', marginBottom: 2 }}
          >
            ✓ 현재 기준 추천: {recommended.name}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {recommended.recommendedReason} — 실제 생활 환경에 따라 다를 수 있어요.
          </p>
        </div>
      )}

      {/* Version cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {summaries.map(summary => {
          const version = versions.find(v => v.id === summary.layoutVersionId)!
          return (
            <VersionCard
              key={summary.layoutVersionId}
              summary={summary}
              version={version}
              isActive={summary.layoutVersionId === activeVersionId}
              onSelect={() => onSelect(summary.layoutVersionId)}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Version Card ──────────────────────────────────────────────────────────────

interface VersionCardProps {
  summary: LayoutVersionSummary
  version: LayoutVersion
  isActive: boolean
  onSelect: () => void
}

function VersionCard({ summary, version, isActive, onSelect }: VersionCardProps) {
  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: isActive
          ? '2px solid var(--primary)'
          : summary.isRecommended
            ? '1px solid rgba(79,201,138,0.4)'
            : '1px solid var(--hairline)',
        cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Mini preview */}
      <MiniRoomPreview version={version} />

      {/* Stats */}
      <div style={{ padding: '10px 10px 12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              color: 'var(--on-dark)',
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.2,
            }}
          >
            {summary.name}
          </span>
          {summary.isRecommended && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#4fc98a',
                whiteSpace: 'nowrap',
                marginLeft: 4,
              }}
            >
              ✓ 추천
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <SummaryRow label="점유율">
            <span style={{ color: summary.status.color, fontWeight: 700 }}>
              {summary.occupancyPercent}%
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 3 }}>
              {summary.status.label}
            </span>
          </SummaryRow>

          {summary.minimumClearanceCm !== null && (
            <SummaryRow label="최소 통로">
              <span
                style={{
                  color: summary.minimumClearanceCm < 60 ? '#f7d04f' : 'var(--on-dark)',
                  fontWeight: 600,
                }}
              >
                {summary.minimumClearanceCm}cm
              </span>
            </SummaryRow>
          )}

          <SummaryRow label="주의사항">
            {summary.warningCount === 0 ? (
              <span style={{ color: '#4fc98a', fontWeight: 600 }}>없음</span>
            ) : (
              <span style={{ color: '#f7d04f', fontWeight: 600 }}>
                {summary.warningCount}개
              </span>
            )}
          </SummaryRow>
        </div>

        {summary.mainWarning && (
          <p
            style={{
              fontSize: 10,
              color: 'var(--muted)',
              marginTop: 6,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            ⚠ {summary.mainWarning.message}
          </p>
        )}

        {isActive && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 6,
              borderTop: '1px solid var(--hairline)',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              편집 중
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontFamily: 'var(--font-number)',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        {children}
      </span>
    </div>
  )
}

// ─── Mini Room Preview ─────────────────────────────────────────────────────────

const PREVIEW_MAX_W = 200
const PREVIEW_MAX_H = 140

function MiniRoomPreview({ version }: { version: LayoutVersion }) {
  const { room, furnitureList, fixedElements } = version
  const scaleW = PREVIEW_MAX_W / room.width
  const scaleH = PREVIEW_MAX_H / room.height
  const s = Math.min(scaleW, scaleH)
  const w = Math.round(room.width * s)
  const h = Math.round(room.height * s)

  return (
    <div
      style={{
        width: '100%',
        height: h,
        position: 'relative',
        backgroundColor: '#0d1117',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Centered room area */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          width: w,
          height: h,
        }}
      >
        {/* Fixed elements */}
        {fixedElements.map(el => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: el.xCm * s,
              top: el.yCm * s,
              width: el.widthCm * s,
              height: el.depthCm * s,
              backgroundColor: FIXED_ELEMENT_COLORS[el.type] + (el.wallSide ? 'cc' : '44'),
              border: `1px solid ${FIXED_ELEMENT_COLORS[el.type]}`,
              borderRadius: 1,
            }}
          />
        ))}

        {/* Furniture */}
        {furnitureList.map(item => {
          const { w: fw, h: fh } = getFurnitureDimensions(item)
          return (
            <div
              key={item.id}
              style={{
                position: 'absolute',
                left: item.x * s,
                top: item.y * s,
                width: fw * s,
                height: fh * s,
                backgroundColor: item.color + '88',
                border: `1px solid ${item.color}`,
                borderRadius: 1,
              }}
            />
          )
        })}

        {/* Room border */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid rgba(255,255,255,0.2)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  )
}
