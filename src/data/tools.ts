export type ToolStatus = 'available' | 'coming-soon'
export type ToolCategory = 'money' | 'work' | 'utility'

export interface Tool {
  id: string
  title: string
  description: string
  path: string
  category: ToolCategory
  status: ToolStatus
}

export const TOOLS: Tool[] = [
  {
    id: 'budget',
    title: '예산 계산기',
    description: '월급, 고정비, 변동비를 입력하고 저축 가능 금액을 확인하세요.',
    path: '/tools/budget',
    category: 'money',
    status: 'available',
  },
  {
    id: 'resignation',
    title: '퇴사 정산 계산기',
    description: '퇴직금, 실업급여, 퇴사 후 생활 가능 기간을 한번에 추정하세요.',
    path: '/tools/resignation',
    category: 'work',
    status: 'available',
  },
  {
    id: 'subscription',
    title: '구독 계산기',
    description: '매달 나가는 구독료를 한눈에 정리하고 연간 비용을 확인하세요.',
    path: '/tools/subscription',
    category: 'money',
    status: 'coming-soon',
  },
  {
    id: 'savings-goal',
    title: '저축 목표 계산기',
    description: '목표 금액과 기간을 설정하고 매달 얼마씩 저축해야 하는지 계산하세요.',
    path: '/tools/savings-goal',
    category: 'money',
    status: 'coming-soon',
  },
  {
    id: 'retirement',
    title: '은퇴 계획 계산기',
    description: '은퇴 후 필요한 자산과 현재 저축 속도를 기반으로 은퇴 시기를 예측하세요.',
    path: '/tools/retirement',
    category: 'money',
    status: 'coming-soon',
  },
  {
    id: 'work-schedule',
    title: '근무 일정 계산기',
    description: '시급, 근무 시간, 주휴수당을 계산해 실제 월급을 확인하세요.',
    path: '/tools/work-schedule',
    category: 'work',
    status: 'coming-soon',
  },
  {
    id: 'date',
    title: '날짜 계산기',
    description: 'D-day, 날짜 간격, 특정일 계산을 빠르게 처리하세요.',
    path: '/tools/date',
    category: 'utility',
    status: 'coming-soon',
  },
]

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  money: '머니 관리',
  work: '직장 생활',
  utility: '일상 유틸',
}

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category)
}
