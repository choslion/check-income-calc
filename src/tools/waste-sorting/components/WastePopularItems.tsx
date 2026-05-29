import type { WasteItem } from '../types'
import { RESULT_CONFIG } from '../utils/resultConfig'
import { getItemById } from '../utils/search'
import { POPULAR_ITEM_IDS } from '../data/wasteCategories'

interface Props {
  onSelect: (item: WasteItem) => void
}

export function WastePopularItems({ onSelect }: Props) {
  const items = POPULAR_ITEM_IDS.flatMap((id) => getItemById(id) ?? [])

  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
        헷갈리는 항목 모음
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const cfg = RESULT_CONFIG[item.resultType]
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--surface-card)',
                color: 'var(--on-dark)',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--radius-pill)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = cfg.color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hairline)')}
            >
              {item.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
