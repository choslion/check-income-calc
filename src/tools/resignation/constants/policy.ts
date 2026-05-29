// 2026년 기준 고용보험 정책 상수
// 출처: 고용노동부 고시, 고용보험 안내
// 매년 최저임금 개정 시 이 파일만 수정하면 됩니다

export const POLICY_YEAR = 2026

// 실업급여 (구직급여)
export const UNEMPLOYMENT = {
  replaceRate: 0.6,             // 평균임금의 60%
  dailyUpperLimit: 68_100,      // 1일 상한액 (2026) — 임금일액 상한 113,500원 × 60%
  wageBaseUpperLimit: 113_500,  // 임금일액 상한 (2026) — 기존 110,000원에서 상향
  lowerRate: 0.8,               // 최저임금의 80%
  minimumHourlyWage: 10_320,    // 최저시급 (2026)
  standardDailyHours: 8,
  get dailyLowerLimit() {
    return Math.floor(this.minimumHourlyWage * this.lowerRate * this.standardDailyHours)
    // 10,320 × 0.8 × 8 = 66,048원
  },
} as const

// 구직급여 지급일수 테이블 (나이 × 피보험기간)
// 출처: 고용보험법 시행령 별표 1
export interface DurationRule {
  ageMin: number
  ageMax: number       // exclusive (Infinity = 상한 없음)
  yearsMin: number     // inclusive
  yearsMax: number     // exclusive (Infinity = 상한 없음)
  days: number
}

export const BENEFIT_DURATION_RULES: DurationRule[] = [
  // 50세 미만
  { ageMin: 0,  ageMax: 50,       yearsMin: 0,  yearsMax: 1,        days: 120 },
  { ageMin: 0,  ageMax: 50,       yearsMin: 1,  yearsMax: 3,        days: 150 },
  { ageMin: 0,  ageMax: 50,       yearsMin: 3,  yearsMax: 5,        days: 180 },
  { ageMin: 0,  ageMax: 50,       yearsMin: 5,  yearsMax: 10,       days: 210 },
  { ageMin: 0,  ageMax: 50,       yearsMin: 10, yearsMax: Infinity, days: 240 },
  // 50세 이상 및 장애인
  { ageMin: 50, ageMax: Infinity, yearsMin: 0,  yearsMax: 1,        days: 120 },
  { ageMin: 50, ageMax: Infinity, yearsMin: 1,  yearsMax: 3,        days: 180 },
  { ageMin: 50, ageMax: Infinity, yearsMin: 3,  yearsMax: 5,        days: 210 },
  { ageMin: 50, ageMax: Infinity, yearsMin: 5,  yearsMax: 10,       days: 240 },
  { ageMin: 50, ageMax: Infinity, yearsMin: 10, yearsMax: Infinity, days: 270 },
]
