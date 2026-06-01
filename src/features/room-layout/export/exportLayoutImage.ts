// Canonical export utilities for the features room-layout engine.
// Canvas drawing for the simulator lives in src/tools/room-simulator/utils/export.ts
// because it uses simulator-specific types (FurnitureItem with `x`/`y`/`color`).

export type { ExportLayoutOptions, ExportLayoutResult } from './exportSummary'
export { getMainLayoutWarning, formatLayoutExportSummary } from './exportSummary'

// ─── Platform utilities (type-independent) ───────────────────────────────────

export function canUseNativeShare(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  )
}

export function getExportFileName(prefix = '방-배치'): string {
  const date = new Date().toISOString().slice(0, 10)
  return `${prefix}-${date}.png`
}

export function downloadLayoutImage(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function shareLayoutImage(blob: Blob, fileName: string): Promise<void> {
  const file = new File([blob], fileName, { type: 'image/png' })

  if (!canUseNativeShare() || !navigator.canShare!({ files: [file] })) {
    downloadLayoutImage(blob, fileName)
    return
  }

  try {
    await navigator.share!({
      title: '방 가구 배치',
      text: '방 가구 배치 시뮬레이터로 만든 레이아웃이에요.',
      files: [file],
    })
  } catch (err) {
    // AbortError = user cancelled share sheet → do nothing
    if (err instanceof DOMException && err.name === 'AbortError') return
    // Other errors → fallback to download
    downloadLayoutImage(blob, fileName)
  }
}
