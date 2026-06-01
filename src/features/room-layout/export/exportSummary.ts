import type { Room, Furniture, LayoutSummary, LayoutWarning } from '../types'
import { getLayoutSummary } from '../layoutEngine'

export type ExportLayoutOptions = {
  includeSummary: boolean
  includeWarnings: boolean
  includeSpacingGuides: boolean
  fileName?: string
}

export type ExportLayoutResult = {
  blob: Blob
  fileName: string
}

export function getMainLayoutWarning(summary: LayoutSummary): LayoutWarning | null {
  if (summary.warnings.length === 0) return null
  return (
    summary.warnings.find(w => w.type === 'overlap') ??
    summary.warnings.find(w => w.type === 'clearance') ??
    summary.warnings[0]
  )
}

const STATUS_KO: Record<string, string> = {
  Spacious: '여유 있음',
  Normal: '적당함',
  Tight: '좀 빡빡함',
  'Very tight': '매우 비좁음',
}

export function formatLayoutExportSummary(room: Room, furnitureList: Furniture[]) {
  const summary = getLayoutSummary(room, furnitureList)
  const mainWarning = getMainLayoutWarning(summary)

  return {
    roomSizeText: `${room.widthCm} × ${room.heightCm}cm`,
    furnitureCountText: `가구 ${furnitureList.length}개`,
    occupancyText: `${Math.round(summary.occupancyPercent)}%`,
    statusText: STATUS_KO[summary.status] ?? summary.status,
    warningText: mainWarning?.message ?? null,
  }
}
