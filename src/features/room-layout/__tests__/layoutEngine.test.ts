import { describe, it, expect } from 'vitest'
import type { Room, Furniture } from '../types'
import { convertToCm, validatePositiveNumber, DEFAULT_MIN_CLEARANCE_CM } from '../unit'
import {
  getFurnitureEffectiveSize,
  getRoomArea,
  getFurnitureArea,
  getTotalFurnitureArea,
  getOccupancyPercent,
  getOccupancyStatus,
  clampFurnitureInsideRoom,
  moveFurniture,
  rotateFurniture,
  detectFurnitureOverlap,
  detectAllFurnitureOverlaps,
  getWallClearance,
  detectWallClearanceWarnings,
  detectFurnitureGapWarnings,
} from '../geometry'
import { getLayoutSummary } from '../layoutEngine'

// ─── Fixtures ──────────────────────────────────────────────────────────────

const room: Room = { widthCm: 300, heightCm: 330 }

function makeBed(overrides?: Partial<Furniture>): Furniture {
  return {
    id: 'bed-1',
    name: 'Super Single Bed',
    widthCm: 110,
    depthCm: 200,
    xCm: 0,
    yCm: 0,
    rotated: false,
    ...overrides,
  }
}

function makeDesk(overrides?: Partial<Furniture>): Furniture {
  return {
    id: 'desk-1',
    name: 'Computer Desk',
    widthCm: 120,
    depthCm: 60,
    xCm: 150,
    yCm: 0,
    rotated: false,
    ...overrides,
  }
}

// ─── 1. Unit Conversion ────────────────────────────────────────────────────

describe('convertToCm', () => {
  it('returns the same value for cm', () => {
    expect(convertToCm(120, 'cm')).toBe(120)
  })

  it('multiplies by 100 for m', () => {
    expect(convertToCm(3, 'm')).toBe(300)
  })

  it('handles decimal meters', () => {
    expect(convertToCm(1.5, 'm')).toBeCloseTo(150)
  })

  it('handles zero (structural only — validation is separate)', () => {
    expect(convertToCm(0, 'cm')).toBe(0)
    expect(convertToCm(0, 'm')).toBe(0)
  })
})

// ─── 2. Validation ─────────────────────────────────────────────────────────

describe('validatePositiveNumber', () => {
  it('accepts positive integers', () => {
    expect(validatePositiveNumber(120)).toBe(true)
    expect(validatePositiveNumber(1)).toBe(true)
  })

  it('accepts positive floats', () => {
    expect(validatePositiveNumber(0.5)).toBe(true)
    expect(validatePositiveNumber(99.9)).toBe(true)
  })

  it('rejects zero', () => {
    expect(validatePositiveNumber(0)).toBe(false)
  })

  it('rejects negative numbers', () => {
    expect(validatePositiveNumber(-1)).toBe(false)
    expect(validatePositiveNumber(-100)).toBe(false)
  })

  it('rejects NaN', () => {
    expect(validatePositiveNumber(NaN)).toBe(false)
  })

  it('rejects Infinity', () => {
    expect(validatePositiveNumber(Infinity)).toBe(false)
    expect(validatePositiveNumber(-Infinity)).toBe(false)
  })

  it('rejects non-number types', () => {
    expect(validatePositiveNumber('5')).toBe(false)
    expect(validatePositiveNumber(null)).toBe(false)
    expect(validatePositiveNumber(undefined)).toBe(false)
    expect(validatePositiveNumber(true)).toBe(false)
    expect(validatePositiveNumber({})).toBe(false)
  })
})

// ─── 3. Room Area ──────────────────────────────────────────────────────────

describe('getRoomArea', () => {
  it('calculates area correctly', () => {
    expect(getRoomArea({ widthCm: 300, heightCm: 330 })).toBe(99000)
  })

  it('handles non-square rooms', () => {
    expect(getRoomArea({ widthCm: 200, heightCm: 400 })).toBe(80000)
  })
})

// ─── 4. Furniture Effective Size ───────────────────────────────────────────

describe('getFurnitureEffectiveSize', () => {
  it('returns original dimensions when not rotated', () => {
    const bed = makeBed()
    expect(getFurnitureEffectiveSize(bed)).toEqual({ widthCm: 110, depthCm: 200 })
  })

  it('swaps width and depth when rotated', () => {
    const bed = makeBed({ rotated: true })
    expect(getFurnitureEffectiveSize(bed)).toEqual({ widthCm: 200, depthCm: 110 })
  })

  it('does not modify the original furniture object', () => {
    const bed = makeBed()
    getFurnitureEffectiveSize(bed)
    expect(bed.widthCm).toBe(110)
    expect(bed.depthCm).toBe(200)
  })
})

// ─── 5. Furniture Area ─────────────────────────────────────────────────────

describe('getFurnitureArea', () => {
  it('calculates width × depth', () => {
    expect(getFurnitureArea(makeBed())).toBe(22000) // 110 × 200
  })

  it('area is unchanged by rotation (physical dimensions are constant)', () => {
    expect(getFurnitureArea(makeBed({ rotated: true }))).toBe(22000)
  })
})

// ─── 6. Total Furniture Area ───────────────────────────────────────────────

describe('getTotalFurnitureArea', () => {
  it('sums areas of all furniture', () => {
    const list = [makeBed(), makeDesk()]
    // 110×200 = 22000, 120×60 = 7200 → 29200
    expect(getTotalFurnitureArea(list)).toBe(29200)
  })

  it('returns 0 for empty list', () => {
    expect(getTotalFurnitureArea([])).toBe(0)
  })

  it('returns area for a single item', () => {
    expect(getTotalFurnitureArea([makeBed()])).toBe(22000)
  })
})

// ─── 7. Occupancy Percent ──────────────────────────────────────────────────

describe('getOccupancyPercent', () => {
  it('calculates correct percentage', () => {
    const list = [makeBed(), makeDesk()]
    // 29200 / 99000 * 100 ≈ 29.49
    expect(getOccupancyPercent(room, list)).toBeCloseTo(29.49, 1)
  })

  it('returns 0 for empty furniture list', () => {
    expect(getOccupancyPercent(room, [])).toBe(0)
  })

  it('returns 0 when room area is 0', () => {
    expect(getOccupancyPercent({ widthCm: 0, heightCm: 100 }, [makeBed()])).toBe(0)
  })
})

// ─── 8. Occupancy Status ───────────────────────────────────────────────────

describe('getOccupancyStatus', () => {
  it('returns Spacious for 0%', () => {
    expect(getOccupancyStatus(0)).toBe('Spacious')
  })

  it('returns Spacious for exactly 20%', () => {
    expect(getOccupancyStatus(20)).toBe('Spacious')
  })

  it('returns Normal for 20.1%', () => {
    expect(getOccupancyStatus(20.1)).toBe('Normal')
  })

  it('returns Normal for exactly 35%', () => {
    expect(getOccupancyStatus(35)).toBe('Normal')
  })

  it('returns Tight for 35.1%', () => {
    expect(getOccupancyStatus(35.1)).toBe('Tight')
  })

  it('returns Tight for exactly 50%', () => {
    expect(getOccupancyStatus(50)).toBe('Tight')
  })

  it('returns Very tight for 50.1%', () => {
    expect(getOccupancyStatus(50.1)).toBe('Very tight')
  })

  it('returns Very tight for 100%', () => {
    expect(getOccupancyStatus(100)).toBe('Very tight')
  })
})

// ─── 9. Clamp Furniture Inside Room ───────────────────────────────────────

describe('clampFurnitureInsideRoom', () => {
  it('returns same furniture when already inside', () => {
    const bed = makeBed({ xCm: 10, yCm: 10 })
    const result = clampFurnitureInsideRoom(room, bed)
    expect(result).toBe(bed) // same reference — no change needed
  })

  it('clamps x to 0 when negative', () => {
    const result = clampFurnitureInsideRoom(room, makeBed({ xCm: -20 }))
    expect(result.xCm).toBe(0)
  })

  it('clamps y to 0 when negative', () => {
    const result = clampFurnitureInsideRoom(room, makeBed({ yCm: -50 }))
    expect(result.yCm).toBe(0)
  })

  it('clamps right edge to room width', () => {
    // bed effectiveWidth = 110; max x = 300 - 110 = 190
    const result = clampFurnitureInsideRoom(room, makeBed({ xCm: 250 }))
    expect(result.xCm).toBe(190)
  })

  it('clamps bottom edge to room height', () => {
    // bed effectiveDepth = 200; max y = 330 - 200 = 130
    const result = clampFurnitureInsideRoom(room, makeBed({ yCm: 200 }))
    expect(result.yCm).toBe(130)
  })

  it('uses effective size when rotated', () => {
    // rotated bed: effectiveWidth = 200, effectiveDepth = 110
    // max x = 300 - 200 = 100; max y = 330 - 110 = 220
    const rotatedBed = makeBed({ rotated: true, xCm: 200, yCm: 300 })
    const result = clampFurnitureInsideRoom(room, rotatedBed)
    expect(result.xCm).toBe(100)
    expect(result.yCm).toBe(220)
  })

  it('does not mutate the original furniture', () => {
    const bed = makeBed({ xCm: -20 })
    clampFurnitureInsideRoom(room, bed)
    expect(bed.xCm).toBe(-20)
  })
})

// ─── 10. Move Furniture ────────────────────────────────────────────────────

describe('moveFurniture', () => {
  it('moves furniture to the given position', () => {
    const result = moveFurniture(room, makeBed(), 50, 80)
    expect(result.xCm).toBe(50)
    expect(result.yCm).toBe(80)
  })

  it('clamps to room boundaries on move', () => {
    // max x = 300 - 110 = 190
    const result = moveFurniture(room, makeBed(), 999, 0)
    expect(result.xCm).toBe(190)
  })

  it('works with rotated furniture', () => {
    const rotatedBed = makeBed({ rotated: true })
    // effectiveWidth = 200, max x = 300 - 200 = 100
    const result = moveFurniture(room, rotatedBed, 150, 0)
    expect(result.xCm).toBe(100)
  })
})

// ─── 11. Rotate Furniture ─────────────────────────────────────────────────

describe('rotateFurniture', () => {
  it('toggles rotated flag', () => {
    const bed = makeBed({ rotated: false })
    expect(rotateFurniture(room, bed).rotated).toBe(true)
    expect(rotateFurniture(room, rotateFurniture(room, bed)).rotated).toBe(false)
  })

  it('preserves original widthCm and depthCm', () => {
    const result = rotateFurniture(room, makeBed())
    expect(result.widthCm).toBe(110)
    expect(result.depthCm).toBe(200)
  })

  it('clamps position if rotation would exceed room boundary', () => {
    // Place bed at far right: x = 190 (max for unrotated, effectiveWidth = 110)
    // After rotation effectiveWidth = 200, room.width = 300 → max x = 100
    const bed = makeBed({ xCm: 190, yCm: 0 })
    const result = rotateFurniture(room, bed)
    expect(result.xCm).toBe(100) // clamped from 190 to 100
    expect(result.rotated).toBe(true)
  })

  it('does not mutate the original furniture', () => {
    const bed = makeBed()
    rotateFurniture(room, bed)
    expect(bed.rotated).toBe(false)
  })
})

// ─── 12. Overlap Detection ────────────────────────────────────────────────

describe('detectFurnitureOverlap', () => {
  it('detects overlapping furniture', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })         // 0-110 x 0-200
    const b = makeDesk({ xCm: 50, yCm: 50 })       // 50-170 x 50-110
    expect(detectFurnitureOverlap(a, b)).toBe(true)
  })

  it('returns false for non-overlapping furniture', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })          // 0-110 x 0-200
    const b = makeDesk({ xCm: 150, yCm: 0 })       // 150-270 x 0-60
    expect(detectFurnitureOverlap(a, b)).toBe(false)
  })

  it('returns false for touching (edge-sharing) furniture', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })          // right edge at x=110
    const b = makeDesk({ xCm: 110, yCm: 0 })       // left edge at x=110
    expect(detectFurnitureOverlap(a, b)).toBe(false)
  })

  it('detects overlap with rotated furniture', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })           // 0-110 x 0-200
    const b = makeBed({ rotated: true, xCm: 50, yCm: 100 }) // 50-250 x 100-210
    expect(detectFurnitureOverlap(a, b)).toBe(true)
  })
})

describe('detectAllFurnitureOverlaps', () => {
  it('returns no warnings when no overlaps', () => {
    const list = [makeBed(), makeDesk()]  // x=0,y=0 and x=150,y=0 — no overlap
    expect(detectAllFurnitureOverlaps(list)).toHaveLength(0)
  })

  it('returns one warning for one overlapping pair', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })
    const b = makeDesk({ xCm: 50, yCm: 50 })
    const warnings = detectAllFurnitureOverlaps([a, b])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('overlap')
    expect(warnings[0].furnitureIds).toContain('bed-1')
    expect(warnings[0].furnitureIds).toContain('desk-1')
  })

  it('returns multiple warnings for multiple overlapping pairs', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })
    const b = makeDesk({ xCm: 50, yCm: 50 })
    const c: Furniture = {
      id: 'sofa-1',
      name: 'Sofa',
      widthCm: 160,
      depthCm: 80,
      xCm: 0,
      yCm: 0,
      rotated: false,
    }
    const warnings = detectAllFurnitureOverlaps([a, b, c])
    expect(warnings.length).toBeGreaterThanOrEqual(2)
  })

  it('returns empty array for a single furniture item', () => {
    expect(detectAllFurnitureOverlaps([makeBed()])).toHaveLength(0)
  })
})

// ─── 13. Wall Clearance ───────────────────────────────────────────────────

describe('getWallClearance', () => {
  it('calculates correct clearance for unrotated furniture', () => {
    // bed at x=50, y=30; effectiveW=110, effectiveD=200
    // right = 300 - (50+110) = 140, bottom = 330 - (30+200) = 100
    const bed = makeBed({ xCm: 50, yCm: 30 })
    const clearance = getWallClearance(room, bed)
    expect(clearance.left).toBe(50)
    expect(clearance.right).toBe(140)
    expect(clearance.top).toBe(30)
    expect(clearance.bottom).toBe(100)
  })

  it('calculates correct clearance for rotated furniture', () => {
    // rotated bed at x=0, y=0; effectiveW=200, effectiveD=110
    // right = 300-200 = 100, bottom = 330-110 = 220
    const bed = makeBed({ rotated: true, xCm: 0, yCm: 0 })
    const clearance = getWallClearance(room, bed)
    expect(clearance.right).toBe(100)
    expect(clearance.bottom).toBe(220)
  })

  it('returns 0 when furniture touches a wall', () => {
    const bed = makeBed({ xCm: 0, yCm: 0 })
    const clearance = getWallClearance(room, bed)
    expect(clearance.left).toBe(0)
    expect(clearance.top).toBe(0)
  })
})

// ─── 14. Wall Clearance Warnings ─────────────────────────────────────────

describe('detectWallClearanceWarnings', () => {
  it('returns no warning when all clearances >= 60cm', () => {
    const bed = makeBed({ xCm: 70, yCm: 70 })
    const warnings = detectWallClearanceWarnings(room, bed)
    expect(warnings).toHaveLength(0)
  })

  it('returns no warning when furniture touches wall (gap = 0)', () => {
    // left = 0 — touching, not a pathway issue
    const bed = makeBed({ xCm: 0, yCm: 70 })
    const warnings = detectWallClearanceWarnings(room, bed)
    const leftWarnings = warnings.filter(w => w.message.includes('left'))
    expect(leftWarnings).toHaveLength(0)
  })

  it('warns when clearance is between 0 and 60cm (exclusive)', () => {
    // desk at x=0, y=0; right clearance = 300 - (0+120) = 180 (ok)
    // place desk so right clearance = 30: x = 300 - 120 - 30 = 150
    const desk = makeDesk({ xCm: 150, yCm: 100 })
    const warnings = detectWallClearanceWarnings(room, desk)
    const rightWarning = warnings.find(w => w.message.includes('right'))
    expect(rightWarning).toBeDefined()
    expect(rightWarning?.type).toBe('clearance')
    expect(rightWarning?.furnitureIds).toContain('desk-1')
  })

  it('accepts a custom minimum clearance', () => {
    // bed at x=70, y=70 — all clearances >= 60, but left=70 < 100
    const bed = makeBed({ xCm: 70, yCm: 70 })
    const warnings = detectWallClearanceWarnings(room, bed, 100)
    const leftWarning = warnings.find(w => w.message.includes('left'))
    expect(leftWarning).toBeDefined()
  })

  it('uses DEFAULT_MIN_CLEARANCE_CM = 60 by default', () => {
    expect(DEFAULT_MIN_CLEARANCE_CM).toBe(60)
  })
})

// ─── 15. Furniture Gap Warnings ───────────────────────────────────────────

describe('detectFurnitureGapWarnings', () => {
  it('returns no warnings when all gaps >= 60cm', () => {
    // bed x=0-110, desk x=200-320 (not in room but let's test gap logic)
    // gap = 200 - 110 = 90 >= 60
    const bed = makeBed({ xCm: 0, yCm: 0 })
    const desk = makeDesk({ xCm: 200, yCm: 0 })
    expect(detectFurnitureGapWarnings([bed, desk])).toHaveLength(0)
  })

  it('warns when horizontal gap is between 0 and 60cm', () => {
    // bed x=0-110, desk x=150-270; Y both start at 0, overlap in Y (0-60 vs 0-200)
    // horizontal gap = 150 - 110 = 40 < 60 → warning
    const bed = makeBed({ xCm: 0, yCm: 0 })
    const desk = makeDesk({ xCm: 150, yCm: 0 })
    const warnings = detectFurnitureGapWarnings([bed, desk])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('clearance')
    expect(warnings[0].furnitureIds).toContain('bed-1')
    expect(warnings[0].furnitureIds).toContain('desk-1')
  })

  it('warns when vertical gap is less than 60cm', () => {
    // bed x=0-110, y=0-200. shelf x=0-90, y=230-260 (gap = 230-200 = 30 < 60)
    const bed = makeBed({ xCm: 0, yCm: 0 })
    const shelf: Furniture = {
      id: 'shelf-1',
      name: 'Bookshelf',
      widthCm: 90,
      depthCm: 30,
      xCm: 0,
      yCm: 230,
      rotated: false,
    }
    const warnings = detectFurnitureGapWarnings([bed, shelf])
    expect(warnings).toHaveLength(1)
    expect(warnings[0].type).toBe('clearance')
  })

  it('skips gap check when items overlap', () => {
    // overlapping items should not produce gap warnings
    const a = makeBed({ xCm: 0, yCm: 0 })
    const b = makeDesk({ xCm: 50, yCm: 50 })
    const warnings = detectFurnitureGapWarnings([a, b])
    expect(warnings).toHaveLength(0)
  })

  it('works with rotated furniture', () => {
    // rotated bed: effectiveW=200, effectiveD=110, at x=0, y=0
    // desk at x=210, y=0 (gap = 210-200 = 10 < 60) — Y overlap: bed 0-110, desk 0-60
    const bed = makeBed({ rotated: true, xCm: 0, yCm: 0 })
    const desk = makeDesk({ xCm: 210, yCm: 0 })
    const warnings = detectFurnitureGapWarnings([bed, desk])
    expect(warnings).toHaveLength(1)
  })

  it('returns no warnings for an empty or single-item list', () => {
    expect(detectFurnitureGapWarnings([])).toHaveLength(0)
    expect(detectFurnitureGapWarnings([makeBed()])).toHaveLength(0)
  })
})

// ─── 16. Layout Summary ───────────────────────────────────────────────────

describe('getLayoutSummary', () => {
  it('returns correct room area', () => {
    const summary = getLayoutSummary(room, [])
    expect(summary.roomAreaCm2).toBe(99000)
  })

  it('returns correct total furniture area', () => {
    const summary = getLayoutSummary(room, [makeBed(), makeDesk()])
    expect(summary.totalFurnitureAreaCm2).toBe(29200)
  })

  it('returns correct occupancy percentage', () => {
    const summary = getLayoutSummary(room, [makeBed(), makeDesk()])
    // 29200 / 99000 * 100 ≈ 29.49
    expect(summary.occupancyPercent).toBeCloseTo(29.49, 1)
  })

  it('returns correct occupancy status', () => {
    const summary = getLayoutSummary(room, [makeBed(), makeDesk()])
    expect(summary.status).toBe('Normal')
  })

  it('returns Spacious status for empty room', () => {
    const summary = getLayoutSummary(room, [])
    expect(summary.status).toBe('Spacious')
    expect(summary.occupancyPercent).toBe(0)
  })

  it('includes overlap warnings', () => {
    const a = makeBed({ xCm: 0, yCm: 0 })
    const b = makeDesk({ xCm: 50, yCm: 50 })
    const summary = getLayoutSummary(room, [a, b])
    const overlaps = summary.warnings.filter(w => w.type === 'overlap')
    expect(overlaps).toHaveLength(1)
  })

  it('includes wall clearance warnings', () => {
    // desk at x=150, right clearance = 300 - 270 = 30 < 60
    const summary = getLayoutSummary(room, [makeDesk({ xCm: 150, yCm: 100 })])
    const clearanceWarnings = summary.warnings.filter(
      w => w.type === 'clearance' && w.message.includes('right'),
    )
    expect(clearanceWarnings.length).toBeGreaterThan(0)
  })

  it('includes furniture gap warnings', () => {
    // bed and desk 40cm apart — should generate gap warning
    const summary = getLayoutSummary(room, [makeBed(), makeDesk()])
    const gapWarnings = summary.warnings.filter(w => w.type === 'clearance')
    expect(gapWarnings.length).toBeGreaterThan(0)
  })

  it('returns empty warnings when layout is clean', () => {
    // Single furniture item touching walls, no gap issues
    const isolatedBed = makeBed({ xCm: 0, yCm: 0 })
    const summary = getLayoutSummary(room, [isolatedBed])
    // left=0 (touching), top=0 (touching), right=190 (ok), bottom=130 (ok)
    expect(summary.warnings.filter(w => w.type === 'overlap')).toHaveLength(0)
    expect(summary.warnings.filter(w => w.type === 'clearance')).toHaveLength(0)
  })

  it('accepts a custom minimum clearance', () => {
    // With 200cm threshold, isolated bed's right (190cm) and bottom (130cm) would trigger
    const summary = getLayoutSummary(room, [makeBed({ xCm: 0, yCm: 0 })], 200)
    const clearanceWarnings = summary.warnings.filter(w => w.type === 'clearance')
    expect(clearanceWarnings.length).toBeGreaterThan(0)
  })

  it('summary shape matches LayoutSummary type', () => {
    const summary = getLayoutSummary(room, [makeBed()])
    expect(typeof summary.roomAreaCm2).toBe('number')
    expect(typeof summary.totalFurnitureAreaCm2).toBe('number')
    expect(typeof summary.occupancyPercent).toBe('number')
    expect(typeof summary.status).toBe('string')
    expect(Array.isArray(summary.warnings)).toBe(true)
  })
})
