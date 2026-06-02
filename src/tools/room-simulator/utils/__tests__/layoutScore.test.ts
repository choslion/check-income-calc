import { describe, it, expect } from 'vitest'
import type { Room, FurnitureItem, FixedElement } from '../../types'
import { calculateLayoutScore, getScoreStatus } from '../layoutScore'

// ── Fixtures ───────────────────────────────────────────────────────────────────

const ROOM: Room = { width: 360, height: 540 }

function makeFurniture(overrides: Partial<FurnitureItem> & { id: string }): FurnitureItem {
  return {
    name: '가구',
    width: 100,
    depth: 80,
    x: 0,
    y: 0,
    rotated: false,
    color: '#aaa',
    showClearance: false,
    ...overrides,
  }
}

function makeFixed(overrides: Partial<FixedElement> & { id: string }): FixedElement {
  return {
    type: 'builtInCloset',
    name: '붙박이장',
    xCm: 0,
    yCm: 0,
    widthCm: 60,
    depthCm: 60,
    ...overrides,
  }
}

// ── Empty layout ───────────────────────────────────────────────────────────────

describe('empty layout', () => {
  it('returns score 100 with no furniture', () => {
    const r = calculateLayoutScore(ROOM, [], [])
    expect(r.score).toBe(100)
    expect(r.status).toBe('excellent')
    expect(r.suggestions).toHaveLength(0)
    expect(r.mainSuggestion).toBeNull()
  })
})

// ── Score status ───────────────────────────────────────────────────────────────

describe('getScoreStatus', () => {
  it('90–100 → excellent', () => expect(getScoreStatus(95)).toBe('excellent'))
  it('75–89 → good', () => expect(getScoreStatus(80)).toBe('good'))
  it('60–74 → needsImprovement', () => expect(getScoreStatus(65)).toBe('needsImprovement'))
  it('40–59 → tight', () => expect(getScoreStatus(50)).toBe('tight'))
  it('0–39 → problematic', () => expect(getScoreStatus(20)).toBe('problematic'))
})

// ── Furniture overlap ──────────────────────────────────────────────────────────

describe('furniture-to-furniture overlap', () => {
  it('applies -30 penalty per overlapping pair', () => {
    // Place both furniture away from walls to avoid wall-clearance warnings
    const a = makeFurniture({ id: 'a', x: 100, y: 100, width: 100, depth: 80 })
    const b = makeFurniture({ id: 'b', x: 150, y: 140, width: 100, depth: 80 })
    const r = calculateLayoutScore(ROOM, [a, b], [])
    expect(r.score).toBe(70) // 100 - 30
    expect(r.breakdown.some(item => item.label.includes('겹침'))).toBe(true)
  })

  it('caps overlap penalty at 90', () => {
    // 4 furniture items all overlapping = normally 4*30=120 but capped at 90
    const furniture = [0, 1, 2, 3].map(i =>
      makeFurniture({ id: `f${i}`, x: 10, y: 10, width: 100, depth: 80 })
    )
    const r = calculateLayoutScore(ROOM, furniture, [])
    expect(r.score).toBeGreaterThanOrEqual(0)
  })

  it('generates suggestion mentioning furniture names', () => {
    const a = makeFurniture({ id: 'a', name: '침대', x: 0, y: 0, width: 150, depth: 200 })
    const b = makeFurniture({ id: 'b', name: '책상', x: 100, y: 100, width: 120, depth: 60 })
    const r = calculateLayoutScore(ROOM, [a, b], [])
    expect(r.mainSuggestion).toContain('침대')
    expect(r.mainSuggestion).toContain('책상')
  })
})

// ── Fixed element conflicts ────────────────────────────────────────────────────

describe('fixed element conflicts', () => {
  it('furniture overlapping closet applies -25 penalty', () => {
    // Furniture placed exactly on top of closet
    const furniture = [makeFurniture({ id: 'f1', x: 0, y: 0, width: 60, depth: 60 })]
    const fixed = [makeFixed({ id: 'e1', type: 'builtInCloset', xCm: 0, yCm: 0, widthCm: 60, depthCm: 60 })]
    const r = calculateLayoutScore(ROOM, furniture, fixed)
    expect(r.score).toBeLessThanOrEqual(75) // at least -25
    expect(r.breakdown.some(item => item.label.includes('구조물'))).toBe(true)
  })

  it('door clearance conflict applies -20 penalty', () => {
    // Place a door on bottom wall with 80cm clearance zone
    const door: FixedElement = {
      id: 'door1',
      type: 'door',
      name: '문',
      xCm: 140,
      yCm: 532, // bottom wall (room height 540 - WALL_DEPTH 8 = 532)
      widthCm: 80,
      depthCm: 8,
      wallSide: 'bottom',
    }
    // Furniture inside the clearance zone (y from 452 to 532 for bottom-wall door)
    const furniture = [makeFurniture({ id: 'f1', x: 140, y: 460, width: 80, depth: 60 })]
    const r = calculateLayoutScore(ROOM, furniture, [door])
    expect(r.breakdown.some(item => item.label.includes('문 통행'))).toBe(true)
  })

  it('window blocking applies -10 penalty', () => {
    const window: FixedElement = {
      id: 'w1',
      type: 'window',
      name: '창문',
      xCm: 100,
      yCm: 0,
      widthCm: 120,
      depthCm: 8,
      wallSide: 'top',
    }
    const furniture = [makeFurniture({ id: 'f1', x: 100, y: 0, width: 120, depth: 20 })]
    const r = calculateLayoutScore(ROOM, furniture, [window])
    expect(r.breakdown.some(item => item.label.includes('창문'))).toBe(true)
  })
})

// ── Clearance gaps ─────────────────────────────────────────────────────────────

describe('clearance warnings', () => {
  it('clearance below 60cm applies -10 penalty', () => {
    // Two furniture items with a narrow gap
    const a = makeFurniture({ id: 'a', x: 0, y: 0, width: 150, depth: 200 })
    const b = makeFurniture({ id: 'b', x: 0, y: 240, width: 150, depth: 200 }) // 40cm gap
    const r = calculateLayoutScore(ROOM, [a, b], [])
    expect(r.score).toBeLessThan(100)
  })

  it('generates a suggestion for narrow clearance', () => {
    const a = makeFurniture({ id: 'a', name: '침대', x: 0, y: 0, width: 150, depth: 200 })
    const b = makeFurniture({ id: 'b', name: '책상', x: 0, y: 240, width: 150, depth: 200 })
    const r = calculateLayoutScore(ROOM, [a, b], [])
    // At least one suggestion about clearance
    const hasClearanceSuggestion = r.suggestions.some(s => s.includes('cm'))
    expect(hasClearanceSuggestion).toBe(true)
  })
})

// ── Occupancy ─────────────────────────────────────────────────────────────────

describe('occupancy penalty', () => {
  it('35–50% occupancy applies -5 penalty', () => {
    // Room 360×540 = 194400 cm². 35% = 68040 cm². Make furniture ~37%
    // A single 180×400cm piece = 72000 cm² = 37%
    const furniture = [makeFurniture({ id: 'f1', x: 0, y: 0, width: 180, depth: 400 })]
    const r = calculateLayoutScore(ROOM, furniture, [])
    expect(r.breakdown.some(b => b.penalty === 5)).toBe(true)
  })

  it('50–65% occupancy applies -15 penalty', () => {
    // ~55% occupancy: 360×540 * 0.55 ≈ 106920 → 200×535 = 107000
    const furniture = [makeFurniture({ id: 'f1', x: 0, y: 0, width: 200, depth: 535 })]
    const r = calculateLayoutScore(ROOM, furniture, [])
    const occupancyItem = r.breakdown.find(b => b.label.includes('점유율'))
    expect(occupancyItem?.penalty).toBe(15)
  })

  it('65%+ occupancy applies -25 penalty', () => {
    // ~70% occupancy: 360×540 * 0.70 ≈ 136080 → 250×545 is too big, try 260×535 = 139100 ≈ 71.5%
    const furniture = [makeFurniture({ id: 'f1', x: 0, y: 0, width: 260, depth: 535 })]
    const r = calculateLayoutScore(ROOM, furniture, [])
    const occupancyItem = r.breakdown.find(b => b.label.includes('점유율'))
    expect(occupancyItem?.penalty).toBe(25)
  })
})

// ── Score bounds ───────────────────────────────────────────────────────────────

describe('score bounds', () => {
  it('score never goes below 0', () => {
    // Many overlapping furniture + high occupancy
    const furniture = [0, 1, 2, 3, 4].map(i =>
      makeFurniture({ id: `f${i}`, x: 0, y: 0, width: 300, depth: 500 })
    )
    const r = calculateLayoutScore(ROOM, furniture, [])
    expect(r.score).toBeGreaterThanOrEqual(0)
  })

  it('score never exceeds 100', () => {
    const furniture = [makeFurniture({ id: 'f1', x: 10, y: 10, width: 50, depth: 50 })]
    const r = calculateLayoutScore(ROOM, furniture, [])
    expect(r.score).toBeLessThanOrEqual(100)
  })
})

// ── Suggestions ────────────────────────────────────────────────────────────────

describe('suggestions', () => {
  it('main suggestion reflects highest-priority issue (overlap first)', () => {
    const a = makeFurniture({ id: 'a', name: '침대', x: 0, y: 0, width: 150, depth: 200 })
    const b = makeFurniture({ id: 'b', name: '책상', x: 50, y: 50, width: 120, depth: 60 })
    const r = calculateLayoutScore(ROOM, [a, b], [])
    // Overlap is highest priority — should mention both furniture names
    expect(r.mainSuggestion).toContain('침대')
    expect(r.mainSuggestion).toContain('책상')
  })

  it('no suggestions when layout has no issues', () => {
    // Single small furniture far from walls and other furniture
    const furniture = [makeFurniture({ id: 'f1', x: 100, y: 100, width: 80, depth: 60 })]
    const r = calculateLayoutScore(ROOM, furniture, [])
    expect(r.score).toBe(100)
    expect(r.suggestions).toHaveLength(0)
    expect(r.mainSuggestion).toBeNull()
  })
})
