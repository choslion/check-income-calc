export function normalizeToMm(value: number, unit: string | null | undefined): number {
  switch (unit?.toLowerCase()) {
    case 'cm': return value * 10
    case 'm': return value * 1000
    default: return value // mm or no unit → treat as mm
  }
}

export function mmToCmStr(mm: number | undefined): string {
  if (!mm) return ''
  return String(parseFloat((mm / 10).toFixed(1)))
}
