import type { WasteItem } from '../types'
import { WASTE_CATEGORIES } from '../data/wasteCategories'
import { RESULT_CONFIG } from '../utils/resultConfig'
import { getItemsByCategory } from '../utils/search'

interface Props {
  onSelect: (item: WasteItem) => void
}

export function WasteCategoryGrid({ onSelect }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
        카테고리로 찾기
      </p>

      <div className="space-y-3">
        {WASTE_CATEGORIES.map((cat) => {
          const items = getItemsByCategory(cat.id)
          if (items.length === 0) return null
          return (
            <details
              key={cat.id}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--hairline)' }}
            >
              <summary
                className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-semibold select-none"
                style={{ color: 'var(--on-dark)', listStyle: 'none' }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="ml-auto text-xs" style={{ color: 'var(--muted)' }}>{items.length}개</span>
              </summary>
              <div className="px-4 pb-3 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                {items.map((item) => {
                  const cfg = RESULT_CONFIG[item.resultType]
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors mt-2"
                      style={{
                        backgroundColor: cfg.bg,
                        color: 'var(--on-dark)',
                        border: `1px solid ${cfg.border}`,
                        borderRadius: 'var(--radius-pill)',
                        cursor: 'pointer',
                      }}
                    >
                      {item.name}
                      <span className="text-xs" style={{ color: cfg.color }}>{item.resultLabel}</span>
                    </button>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
