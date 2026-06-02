import type { Room, LayoutVersion, LayoutVersionSummary } from '../types'
import {
  getOccupancyPercent,
  getOccupancyStatus,
  checkClearances,
  checkFixedElementConflicts,
  getMinimumClearanceCm,
} from './geometry'
import { calculateLayoutScore } from './layoutScore'

const VERSION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function getVersionName(index: number): string {
  return index < 26 ? `${VERSION_LETTERS[index]}안` : `배치 ${index + 1}`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function createLayoutVersion(room: Room, name?: string, index = 0): LayoutVersion {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name: name ?? getVersionName(index),
    room: { ...room },
    furnitureList: [],
    fixedElements: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function duplicateLayoutVersion(
  version: LayoutVersion,
  allVersions: LayoutVersion[],
): LayoutVersion {
  const now = new Date().toISOString()
  const existingNames = new Set(allVersions.map(v => v.name))
  let counter = 2
  let newName = `${version.name} 2`
  while (existingNames.has(newName)) {
    counter++
    newName = `${version.name} ${counter}`
  }
  return {
    id: generateId(),
    name: newName,
    room: { ...version.room },
    furnitureList: version.furnitureList.map(f => ({ ...f })),
    fixedElements: version.fixedElements.map(el => ({ ...el })),
    createdAt: now,
    updatedAt: now,
  }
}

type BaseSummary = Omit<LayoutVersionSummary, 'isRecommended' | 'recommendedReason'>

function computeBaseSummary(version: LayoutVersion): BaseSummary {
  const { room, furnitureList: furniture, fixedElements } = version
  const occupancyPercent = getOccupancyPercent(room, furniture)
  const status = getOccupancyStatus(occupancyPercent)
  const fixedConflicts = checkFixedElementConflicts(furniture, fixedElements)
  const clearanceWarnings = checkClearances(room, furniture)
  const allWarnings = [...fixedConflicts, ...clearanceWarnings]
  const scoreResult = calculateLayoutScore(room, furniture, fixedElements)
  return {
    layoutVersionId: version.id,
    name: version.name,
    occupancyPercent,
    status,
    furnitureCount: furniture.length,
    warningCount: allWarnings.length,
    overlapWarningCount: allWarnings.filter(w => w.id.includes('overlap')).length,
    fixedElementConflictCount: fixedConflicts.length,
    minimumClearanceCm: getMinimumClearanceCm(room, furniture),
    mainWarning: allWarnings.find(w => w.id.includes('overlap')) ?? allWarnings[0] ?? null,
    score: scoreResult.score,
    scoreStatusLabel: scoreResult.statusLabel,
    mainSuggestion: scoreResult.mainSuggestion,
  }
}

function scoreVersion(s: BaseSummary): number {
  let score = 0
  score += s.overlapWarningCount * 1000
  score += s.fixedElementConflictCount * 200
  score += s.warningCount * 10
  score += s.occupancyPercent
  if (s.minimumClearanceCm !== null) score -= s.minimumClearanceCm * 0.5
  return score
}

function getRecommendedReason(s: BaseSummary): string {
  if (s.warningCount === 0) return '주의사항이 없어요'
  if (s.overlapWarningCount === 0) return '겹침 없이 배치됐어요'
  if (s.minimumClearanceCm !== null && s.minimumClearanceCm >= 60) return '모든 통로가 60cm 이상이에요'
  return '현재 기준에서 가장 여유로워요'
}

export function getLayoutVersionSummaries(versions: LayoutVersion[]): LayoutVersionSummary[] {
  if (versions.length === 0) return []
  const bases = versions.map(v => computeBaseSummary(v))

  let recommendedId: string | null = null
  if (versions.length > 1) {
    let best = bases[0]
    for (const s of bases) {
      if (scoreVersion(s) < scoreVersion(best)) best = s
    }
    recommendedId = best.layoutVersionId
  }

  return bases.map(s => ({
    ...s,
    isRecommended: s.layoutVersionId === recommendedId,
    recommendedReason: s.layoutVersionId === recommendedId ? getRecommendedReason(s) : null,
  }))
}
