import { useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { WasteItem } from '../types'
import { RESULT_CONFIG } from '../utils/resultConfig'
import { searchWasteItems } from '../utils/search'

interface Props {
  onSelect: (item: WasteItem) => void
}

export function WasteSearchInput({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const suggestions = query.trim() ? searchWasteItems(query).slice(0, 8) : []
  const showSuggestions = focused && query.trim().length > 0

  function handleSelect(item: WasteItem) {
    setQuery('')
    setFocused(false)
    inputRef.current?.blur()
    onSelect(item)
  }

  function handleClear() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      {/* 검색 인풋 */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 transition-all"
        style={{
          backgroundColor: 'var(--surface-card)',
          border: `1px solid ${focused ? 'rgba(255,255,255,0.3)' : 'var(--hairline)'}`,
          borderRadius: focused && showSuggestions ? '12px 12px 0 0' : 'var(--radius-card)',
        }}
      >
        <Search size={18} style={{ color: 'var(--on-dark-mute)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="예: 닭뼈, 달걀껍데기, ㄷㅃ"
          className="flex-1 text-sm font-medium outline-none bg-transparent"
          style={{ color: 'var(--on-dark)' }}
          aria-label="음식물 항목 검색"
          autoComplete="off"
        />
        {query && (
          <button onClick={handleClear} style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} aria-label="검색어 지우기">
            <X size={16} />
          </button>
        )}
      </div>

      {/* 자동완성 목록 */}
      {showSuggestions && (
        <div
          className="absolute left-0 right-0 z-10 overflow-hidden"
          style={{
            backgroundColor: 'var(--surface-card)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((item) => {
              const cfg = RESULT_CONFIG[item.resultType]
              return (
                <button
                  key={item.id}
                  onMouseDown={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid var(--hairline)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-input)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--on-dark)' }}>{item.name}</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 ml-2 shrink-0"
                    style={{ color: cfg.color, backgroundColor: cfg.bg, borderRadius: 'var(--radius-pill)' }}
                  >
                    {item.resultLabel}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="px-4 py-4 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
              <p className="font-medium mb-1">아직 등록되지 않은 항목이에요.</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>다른 키워드로 검색하거나 지자체 안내를 확인해 주세요.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
