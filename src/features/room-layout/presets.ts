import type { Room, Furniture } from './types'

// ─── Types ────────────────────────────────────────────────────────────────

export type RoomPreset = {
  id: string
  name: string
  widthMm: number
  heightMm: number
  description?: string
}

export type FurniturePresetCategory =
  | 'bed'
  | 'desk'
  | 'table'
  | 'sofa'
  | 'storage'
  | 'living'
  | 'bedroom'

export type FurniturePreset = {
  id: string
  category: FurniturePresetCategory
  name: string
  widthMm: number
  depthMm: number
  description?: string
}

// ─── Room Preset Data ─────────────────────────────────────────────────────

const ROOM_PRESET_DATA: RoomPreset[] = [
  {
    id: 'one-room-5p-example',
    name: '5평 원룸 예시',
    widthMm: 2600,
    heightMm: 3000,
    description: '작은 원룸 예시예요. 선택 후 수정 가능해요.',
  },
  {
    id: 'one-room-6p-example',
    name: '6평 원룸 예시',
    widthMm: 3000,
    heightMm: 3300,
    description: '일반적인 소형 원룸 예시예요.',
  },
  {
    id: 'one-room-7p-example',
    name: '7평 원룸 예시',
    widthMm: 3200,
    heightMm: 3600,
    description: '조금 넓은 원룸 예시예요.',
  },
  {
    id: 'one-room-8p-example',
    name: '8평 원룸 예시',
    widthMm: 3500,
    heightMm: 3800,
    description: '넉넉한 원룸 예시예요.',
  },
  {
    id: 'small-bedroom-example',
    name: '작은 침실 예시',
    widthMm: 3000,
    heightMm: 3200,
    description: '작은 침실 레이아웃 예시예요.',
  },
  {
    id: 'newlywed-bedroom-example',
    name: '신혼 침실 예시',
    widthMm: 3400,
    heightMm: 3800,
    description: '퀸 침대와 옷장 배치 예시예요.',
  },
  {
    id: 'small-living-room-example',
    name: '작은 거실 예시',
    widthMm: 3600,
    heightMm: 4200,
    description: '소파와 TV장 배치 예시예요.',
  },
]

// ─── Furniture Preset Data ────────────────────────────────────────────────

const FURNITURE_PRESET_DATA: FurniturePreset[] = [
  // Beds
  { id: 'bed-single', category: 'bed', name: '싱글 침대', widthMm: 1000, depthMm: 2000, description: '일반 싱글 침대예요.' },
  { id: 'bed-super-single', category: 'bed', name: '슈퍼싱글 침대', widthMm: 1100, depthMm: 2000, description: '일반적인 슈퍼싱글 침대예요.' },
  { id: 'bed-double', category: 'bed', name: '더블 침대', widthMm: 1400, depthMm: 2000, description: '일반 더블 침대예요.' },
  { id: 'bed-queen', category: 'bed', name: '퀸 침대', widthMm: 1500, depthMm: 2000, description: '일반 퀸 침대예요.' },
  { id: 'bed-king', category: 'bed', name: '킹 침대', widthMm: 1600, depthMm: 2000, description: '일반 킹 침대예요.' },
  // Desks
  { id: 'desk-1000', category: 'desk', name: '100cm 책상', widthMm: 1000, depthMm: 600, description: '소형 책상이에요.' },
  { id: 'desk-1200', category: 'desk', name: '120cm 책상', widthMm: 1200, depthMm: 600, description: '일반적인 1인 책상이에요.' },
  { id: 'desk-1400', category: 'desk', name: '140cm 책상', widthMm: 1400, depthMm: 650, description: '넓은 컴퓨터 책상이에요.' },
  { id: 'desk-1600', category: 'desk', name: '160cm 책상', widthMm: 1600, depthMm: 700, description: '와이드 작업 책상이에요.' },
  // Tables
  { id: 'table-dining-2', category: 'table', name: '2인 식탁', widthMm: 800, depthMm: 800, description: '소형 식탁이에요.' },
  { id: 'table-dining-4', category: 'table', name: '4인 식탁', widthMm: 1200, depthMm: 800, description: '일반적인 4인 식탁이에요.' },
  // Sofas
  { id: 'sofa-1-seat', category: 'sofa', name: '1인 소파', widthMm: 800, depthMm: 850, description: '1인 소파예요.' },
  { id: 'sofa-2-seat', category: 'sofa', name: '2인 소파', widthMm: 1400, depthMm: 850, description: '소형 거실 소파예요.' },
  { id: 'sofa-3-seat', category: 'sofa', name: '3인 소파', widthMm: 1800, depthMm: 850, description: '일반적인 3인 소파예요.' },
  // Storage
  { id: 'wardrobe', category: 'storage', name: '옷장', widthMm: 1200, depthMm: 600, description: '일반 옷장이에요.' },
  { id: 'hanger-rack', category: 'storage', name: '행거', widthMm: 1200, depthMm: 450, description: '오픈형 행거예요.' },
  { id: 'bookshelf', category: 'storage', name: '책장', widthMm: 800, depthMm: 300, description: '일반 책장이에요.' },
  { id: 'drawer', category: 'storage', name: '서랍장', widthMm: 800, depthMm: 450, description: '일반 수납 서랍이에요.' },
  // Living
  { id: 'tv-unit', category: 'living', name: 'TV장', widthMm: 1500, depthMm: 400, description: '일반 TV 스탠드예요.' },
  // Bedroom
  { id: 'bedside-table', category: 'bedroom', name: '협탁', widthMm: 450, depthMm: 400, description: '침대 옆 작은 협탁이에요.' },
]

// ─── Accessor Functions ───────────────────────────────────────────────────

export function getRoomPresets(): RoomPreset[] {
  return ROOM_PRESET_DATA
}

export function getFurniturePresets(): FurniturePreset[] {
  return FURNITURE_PRESET_DATA
}

export function getFurniturePresetsByCategory(category: FurniturePresetCategory): FurniturePreset[] {
  return FURNITURE_PRESET_DATA.filter(p => p.category === category)
}

// ─── Factory Functions ────────────────────────────────────────────────────

export function createRoomFromPreset(preset: RoomPreset): Room {
  return { widthCm: preset.widthMm / 10, heightCm: preset.heightMm / 10 }
}

export function createFurnitureFromPreset(
  preset: FurniturePreset,
  id: string,
): Omit<Furniture, 'xCm' | 'yCm'> {
  return {
    id,
    name: preset.name,
    widthCm: preset.widthMm / 10,
    depthCm: preset.depthMm / 10,
    rotated: false,
  }
}

// ─── Display Helpers ──────────────────────────────────────────────────────

function fmtDim(mm: number): string {
  const cm = mm / 10
  return Number.isInteger(cm) ? String(cm) : cm.toFixed(1).replace(/\.0$/, '')
}

export function formatPresetSize(widthMm: number, depthOrHeightMm: number): string {
  return `${fmtDim(widthMm)} × ${fmtDim(depthOrHeightMm)}cm`
}

// ─── Initial Position Finder ──────────────────────────────────────────────

export function findInitialFurniturePosition(
  room: Room,
  furnitureList: Furniture[],
  furniture: Furniture,
): { xCm: number; yCm: number } {
  const w = furniture.rotated ? furniture.depthCm : furniture.widthCm
  const h = furniture.rotated ? furniture.widthCm : furniture.depthCm

  if (w > room.widthCm || h > room.heightCm) return { xCm: 0, yCm: 0 }

  const STEP = 10

  for (let y = 0; y <= room.heightCm - h; y += STEP) {
    for (let x = 0; x <= room.widthCm - w; x += STEP) {
      const overlaps = furnitureList.some(e => {
        const ew = e.rotated ? e.depthCm : e.widthCm
        const eh = e.rotated ? e.widthCm : e.depthCm
        return !(x + w <= e.xCm || e.xCm + ew <= x || y + h <= e.yCm || e.yCm + eh <= y)
      })
      if (!overlaps) return { xCm: x, yCm: y }
    }
  }

  return { xCm: 0, yCm: 0 }
}
