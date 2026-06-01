import type { FurnitureSizeParseResult, ParsedFurnitureSize } from './parsedSizeTypes'
import { normalizeToMm } from './unitConversion'

type RawDim = { value: number; unit: string | null }

// ── Helpers ────────────────────────────────────────────────────────────────────

function findTrailingUnit(text: string): string | null {
  // Match a unit that is directly attached to a digit at end of string
  const m = /\d(mm|cm|m)\s*$/i.exec(text.trim())
  return m ? m[1].toLowerCase() : null
}

function applyUnit(raw: RawDim, trailingUnit: string | null): number {
  return normalizeToMm(raw.value, raw.unit ?? trailingUnit)
}

function escRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Strategy 1: W / D / H labeled ─────────────────────────────────────────────
// Handles: "W 1400mm", "Width: 1400", "w=1400", "1400W", "1400(Width)"

function extractByLabel(text: string, labels: string[]): RawDim | null {
  // Longer labels first to avoid 'w' matching inside 'width'
  const sorted = [...labels].sort((a, b) => b.length - a.length)
  const labelRe = sorted.map(escRe).join('|')

  // Forward: label → number
  const fwd = new RegExp(
    `(?<![a-zA-Z])(${labelRe})\\s*[=:]?\\s*(\\d+(?:\\.\\d+)?)\\s*(mm|cm|m)?(?![a-zA-Z0-9])`,
    'i',
  )
  // Reverse: number → (label)
  const rev = new RegExp(
    `(\\d+(?:\\.\\d+)?)\\s*(mm|cm|m)?\\s*\\(?\\s*(?<![a-zA-Z])(${labelRe})\\s*\\)?(?![a-zA-Z0-9])`,
    'i',
  )

  let m: RegExpExecArray | null
  if ((m = fwd.exec(text))) {
    return { value: parseFloat(m[2]), unit: m[3]?.toLowerCase() ?? null }
  }
  if ((m = rev.exec(text))) {
    return { value: parseFloat(m[1]), unit: m[2]?.toLowerCase() ?? null }
  }
  return null
}

function extractLabeledDimensions(text: string): ParsedFurnitureSize | null {
  const wRaw = extractByLabel(text, ['width', 'w'])
  const dRaw = extractByLabel(text, ['depth', 'd'])
  const hRaw = extractByLabel(text, ['height', 'h'])

  if (!wRaw && !dRaw) return null

  const trailing = findTrailingUnit(text)
  const assumptions: string[] = []
  const anyUnit = wRaw?.unit ?? dRaw?.unit ?? hRaw?.unit ?? trailing
  if (!anyUnit) assumptions.push('단위가 없어서 mm로 처리했어요')

  return {
    widthMm: wRaw ? applyUnit(wRaw, trailing) : undefined,
    depthMm: dRaw ? applyUnit(dRaw, trailing) : undefined,
    heightMm: hRaw ? applyUnit(hRaw, trailing) : undefined,
    sourceText: text,
    confidence: 'high',
    assumptions,
  }
}

// ── Strategy 2: Korean keywords ────────────────────────────────────────────────
// 가로/폭/너비, 깊이/세로, 높이

function extractKorean(text: string, keywords: string[]): RawDim | null {
  const kwRe = keywords.map(escRe).join('|')
  const m = new RegExp(
    `(?:${kwRe})\\s*[:：]?\\s*(\\d+(?:\\.\\d+)?)\\s*(mm|cm|m)?`,
    'i',
  ).exec(text)
  if (!m) return null
  return { value: parseFloat(m[1]), unit: m[2]?.toLowerCase() ?? null }
}

function extractKoreanDimensions(text: string): ParsedFurnitureSize | null {
  const wRaw = extractKorean(text, ['가로', '폭', '너비'])
  const dRaw = extractKorean(text, ['깊이', '세로'])
  const hRaw = extractKorean(text, ['높이'])

  if (!wRaw && !dRaw) return null

  const trailing = findTrailingUnit(text)
  const assumptions: string[] = []
  const anyUnit = wRaw?.unit ?? dRaw?.unit ?? hRaw?.unit ?? trailing
  if (!anyUnit) assumptions.push('단위가 없어서 mm로 처리했어요')

  return {
    widthMm: wRaw ? applyUnit(wRaw, trailing) : undefined,
    depthMm: dRaw ? applyUnit(dRaw, trailing) : undefined,
    heightMm: hRaw ? applyUnit(hRaw, trailing) : undefined,
    sourceText: text,
    confidence: 'high',
    assumptions,
  }
}

// ── Strategy 3: Unlabeled triplet (W × D × H inferred) ────────────────────────

const SEP = `[×xX\\*,/]`
const NUM = `(\\d+(?:\\.\\d+)?)`
const UNIT = `(mm|cm|m)?`

const TRIPLET_RE = new RegExp(
  `${NUM}\\s*${UNIT}\\s*${SEP}\\s*${NUM}\\s*${UNIT}\\s*${SEP}\\s*${NUM}\\s*${UNIT}`,
  'i',
)

function extractDimensionTriplet(text: string): ParsedFurnitureSize | null {
  const m = TRIPLET_RE.exec(text)
  if (!m) return null

  const trailing = findTrailingUnit(text)
  const u1 = m[2]?.toLowerCase() ?? null
  const u2 = m[4]?.toLowerCase() ?? null
  const u3 = m[6]?.toLowerCase() ?? null
  const anyUnit = u1 ?? u2 ?? u3 ?? trailing

  const assumptions = ['가로 × 깊이 × 높이 순서로 인식했어요. 맞는지 확인해 주세요.']
  if (!anyUnit) assumptions.push('단위가 없어서 mm로 처리했어요')

  return {
    widthMm: normalizeToMm(parseFloat(m[1]), u1 ?? trailing),
    depthMm: normalizeToMm(parseFloat(m[3]), u2 ?? trailing),
    heightMm: normalizeToMm(parseFloat(m[5]), u3 ?? trailing),
    sourceText: text,
    confidence: 'medium',
    assumptions,
  }
}

// ── Strategy 4: Unlabeled pair (W × D inferred) ───────────────────────────────

const PAIR_RE = new RegExp(
  `${NUM}\\s*${UNIT}\\s*${SEP}\\s*${NUM}\\s*${UNIT}`,
  'i',
)

function extractDimensionPair(text: string): ParsedFurnitureSize | null {
  const m = PAIR_RE.exec(text)
  if (!m) return null

  const trailing = findTrailingUnit(text)
  const u1 = m[2]?.toLowerCase() ?? null
  const u2 = m[4]?.toLowerCase() ?? null
  const anyUnit = u1 ?? u2 ?? trailing

  const assumptions = ['가로 × 깊이 순서로 인식했어요. 맞는지 확인해 주세요.']
  if (!anyUnit) assumptions.push('단위가 없어서 mm로 처리했어요')

  return {
    widthMm: normalizeToMm(parseFloat(m[1]), u1 ?? trailing),
    depthMm: normalizeToMm(parseFloat(m[3]), u2 ?? trailing),
    sourceText: text,
    confidence: 'medium',
    assumptions,
  }
}

// ── Main entry ─────────────────────────────────────────────────────────────────

const MIN_REASONABLE_MM = 10
const MAX_REASONABLE_MM = 20000

function isReasonable(mm: number | undefined): boolean {
  if (mm === undefined) return true
  return mm >= MIN_REASONABLE_MM && mm <= MAX_REASONABLE_MM
}

export function parseFurnitureSizeText(text: string): FurnitureSizeParseResult {
  const cleaned = text.trim()
  if (!cleaned) {
    return { success: false, errorMessage: '텍스트를 입력해 주세요.' }
  }

  const parsed =
    extractLabeledDimensions(cleaned) ??
    extractKoreanDimensions(cleaned) ??
    extractDimensionTriplet(cleaned) ??
    extractDimensionPair(cleaned)

  if (!parsed || (!parsed.widthMm && !parsed.depthMm)) {
    return {
      success: false,
      errorMessage: '사이즈를 인식하지 못했습니다. 문구를 확인하거나 직접 입력해 주세요.',
    }
  }

  if (!isReasonable(parsed.widthMm) || !isReasonable(parsed.depthMm) || !isReasonable(parsed.heightMm)) {
    return {
      success: false,
      errorMessage: '인식된 치수가 너무 작거나 큰 것 같아요. 단위를 확인해 주세요.',
    }
  }

  return { success: true, parsed }
}
