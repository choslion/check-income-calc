import { TOOLS, CATEGORY_LABELS, getToolsByCategory, type ToolCategory } from '../data/tools'
import { ToolSection } from '../components/tools/ToolSection'
import { AdBannerSlot } from '../components/ads/AdBannerSlot'

const CATEGORIES: ToolCategory[] = ['money', 'work', 'utility']

export default function ToolsPage() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            전체 도구
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            {TOOLS.length}개의 계산 도구
          </h1>
        </div>

        {CATEGORIES.map(cat => (
          <ToolSection
            key={cat}
            title={CATEGORY_LABELS[cat]}
            tools={getToolsByCategory(cat)}
          />
        ))}

        <AdBannerSlot />
      </div>
    </div>
  )
}
