export interface EmploymentInfo {
  hireDate: string           // YYYY-MM-DD
  resignationDate: string    // YYYY-MM-DD
  birthYear: string          // YYYY
  insurancePeriodMonths: string  // 총 피보험기간 (개월)
  dailyWorkingHours: string  // 일 근무시간 (기본 8)
}

export interface SalaryInfo {
  recentThreeMonthSalary: string  // 최근 3개월 총 급여
  recentThreeMonthDays: string    // 최근 3개월 일수 (기본 92)
  showAdvanced: boolean
  bonusAmount: string             // 연간 상여금
  unusedLeaveDays: string         // 미사용 연차 일수
}

export type PensionType = 'general' | 'db' | 'dc' | 'unknown'

export type ResignationReason =
  | 'recommended'   // 권고사직
  | 'contract_end'  // 계약만료
  | 'layoff'        // 해고
  | 'closure'       // 폐업
  | 'wage_delay'    // 임금체불
  | 'long_commute'  // 장거리 통근/이사
  | 'health'        // 건강 문제
  | 'voluntary'     // 자발적 퇴사
  | 'misconduct'    // 중대한 귀책사유 (징계해고 등)
  | 'unknown'       // 모름
  | ''

export interface EligibilityChecklist {
  insuredDays: boolean       // 180일 이상 피보험 여부
  unemployed: boolean        // 실직 상태 또는 예정
  ableToWork: boolean        // 취업 의지 및 능력
  activeJobSearch: boolean   // 적극적 구직 활동
  notDisqualified: boolean   // 수급자격 제한 사유 없음
  understandsProcess: boolean // 고용센터 결정 이해
}

export interface SurvivalInfo {
  currentSavings: string         // 현재 저축
  monthlyLivingExpenses: string  // 월 생활비
}

export interface ResignationState {
  employment: EmploymentInfo
  salary: SalaryInfo
  pensionType: PensionType
  resignationReason: ResignationReason
  checklist: EligibilityChecklist
  survival: SurvivalInfo
}

export type EligibilityStatus = 'high' | 'medium' | 'low' | 'unknown'
