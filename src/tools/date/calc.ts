export type DateUnit = 'days' | 'weeks' | 'months' | 'years'
export type DateOperation = 'add' | 'subtract'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

export function formatDateKo(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${DOW[date.getDay()]})`
}

// ── D-day ────────────────────────────────────────────────────

export interface DDayResult {
  diff: number        // positive = future, 0 = today, negative = past
  label: string       // 'D-day' | 'D-37' | 'D+12'
  isToday: boolean
  isPast: boolean
  totalDays: number   // absolute days
  weeks: number
  remainingDays: number
}

export function calculateDDay(targetStr: string): DDayResult | null {
  if (!targetStr) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = parseLocalDate(targetStr)
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  const abs = Math.abs(diff)
  return {
    diff,
    label: diff === 0 ? 'D-day' : diff > 0 ? `D-${diff}` : `D+${abs}`,
    isToday: diff === 0,
    isPast: diff < 0,
    totalDays: abs,
    weeks: Math.floor(abs / 7),
    remainingDays: abs % 7,
  }
}

// ── 날짜 간격 ─────────────────────────────────────────────────

export interface DateDiffResult {
  totalDays: number
  weeks: number
  remainingDays: number
  approxMonths: number
  isReversed: boolean
}

export function calculateDateDiff(
  startStr: string,
  endStr: string,
  includeStart: boolean
): DateDiffResult | null {
  if (!startStr || !endStr) return null
  let a = parseLocalDate(startStr)
  let b = parseLocalDate(endStr)
  const isReversed = b < a
  if (isReversed) [a, b] = [b, a]
  let totalDays = Math.round((b.getTime() - a.getTime()) / 86400000)
  if (includeStart) totalDays += 1
  return {
    totalDays,
    weeks: Math.floor(totalDays / 7),
    remainingDays: totalDays % 7,
    approxMonths: Math.round(totalDays / 30.44 * 10) / 10,
    isReversed,
  }
}

// ── 날짜 계산 ─────────────────────────────────────────────────

export interface DateCalcResult {
  result: Date
  resultStr: string
  sentence: string
}

const UNIT_LABEL: Record<DateUnit, string> = {
  days: '일', weeks: '주', months: '개월', years: '년',
}

export function calculateDateOffset(
  baseStr: string,
  value: number,
  unit: DateUnit,
  op: DateOperation
): DateCalcResult | null {
  if (!baseStr || value <= 0) return null
  const base = parseLocalDate(baseStr)
  const result = new Date(base)
  const sign = op === 'subtract' ? -1 : 1
  const v = value * sign
  if (unit === 'days')   result.setDate(result.getDate() + v)
  else if (unit === 'weeks')  result.setDate(result.getDate() + v * 7)
  else if (unit === 'months') result.setMonth(result.getMonth() + v)
  else if (unit === 'years')  result.setFullYear(result.getFullYear() + v)
  const opStr = op === 'add' ? '후' : '전'
  const sentence = `${formatDateKo(base)}로부터 ${value}${UNIT_LABEL[unit]} ${opStr}는 ${formatDateKo(result)}이에요.`
  return { result, resultStr: formatDateKo(result), sentence }
}
