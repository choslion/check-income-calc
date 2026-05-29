import { useState, useEffect } from 'react'
import type { WasteItem, RecentSearch } from './types'
import { WasteSearchInput } from './components/WasteSearchInput'
import { WasteResultCard } from './components/WasteResultCard'
import { WastePopularItems } from './components/WastePopularItems'
import { WasteCategoryGrid } from './components/WasteCategoryGrid'
import { WasteRecentSearches } from './components/WasteRecentSearches'
import { DISPOSAL_TIPS } from './data/disposalTips'
import {
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  getFavorites,
  toggleFavorite,
} from './utils/storage'

export function WasteSortingTool() {
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setRecentSearches(getRecentSearches())
    setFavorites(getFavorites())
  }, [])

  function handleSelect(item: WasteItem) {
    setSelectedItem(item)
    addRecentSearch(item.id, item.name, item.resultType)
    setRecentSearches(getRecentSearches())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setSelectedItem(null)
  }

  function handleToggleFavorite() {
    if (!selectedItem) return
    toggleFavorite(selectedItem.id)
    setFavorites(getFavorites())
  }

  function handleClearRecent() {
    clearRecentSearches()
    setRecentSearches([])
  }

  const isFavorite = selectedItem ? favorites.includes(selectedItem.id) : false

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* 헤더 */}
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            Waste Sorting
          </p>
          <h1 className="text-3xl font-bold leading-none mb-2" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            이거 어디 버려?
          </h1>
          <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
            음식물쓰레기인지 일반쓰레기인지 헷갈리는 항목을 빠르게 확인해보세요.
          </p>
        </div>

        {/* 검색 */}
        <WasteSearchInput onSelect={handleSelect} />

        {/* 결과 or 메인 화면 */}
        {selectedItem ? (
          <WasteResultCard
            item={selectedItem}
            isFavorite={isFavorite}
            onToggleFavorite={handleToggleFavorite}
            onBack={handleBack}
            onSelectItem={handleSelect}
          />
        ) : (
          <>
            <WasteRecentSearches
              recentSearches={recentSearches}
              onSelect={handleSelect}
              onClear={handleClearRecent}
            />
            <WastePopularItems onSelect={handleSelect} />
            <WasteCategoryGrid onSelect={handleSelect} />

            {/* 배출 팁 */}
            <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '20px' }}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
                배출 팁
              </p>
              <ul className="space-y-2">
                {DISPOSAL_TIPS.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
                    <span style={{ color: 'var(--muted)', flexShrink: 0 }}>·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              최근 검색 및 즐겨찾기는 이 기기에만 저장됩니다
            </p>
          </>
        )}
      </div>
    </div>
  )
}
