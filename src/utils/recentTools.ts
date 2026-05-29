const KEY = 'lifestyle-tools:last-used'

interface RecentTool {
  toolId: string
  lastUsedAt: string
}

export function recordToolUsage(toolId: string): void {
  try {
    const entry: RecentTool = { toolId, lastUsedAt: new Date().toISOString() }
    localStorage.setItem(KEY, JSON.stringify(entry))
  } catch {
    // localStorage 접근 실패 무시
  }
}

export function getLastUsedTool(): RecentTool | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.toolId !== 'string' || typeof parsed.lastUsedAt !== 'string') return null
    return parsed as RecentTool
  } catch {
    return null
  }
}
