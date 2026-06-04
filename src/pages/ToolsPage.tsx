import { useEffect } from 'react'
import { TOOLS, CATEGORY_LABELS, type ToolCategory } from '../data/tools'
import { ToolSection } from '../components/tools/ToolSection'
import { AdBannerSlot } from '../components/ads/AdBannerSlot'

const CATEGORIES: ToolCategory[] = ['money', 'work', 'utility']

const availableTools = TOOLS.filter(t => t.status === 'available')
const comingSoonTools = TOOLS.filter(t => t.status === 'coming-soon')

export default function ToolsPage() {
  useEffect(() => { document.title = '도구 목록 · 생활계산소' }, [])
  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            전체 도구
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            {availableTools.length}개의 계산 도구
          </h1>
        </div>

        {/* Available tools — grouped by category */}
        {CATEGORIES.map(cat => {
          const tools = availableTools.filter(t => t.category === cat)
          return (
            <ToolSection
              key={cat}
              title={CATEGORY_LABELS[cat]}
              tools={tools}
            />
          )
        })}

        {/* Coming-soon — single section at the bottom */}
        {comingSoonTools.length > 0 && (
          <ToolSection title="출시 예정" tools={comingSoonTools} />
        )}

        <AdBannerSlot />
      </div>
    </div>
  )
}
