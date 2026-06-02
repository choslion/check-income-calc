import type { Room, FurnitureItem, FixedElement } from '../types'
import {
  getOccupancyPercent,
  checkFurnitureOverlaps,
  checkFixedElementConflicts,
  checkClearances,
} from './geometry'

// ── Types ──────────────────────────────────────────────────────────────────────

export type ScoreStatus = 'excellent' | 'good' | 'needsImprovement' | 'tight' | 'problematic'

export interface LayoutScoreResult {
  score: number
  status: ScoreStatus
  statusLabel: string
  breakdown: Array<{ label: string; penalty: number }>
  suggestions: string[]
  mainSuggestion: string | null
}

// ── Status helpers ─────────────────────────────────────────────────────────────

export function getScoreStatus(score: number): ScoreStatus {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 60) return 'needsImprovement'
  if (score >= 40) return 'tight'
  return 'problematic'
}

export function getScoreStatusLabel(status: ScoreStatus): string {
  switch (status) {
    case 'excellent': return '아주 여유로운 배치'
    case 'good': return '좋은 배치'
    case 'needsImprovement': return '개선하면 더 좋은 배치'
    case 'tight': return '다소 불편할 수 있는 배치'
    case 'problematic': return '배치 재검토 필요'
  }
}

export function getScoreColor(status: ScoreStatus): string {
  switch (status) {
    case 'excellent': return '#4fc98a'
    case 'good': return '#4f80f7'
    case 'needsImprovement': return '#f7d04f'
    case 'tight': return '#f7a04f'
    case 'problematic': return '#f76f6f'
  }
}

// ── Main calculator ────────────────────────────────────────────────────────────

const GAP_RE = /(\d+)cm/

export function calculateLayoutScore(
  room: Room,
  furniture: FurnitureItem[],
  fixedElements: FixedElement[],
): LayoutScoreResult {
  if (furniture.length === 0) {
    return {
      score: 100,
      status: 'excellent',
      statusLabel: getScoreStatusLabel('excellent'),
      breakdown: [],
      suggestions: [],
      mainSuggestion: null,
    }
  }

  let totalPenalty = 0
  const breakdown: Array<{ label: string; penalty: number }> = []
  const suggestions: string[] = []

  // ── 1. Furniture-to-furniture physical overlap (-30 each) ─────────────────
  const overlaps = checkFurnitureOverlaps(furniture)
  if (overlaps.length > 0) {
    const p = Math.min(90, overlaps.length * 30)
    totalPenalty += p
    breakdown.push({ label: `가구 겹침 ${overlaps.length}쌍`, penalty: p })
    for (const { a, b } of overlaps.slice(0, 3)) {
      suggestions.push(`${a.name}와(과) ${b.name}이(가) 겹쳐 있어요. 하나를 옮겨주세요.`)
    }
  }

  // ── 2. Fixed element conflicts ────────────────────────────────────────────
  if (fixedElements.length > 0) {
    const fixedWarnings = checkFixedElementConflicts(furniture, fixedElements)

    // Furniture overlaps closet / column / unavailableArea (-25 each)
    const hardOverlaps = fixedWarnings.filter(w => w.id.includes('-overlap'))
    if (hardOverlaps.length > 0) {
      const p = Math.min(75, hardOverlaps.length * 25)
      totalPenalty += p
      breakdown.push({ label: `구조물 겹침 ${hardOverlaps.length}개`, penalty: p })
      for (const w of hardOverlaps.slice(0, 2)) {
        suggestions.push(w.message + ' 해당 구역을 피해 배치해보세요.')
      }
    }

    // Furniture inside door clearance zone (-20 each)
    const doorConflicts = fixedWarnings.filter(w => w.id.includes('-door-clearance'))
    if (doorConflicts.length > 0) {
      const p = Math.min(60, doorConflicts.length * 20)
      totalPenalty += p
      breakdown.push({ label: `문 통행 구역 침범 ${doorConflicts.length}개`, penalty: p })
      for (const w of doorConflicts.slice(0, 2)) {
        suggestions.push(w.message + ' 문 앞 공간을 비워보세요.')
      }
    }

    // Furniture blocks window (-10 each)
    const windowConflicts = fixedWarnings.filter(w => w.id.includes('-window'))
    if (windowConflicts.length > 0) {
      const p = Math.min(20, windowConflicts.length * 10)
      totalPenalty += p
      breakdown.push({ label: `창문 가림 ${windowConflicts.length}개`, penalty: p })
      for (const w of windowConflicts.slice(0, 2)) {
        suggestions.push(w.message + ' 창문 앞 공간을 비워보세요.')
      }
    }
  }

  // ── 3. Clearance gaps ─────────────────────────────────────────────────────
  const clearanceWarnings = checkClearances(room, furniture)
  let criticalCount = 0
  let narrowCount = 0

  for (const w of clearanceWarnings) {
    const m = GAP_RE.exec(w.message)
    const gap = m ? parseInt(m[1]) : 60
    if (gap < 45) criticalCount++
    else narrowCount++
  }

  if (narrowCount > 0) {
    const p = Math.min(30, narrowCount * 10)
    totalPenalty += p
    breakdown.push({ label: `통로 60cm 미만 ${narrowCount}개`, penalty: p })
  }
  if (criticalCount > 0) {
    const p = Math.min(30, criticalCount * 10)
    totalPenalty += p
    breakdown.push({ label: `통로 45cm 미만 ${criticalCount}개 추가`, penalty: p })
  }

  if (clearanceWarnings.length > 0) {
    // Most severe warning first
    const sorted = [...clearanceWarnings].sort((a, b) => {
      const ga = GAP_RE.exec(a.message)
      const gb = GAP_RE.exec(b.message)
      return (ga ? parseInt(ga[1]) : 60) - (gb ? parseInt(gb[1]) : 60)
    })
    const worst = sorted[0]
    const m = GAP_RE.exec(worst.message)
    const gap = m ? parseInt(m[1]) : 60
    const tip = gap < 45
      ? '가구를 회전하거나 배치를 바꿔보세요.'
      : '가구를 회전하거나 벽 쪽으로 더 붙여보세요.'
    suggestions.push(worst.message.replace('좁을 수 있어요.', `좁을 수 있어요. ${tip}`))
  }

  // ── 4. Occupancy (-5 / -15 / -25 tiered) ──────────────────────────────────
  const pct = getOccupancyPercent(room, furniture)
  let occupancyPenalty = 0
  if (pct >= 65) occupancyPenalty = 25
  else if (pct >= 50) occupancyPenalty = 15
  else if (pct >= 35) occupancyPenalty = 5

  if (occupancyPenalty > 0) {
    totalPenalty += occupancyPenalty
    breakdown.push({ label: `가구 점유율 ${pct}%`, penalty: occupancyPenalty })
    if (pct >= 50) {
      suggestions.push(`가구 점유율이 ${pct}%예요. 큰 가구를 줄이거나 더 작은 제품을 비교해보세요.`)
    } else {
      suggestions.push(`가구 점유율이 ${pct}%로 다소 높은 편이에요.`)
    }
  }

  const score = Math.max(0, Math.min(100, 100 - totalPenalty))
  const status = getScoreStatus(score)
  const statusLabel = getScoreStatusLabel(status)

  return {
    score,
    status,
    statusLabel,
    breakdown,
    suggestions,
    mainSuggestion: suggestions.length > 0 ? suggestions[0] : null,
  }
}
