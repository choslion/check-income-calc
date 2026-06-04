export interface RoomPreset {
  id: string
  label: string
  width: number  // cm
  height: number // cm
  description: string
}

export const ROOM_PRESETS: RoomPreset[] = [
  { id: 'one-room-5p', label: '5평 원룸 예시', width: 360, height: 460, description: '약 16.6m² · 작은 원룸 예시예요' },
  { id: 'one-room-6p', label: '6평 원룸 예시', width: 400, height: 500, description: '약 20m² · 소형 원룸 일반 예시예요' },
  { id: 'one-room-7p', label: '7평 원룸 예시', width: 420, height: 550, description: '약 23m² · 조금 넓은 원룸 예시예요' },
  { id: 'one-room-8p', label: '8평 원룸 예시', width: 450, height: 590, description: '약 26.6m² · 넉넉한 원룸 예시예요' },
  { id: 'bedroom', label: '작은 침실 예시', width: 300, height: 340, description: '소형 침실 레이아웃 예시예요' },
  { id: 'newlywed', label: '신혼 침실 예시', width: 360, height: 420, description: '퀸 침대·옷장 배치 예시예요' },
  { id: 'living', label: '작은 거실 예시', width: 400, height: 500, description: '소파·TV장 배치 예시예요' },
]

export type FurnitureCategory = 'bed' | 'desk' | 'table' | 'kitchen' | 'sofa' | 'storage' | 'living' | 'bedroom'

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  bed: '침대',
  desk: '책상',
  table: '식탁',
  kitchen: '주방',
  sofa: '소파',
  storage: '수납',
  living: '거실',
  bedroom: '침실',
}

export const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  'bed', 'desk', 'table', 'kitchen', 'sofa', 'storage', 'living', 'bedroom',
]

export interface FurniturePreset {
  id: string
  category: FurnitureCategory
  name: string
  width: number  // cm
  depth: number  // cm
}

export const FURNITURE_PRESETS: FurniturePreset[] = [
  // 침대
  { id: 'bed-single',       category: 'bed',     name: '싱글 침대',     width: 100, depth: 200 },
  { id: 'bed-super-single', category: 'bed',     name: '슈퍼싱글 침대', width: 110, depth: 200 },
  { id: 'bed-double',       category: 'bed',     name: '더블 침대',     width: 140, depth: 200 },
  { id: 'bed-queen',        category: 'bed',     name: '퀸 침대',       width: 150, depth: 200 },
  { id: 'bed-king',         category: 'bed',     name: '킹 침대',       width: 160, depth: 200 },
  // 책상
  { id: 'desk-100',         category: 'desk',    name: '소형 책상',     width: 100, depth: 60  },
  { id: 'desk-120',         category: 'desk',    name: '책상',          width: 120, depth: 60  },
  { id: 'desk-140',         category: 'desk',    name: '대형 책상',     width: 140, depth: 65  },
  { id: 'desk-160',         category: 'desk',    name: '와이드 책상',   width: 160, depth: 70  },
  { id: 'chair',            category: 'desk',    name: '의자',          width: 55,  depth: 55  },
  // 식탁
  { id: 'table-2',          category: 'table',   name: '2인 식탁',      width: 80,  depth: 80  },
  { id: 'table-4',          category: 'table',   name: '4인 식탁',      width: 120, depth: 80  },
  // 주방
  { id: 'fridge',           category: 'kitchen', name: '냉장고',        width: 70,  depth: 70  },
  { id: 'fridge-mini',      category: 'kitchen', name: '소형 냉장고',   width: 55,  depth: 55  },
  { id: 'sink-150',         category: 'kitchen', name: '싱크대',        width: 150, depth: 60  },
  { id: 'sink-180',         category: 'kitchen', name: '대형 싱크대',   width: 180, depth: 60  },
  { id: 'washing-machine',  category: 'kitchen', name: '세탁기',        width: 60,  depth: 60  },
  // 소파
  { id: 'sofa-1',           category: 'sofa',    name: '1인 소파',      width: 80,  depth: 85  },
  { id: 'sofa-2',           category: 'sofa',    name: '2인 소파',      width: 140, depth: 85  },
  { id: 'sofa-3',           category: 'sofa',    name: '3인 소파',      width: 180, depth: 85  },
  // 수납
  { id: 'wardrobe',         category: 'storage', name: '옷장',          width: 120, depth: 60  },
  { id: 'hanger',           category: 'storage', name: '행거',          width: 120, depth: 45  },
  { id: 'bookshelf',        category: 'storage', name: '책장',          width: 80,  depth: 30  },
  { id: 'drawer',           category: 'storage', name: '서랍장',        width: 80,  depth: 45  },
  // 거실
  { id: 'tv-unit',          category: 'living',  name: 'TV장',          width: 150, depth: 40  },
  // 침실
  { id: 'bedside',          category: 'bedroom', name: '협탁',          width: 45,  depth: 40  },
]

export function getFurniturePresetsByCategory(cat: FurnitureCategory): FurniturePreset[] {
  return FURNITURE_PRESETS.filter(p => p.category === cat)
}

export const FURNITURE_COLORS = [
  '#4f80f7', '#f7934f', '#4fc98a', '#f76f6f', '#c084fc',
  '#f7d04f', '#38c8f7', '#f472b6', '#a3e635', '#fb923c',
]

// Quick-add chips shown on empty canvas
export const QUICK_ADD_PRESETS: FurniturePreset[] = [
  FURNITURE_PRESETS.find(p => p.id === 'bed-super-single')!,
  FURNITURE_PRESETS.find(p => p.id === 'bed-queen')!,
  FURNITURE_PRESETS.find(p => p.id === 'desk-120')!,
  FURNITURE_PRESETS.find(p => p.id === 'desk-140')!,
  FURNITURE_PRESETS.find(p => p.id === 'sofa-2')!,
]
