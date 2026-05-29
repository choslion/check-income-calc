import type { BudgetState } from '../types'

const STORAGE_KEY = 'budget-calculator-v1'

const DEFAULT_STATE: BudgetState = {
  salary: 0,
  fixedExpenses: [
    { id: crypto.randomUUID(), name: '월세', amount: 500000 },
    { id: crypto.randomUUID(), name: '통신비', amount: 50000 },
  ],
  variableExpenses: [
    { id: crypto.randomUUID(), name: '식비', amount: 300000 },
    { id: crypto.randomUUID(), name: '교통비', amount: 80000 },
  ],
  savingsTarget: 0,
  goalTarget: 0,
  goalCurrentSaved: 0,
}

export function loadState(): BudgetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE

    const parsed = JSON.parse(raw)

    // 구조 검증: 필수 키가 없으면 기본값 반환
    if (
      typeof parsed !== 'object' ||
      typeof parsed.salary !== 'number' ||
      !Array.isArray(parsed.fixedExpenses) ||
      !Array.isArray(parsed.variableExpenses) ||
      typeof parsed.savingsTarget !== 'number'
    ) {
      return DEFAULT_STATE
    }

    // 각 ExpenseItem 유효성 검사
    const isValidExpenses = (arr: unknown[]): boolean =>
      arr.every(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).id === 'string' &&
          typeof (item as Record<string, unknown>).name === 'string' &&
          typeof (item as Record<string, unknown>).amount === 'number'
      )

    if (
      !isValidExpenses(parsed.fixedExpenses) ||
      !isValidExpenses(parsed.variableExpenses)
    ) {
      return DEFAULT_STATE
    }

    // 구 버전 호환: goalTarget/goalCurrentSaved 없으면 0으로 채움
    return {
      ...parsed,
      goalTarget: typeof parsed.goalTarget === 'number' ? parsed.goalTarget : 0,
      goalCurrentSaved: typeof parsed.goalCurrentSaved === 'number' ? parsed.goalCurrentSaved : 0,
    } as BudgetState
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: BudgetState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
