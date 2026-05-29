import type { WasteItem, RecentSearch } from '../types'
import { RESULT_CONFIG } from '../utils/resultConfig'
import { getItemById } from '../utils/search'

interface Props {
  recentSearches: RecentSearch[]
  onSelect: (item: WasteItem) => void
  onClear: () => void
}

export function WasteRecentSearches({ recentSearches, onSelect, onClear }: Props) {
  if (recentSearches.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--on-dark-mute)' }}>
          최근 검색
        </p>
        <button
          onClick={onClear}
          className="text-xs"
          style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          전체 삭제
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recentSearches.slice(0, 8).map((r) => {
          const item = getItemById(r.itemId)
          if (!item) return null
          const cfg = RESULT_CONFIG[r.resultType]
          return (
            <button
              key={`${r.itemId}-${r.searchedAt}`}
              onClick={() => onSelect(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--surface-card)',
                color: 'var(--on-dark)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
              }}
            >
              {r.itemName}
              <span className="text-xs" style={{ color: cfg.color }}>
                {cfg.label === '음식물쓰레기' ? '음식물' : cfg.label === '일반쓰레기' ? '일반' : cfg.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
