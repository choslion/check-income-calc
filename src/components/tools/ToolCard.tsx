import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Tool } from '../../data/tools'

interface Props {
  tool: Tool
}

export function ToolCard({ tool }: Props) {
  const navigate = useNavigate()
  const isAvailable = tool.status === 'available'

  return (
    <div
      className="p-4 flex flex-col gap-2 transition-colors"
      style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--hairline)',
        cursor: isAvailable ? 'pointer' : 'default',
        opacity: isAvailable ? 1 : 0.6,
      }}
      onClick={() => isAvailable && navigate(tool.path)}
      onMouseEnter={(e) => {
        if (isAvailable) (e.currentTarget.style.borderColor = 'var(--primary)')
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--hairline)'
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold" style={{ color: 'var(--on-dark)' }}>
          {tool.title}
        </p>
        <span
          className="text-xs px-2 py-0.5 shrink-0 font-medium"
          style={{
            borderRadius: 'var(--radius-pill)',
            backgroundColor: isAvailable ? 'rgba(252,213,53,0.12)' : 'var(--surface-input)',
            color: isAvailable ? 'var(--primary)' : 'var(--muted)',
          }}
        >
          {isAvailable ? '사용 가능' : '출시 예정'}
        </span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--on-dark-mute)' }}>
        {tool.description}
      </p>
      {isAvailable && (
        <p className="text-xs font-semibold mt-1" style={{ color: 'var(--primary)' }}>
          <span className="flex items-center gap-0.5">바로가기 <ChevronRight size={13} /></span>
        </p>
      )}
    </div>
  )
}
