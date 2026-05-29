import { useNavigate } from 'react-router-dom'
import { getToolById } from '../data/tools'

interface Props {
  toolId: string
}

export default function ComingSoonPage({ toolId }: Props) {
  const navigate = useNavigate()
  const tool = getToolById(toolId)

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div
          className="p-8 text-center"
          style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--hairline)' }}
        >
          <span
            className="inline-block text-xs font-semibold px-3 py-1 mb-4"
            style={{ backgroundColor: 'var(--surface-input)', color: 'var(--muted)', borderRadius: 'var(--radius-pill)' }}
          >
            출시 예정
          </span>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--on-dark)', letterSpacing: '-0.4px' }}>
            {tool?.title ?? '준비 중인 도구'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--on-dark-mute)' }}>
            {tool?.description ?? '곧 출시될 예정입니다.'}
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
            이 도구는 현재 개발 중입니다.<br />조금만 기다려주세요.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate('/tools')}
              className="w-full py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-pill)' }}
            >
              전체 도구 보기
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)' }}
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
