import type { ResignationState } from './types'

const KEY = 'lifestyle-tools:resignation-calculator'

export const DEFAULT_STATE: ResignationState = {
  employment: {
    hireDate: '',
    resignationDate: '',
    birthYear: '',
    insurancePeriodMonths: '',
    dailyWorkingHours: '8',
  },
  salary: {
    recentThreeMonthSalary: '',
    recentThreeMonthDays: '92',
    showAdvanced: false,
    bonusAmount: '',
    unusedLeaveDays: '',
  },
  pensionType: 'unknown',
  resignationReason: '',
  checklist: {
    insuredDays: false,
    unemployed: false,
    ableToWork: false,
    activeJobSearch: false,
    notDisqualified: false,
    understandsProcess: false,
  },
  survival: {
    currentSavings: '',
    monthlyLivingExpenses: '',
  },
}

export function loadResignationState(): ResignationState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    // 구조 병합 (구 버전 호환)
    return {
      employment: { ...DEFAULT_STATE.employment, ...parsed.employment },
      salary: { ...DEFAULT_STATE.salary, ...parsed.salary },
      pensionType: parsed.pensionType ?? DEFAULT_STATE.pensionType,
      resignationReason: parsed.resignationReason ?? DEFAULT_STATE.resignationReason,
      checklist: { ...DEFAULT_STATE.checklist, ...parsed.checklist },
      survival: { ...DEFAULT_STATE.survival, ...parsed.survival },
    }
  } catch {
    return DEFAULT_STATE
  }
}

export function saveResignationState(state: ResignationState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // 무시
  }
}

export function clearResignationState(): void {
  localStorage.removeItem(KEY)
}
