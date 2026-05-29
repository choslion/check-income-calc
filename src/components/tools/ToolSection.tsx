import { ToolCard } from './ToolCard'
import type { Tool } from '../../data/tools'

interface Props {
  title: string
  tools: Tool[]
}

export function ToolSection({ title, tools }: Props) {
  if (tools.length === 0) return null
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--on-dark-mute)' }}>
        {title}
      </p>
      <div className="flex flex-col gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
}
