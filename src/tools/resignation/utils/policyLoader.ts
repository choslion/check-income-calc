import policyData from '../data/policy-config.json'

export interface PolicySource {
  name: string
  type: string
}

export interface PolicyConfig {
  year: number
  minimumWage: number
  basicDailyWageCap: number
  dailyUpperLimit: number
  dailyLowerLimit: number
  monthlyUpperLimit: number
  monthlyLowerLimit: number
  replaceRate: number
  lowerRate: number
  standardDailyHours: number
  effectiveFrom: string
  sources: PolicySource[]
  updatedAt: string
}

const data = policyData as Record<string, PolicyConfig>

export function getPolicyByYear(year: number): PolicyConfig | null {
  return data[String(year)] ?? null
}

// 퇴사일 기준으로 해당 연도 정책 조회
// 해당 연도 데이터가 없으면 가장 최근 이전 연도 데이터를 사용
export function getPolicyForResignation(resignationDate: string): PolicyConfig | null {
  const years = Object.keys(data).map(Number).sort((a, b) => b - a)
  const latest = years[0] ?? null

  // 퇴사일 없으면 가장 최신 연도 반환
  if (!resignationDate) return latest != null ? getPolicyByYear(latest) : null

  const year = new Date(resignationDate).getFullYear()
  const exact = getPolicyByYear(year)
  if (exact) return exact

  // 해당 연도 없으면 그 이하 최근 연도 반환
  const fallbackYear = years.find((y) => y <= year) ?? null
  return fallbackYear != null ? getPolicyByYear(fallbackYear) : null
}

export function getAvailableYears(): number[] {
  return Object.keys(data).map(Number).sort((a, b) => a - b)
}
