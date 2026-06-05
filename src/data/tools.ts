export type ToolStatus = 'available' | 'coming-soon'
export type ToolCategory = 'money' | 'work' | 'utility' | 'food'

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
    id: 'waste-sorting',
    title: '이거 어디 버려?',
    description: '음식물쓰레기인지 일반쓰레기인지 헷갈리는 항목을 빠르게 확인하세요.',
    path: '/tools/waste-sorting',
    category: 'utility',
    status: 'available',
  },
  {
    id: 'room-simulator',
    title: '방 가구 시뮬레이터',
    description: '방 크기와 가구를 입력하고 실제 비율로 배치해 공간 점유율을 확인하세요.',
    path: '/tools/room-simulator',
    category: 'utility',
    status: 'available',
  },
  {
    id: 'subscription',
    title: '구독 계산기',
    description: '매달 나가는 구독료를 한눈에 정리하고 연간 비용을 확인하세요.',
    path: '/tools/subscription',
    category: 'money',
    status: 'available',
  },
  {
    id: 'delivery-vs-cooking',
    title: '배달 vs 요리 계산기',
    description: '배달시킬까, 해먹을까? 재료비와 끼니 수로 1끼당 비용을 비교해요.',
    path: '/tools/delivery-vs-cooking',
    category: 'food',
    status: 'available',
  },
  {
    id: 'fridge-recipes',
    title: '냉장고 재료 요리 추천',
    description: '집에 있는 재료와 조미료로 만들 수 있는 메뉴를 찾아요.',
    path: '/tools/fridge-recipes',
    category: 'food',
    status: 'available',
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
  food: '먹거리 / 식비',
}

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id)
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return TOOLS.filter((t) => t.category === category)
}
