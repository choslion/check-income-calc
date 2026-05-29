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
  if (!resignationDate) return null
  const year = new Date(resignationDate).getFullYear()
  const exact = getPolicyByYear(year)
  if (exact) return exact

  const fallbackYear = Object.keys(data)
    .map(Number)
    .filter((y) => y <= year)
    .sort((a, b) => b - a)[0]

  return fallbackYear != null ? getPolicyByYear(fallbackYear) : null
}

export function getAvailableYears(): number[] {
  return Object.keys(data).map(Number).sort((a, b) => a - b)
}
