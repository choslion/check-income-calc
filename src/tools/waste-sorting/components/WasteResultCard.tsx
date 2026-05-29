import { Star, StarOff, ArrowLeft, AlertTriangle } from 'lucide-react'
import type { WasteItem } from '../types'
import { RESULT_CONFIG } from '../utils/resultConfig'
import { getRelatedItems } from '../utils/search'
import { LOCAL_RULE_CAUTION } from '../data/disposalTips'

interface Props {
  item: WasteItem
  isFavorite: boolean
  onToggleFavorite: () => void
  onBack: () => void
  onSelectItem: (item: WasteItem) => void
}

function ResultBadge({ resultType, label }: { resultType: string; label: string }) {
  const cfg = RESULT_CONFIG[resultType as keyof typeof RESULT_CONFIG] ?? RESULT_CONFIG.unknown
  return (
    <span
      className="inline-block text-sm font-bold px-4 py-2"
      style={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius-pill)',
      }}
      role="status"
      aria-label={`분리수거 결과: ${label}`}
    >
      {label}
    </span>
  )
}

export function WasteResultCard({ item, isFavorite, onToggleFavorite, onBack, onSelectItem }: Props) {
  const relatedItems = getRelatedItems(item)

  return (
    <div className="space-y-3">
      {/* 상단 네비 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ArrowLeft size={16} />
          돌아가기
        </button>
        <button
          onClick={onToggleFavorite}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 transition-colors"
          style={{
            color: isFavorite ? 'var(--primary)' : 'var(--on-dark-mute)',
            backgroundColor: 'var(--surface-card)',
            border: `1px solid ${isFavorite ? 'var(--primary)' : 'var(--hairline)'}`,
            borderRadius: 'var(--radius-pill)',
          }}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {isFavorite ? <Star size={13} /> : <StarOff size={13} />}
          즐겨찾기
        </button>
      </div>

      {/* 결과 카드 */}
      <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--on-dark)', letterSpacing: '-0.4px' }}>
          {item.name}
        </h2>

        {/* 결과 뱃지 */}
        {item.resultType === 'mixed' ? (
          <div className="space-y-2 mb-4">
            {item.parts?.map((part) => {
              const cfg = RESULT_CONFIG[part.resultType]
              return (
                <div
                  key={part.name}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--on-dark)' }}>{part.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold" style={{ color: cfg.color }}>{part.resultLabel}</span>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--on-dark-mute)' }}>{part.disposalMethod}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mb-4">
            <ResultBadge resultType={item.resultType} label={item.resultLabel} />
            {item.disposalMethod && (
              <p className="text-sm mt-3 font-medium" style={{ color: 'var(--on-dark)' }}>
                {item.disposalMethod}
              </p>
            )}
          </div>
        )}

        {/* 이유 */}
        {item.reason && (
          <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-input)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--on-dark-mute)' }}>이유</p>
            <p className="text-sm" style={{ color: 'var(--on-dark)' }}>{item.reason}</p>
          </div>
        )}

        {/* 팁 */}
        {item.tip && (
          <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(252,213,53,0.06)', border: '1px solid rgba(252,213,53,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>팁</p>
            <p className="text-sm" style={{ color: 'var(--on-dark)' }}>{item.tip}</p>
          </div>
        )}

        {/* 지역 주의사항 */}
        <div className="flex gap-2 mt-3">
          <AlertTriangle size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {item.caution ?? LOCAL_RULE_CAUTION}
          </p>
        </div>
      </div>

      {/* 관련 항목 */}
      {relatedItems.length > 0 && (
        <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '20px' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
            관련 항목
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedItems.map((rel) => {
              const cfg = RESULT_CONFIG[rel.resultType]
              return (
                <button
                  key={rel.id}
                  onClick={() => onSelectItem(rel)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-input)',
                    color: 'var(--on-dark)',
                    border: '1px solid var(--hairline)',
                    borderRadius: 'var(--radius-pill)',
                    cursor: 'pointer',
                  }}
                >
                  {rel.name}
                  <span className="text-xs" style={{ color: cfg.color }}>{rel.resultLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
