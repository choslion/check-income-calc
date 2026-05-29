import type { ResultType } from '../types'

interface ResultConfig {
  label: string
  color: string
  bg: string
  border: string
}

export const RESULT_CONFIG: Record<ResultType, ResultConfig> = {
  food: {
    label: '음식물쓰레기',
    color: '#0ecb81',
    bg: 'rgba(14,203,129,0.1)',
    border: 'rgba(14,203,129,0.3)',
  },
  general: {
    label: '일반쓰레기',
    color: 'var(--on-dark-mute)',
    bg: 'var(--surface-input)',
    border: 'var(--hairline)',
  },
  mixed: {
    label: '분리해서 버려요',
    color: 'var(--primary)',
    bg: 'rgba(252,213,53,0.1)',
    border: 'rgba(252,213,53,0.3)',
  },
  'local-check': {
    label: '지역 기준 확인 필요',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
  },
  unknown: {
    label: '확인 필요',
    color: 'var(--muted)',
    bg: 'var(--surface-input)',
    border: 'var(--hairline)',
  },
}
