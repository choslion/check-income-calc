import { describe, it, expect } from 'vitest'
import { parseFurnitureSizeText } from '../parseFurnitureSizeText'

// Helper to quickly assert a successful parse result
function expectParsed(
  input: string,
  expected: { widthMm?: number; depthMm?: number; heightMm?: number },
  confidence?: 'high' | 'medium' | 'low',
) {
  const result = parseFurnitureSizeText(input)
  expect(result.success, `Expected success for: "${input}"`).toBe(true)
  if (expected.widthMm !== undefined) {
    expect(result.parsed?.widthMm, `widthMm for "${input}"`).toBe(expected.widthMm)
  }
  if (expected.depthMm !== undefined) {
    expect(result.parsed?.depthMm, `depthMm for "${input}"`).toBe(expected.depthMm)
  }
  if (expected.heightMm !== undefined) {
    expect(result.parsed?.heightMm, `heightMm for "${input}"`).toBe(expected.heightMm)
  }
  if (confidence) {
    expect(result.parsed?.confidence, `confidence for "${input}"`).toBe(confidence)
  }
}

function expectFailure(input: string) {
  const result = parseFurnitureSizeText(input)
  expect(result.success, `Expected failure for: "${input}"`).toBe(false)
  expect(result.errorMessage).toBeTruthy()
}

// ── W / D / H labeled formats ──────────────────────────────────────────────────

describe('W/D/H labeled formats', () => {
  it('W 1400 × D 650 × H 720mm', () => {
    expectParsed('W 1400 × D 650 × H 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('W1400 D650 H720 (no separators)', () => {
    expectParsed('W1400 D650 H720', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('1400(W) × 650(D) × 720(H)', () => {
    expectParsed('1400(W) × 650(D) × 720(H)', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('Width 1400mm Depth 650mm Height 720mm', () => {
    expectParsed('Width 1400mm Depth 650mm Height 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('1400W × 650D × 720H', () => {
    expectParsed('1400W × 650D × 720H', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('W=1400 D=650 H=720 (equals separator)', () => {
    expectParsed('W=1400 D=650 H=720', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('W: 1400 D: 650 H: 720 (colon separator)', () => {
    expectParsed('W: 1400 D: 650 H: 720', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('lowercase: w 1400mm d 650mm h 720mm', () => {
    expectParsed('w 1400mm d 650mm h 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('W/D only — height not required', () => {
    expectParsed('W 1200mm D 600mm', { widthMm: 1200, depthMm: 600 }, 'high')
    const r = parseFurnitureSizeText('W 1200mm D 600mm')
    expect(r.parsed?.heightMm).toBeUndefined()
  })
})

// ── Korean keyword formats ─────────────────────────────────────────────────────

describe('Korean keyword formats', () => {
  it('가로 1400mm 깊이 650mm 높이 720mm', () => {
    expectParsed('가로 1400mm 깊이 650mm 높이 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('폭 1200mm 깊이 600mm 높이 750mm', () => {
    expectParsed('폭 1200mm 깊이 600mm 높이 750mm', { widthMm: 1200, depthMm: 600, heightMm: 750 }, 'high')
  })

  it('너비 1200mm 깊이 600mm 높이 750mm', () => {
    expectParsed('너비 1200mm 깊이 600mm 높이 750mm', { widthMm: 1200, depthMm: 600, heightMm: 750 }, 'high')
  })

  it('가로 140cm 세로 65cm 높이 72cm', () => {
    expectParsed('가로 140cm 세로 65cm 높이 72cm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('사이즈: 가로 1400 / 깊이 650 / 높이 720mm (mixed)', () => {
    expectParsed('사이즈: 가로 1400 / 깊이 650 / 높이 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'high')
  })

  it('가로/깊이 only', () => {
    expectParsed('가로 1400mm 깊이 650mm', { widthMm: 1400, depthMm: 650 }, 'high')
  })
})

// ── Unlabeled triplets ─────────────────────────────────────────────────────────

describe('unlabeled dimension triplets', () => {
  it('1400 x 650 x 720mm (trailing mm)', () => {
    expectParsed('1400 x 650 x 720mm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'medium')
  })

  it('1400 × 650 × 720 (no unit → assumed mm)', () => {
    const r = parseFurnitureSizeText('1400 × 650 × 720')
    expect(r.success).toBe(true)
    expect(r.parsed?.widthMm).toBe(1400)
    expect(r.parsed?.depthMm).toBe(650)
    expect(r.parsed?.heightMm).toBe(720)
    expect(r.parsed?.assumptions.some(a => a.includes('mm'))).toBe(true)
  })

  it('140 × 65 × 72cm (cm unit)', () => {
    expectParsed('140 × 65 × 72cm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'medium')
  })

  it('140cm x 65cm x 72cm (each has cm)', () => {
    expectParsed('140cm x 65cm x 72cm', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'medium')
  })

  it('1.4m x 0.65m x 0.72m', () => {
    expectParsed('1.4m x 0.65m x 0.72m', { widthMm: 1400, depthMm: 650, heightMm: 720 }, 'medium')
  })

  it('1200*600*750mm (asterisk separator)', () => {
    expectParsed('1200*600*750mm', { widthMm: 1200, depthMm: 600, heightMm: 750 }, 'medium')
  })

  it('triplet assumption note is present', () => {
    const r = parseFurnitureSizeText('1400 x 650 x 720mm')
    expect(r.parsed?.assumptions.some(a => a.includes('가로'))).toBe(true)
  })
})

// ── Unlabeled pairs ────────────────────────────────────────────────────────────

describe('unlabeled dimension pairs', () => {
  it('1400 x 650mm', () => {
    expectParsed('1400 x 650mm', { widthMm: 1400, depthMm: 650 }, 'medium')
    const r = parseFurnitureSizeText('1400 x 650mm')
    expect(r.parsed?.heightMm).toBeUndefined()
  })

  it('140 × 65cm', () => {
    expectParsed('140 × 65cm', { widthMm: 1400, depthMm: 650 }, 'medium')
  })

  it('W 1200 D 600 (only pair, no height)', () => {
    expectParsed('W 1200 D 600', { widthMm: 1200, depthMm: 600 })
  })
})

// ── Unit conversion ────────────────────────────────────────────────────────────

describe('unit conversion', () => {
  it('mm values pass through unchanged', () => {
    expectParsed('W 1400mm D 650mm', { widthMm: 1400, depthMm: 650 })
  })

  it('cm values are multiplied ×10', () => {
    expectParsed('W 140cm D 65cm', { widthMm: 1400, depthMm: 650 })
  })

  it('m values are multiplied ×1000', () => {
    expectParsed('W 1.4m D 0.65m', { widthMm: 1400, depthMm: 650 })
  })

  it('missing unit defaults to mm', () => {
    const r = parseFurnitureSizeText('W 1400 D 650')
    expect(r.success).toBe(true)
    expect(r.parsed?.widthMm).toBe(1400)
    expect(r.parsed?.assumptions.some(a => a.includes('mm'))).toBe(true)
  })
})

// ── Error / edge cases ─────────────────────────────────────────────────────────

describe('error handling', () => {
  it('empty string fails gracefully', () => {
    expectFailure('')
    expect(parseFurnitureSizeText('').errorMessage).toBeTruthy()
  })

  it('random text with no numbers fails', () => {
    expectFailure('소파 구매하고 싶어요')
  })

  it('single number is not enough', () => {
    expectFailure('1400mm')
  })

  it('extremely large values (>20m) are rejected', () => {
    expectFailure('W 25000mm D 15000mm')
  })

  it('extremely small values (<10mm) are rejected', () => {
    expectFailure('W 5mm D 3mm')
  })

  it('does not crash on symbols-only text', () => {
    const r = parseFurnitureSizeText('×× ** //')
    expect(r.success).toBe(false)
  })
})

// ── Confidence levels ──────────────────────────────────────────────────────────

describe('confidence', () => {
  it('labeled W/D/H → high confidence', () => {
    const r = parseFurnitureSizeText('W 1400mm D 650mm H 720mm')
    expect(r.parsed?.confidence).toBe('high')
  })

  it('Korean keywords → high confidence', () => {
    const r = parseFurnitureSizeText('가로 1400mm 깊이 650mm')
    expect(r.parsed?.confidence).toBe('high')
  })

  it('unlabeled triplet → medium confidence', () => {
    const r = parseFurnitureSizeText('1400 x 650 x 720mm')
    expect(r.parsed?.confidence).toBe('medium')
  })

  it('unlabeled pair → medium confidence', () => {
    const r = parseFurnitureSizeText('1400 x 650mm')
    expect(r.parsed?.confidence).toBe('medium')
  })
})
