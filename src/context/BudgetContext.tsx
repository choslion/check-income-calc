import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { BudgetState, ExpenseItem } from '../types'
import { loadState, saveState, clearState } from '../lib/storage'
import { MAX_AMOUNT } from '../lib/calc'

type Action =
  | { type: 'SET_SALARY'; payload: number }
  | { type: 'SET_SAVINGS_TARGET'; payload: number }
  | { type: 'SET_GOAL_TARGET'; payload: number }
  | { type: 'SET_GOAL_CURRENT_SAVED'; payload: number }
  | { type: 'ADD_FIXED_EXPENSE' }
  | { type: 'ADD_VARIABLE_EXPENSE' }
  | { type: 'UPDATE_FIXED_EXPENSE'; payload: ExpenseItem }
  | { type: 'UPDATE_VARIABLE_EXPENSE'; payload: ExpenseItem }
  | { type: 'DELETE_FIXED_EXPENSE'; payload: string }
  | { type: 'DELETE_VARIABLE_EXPENSE'; payload: string }
  | { type: 'RESET' }

function clampAmount(n: number): number {
  return Math.max(0, Math.min(n, MAX_AMOUNT))
}

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case 'SET_SALARY':
      return { ...state, salary: clampAmount(action.payload) }

    case 'SET_SAVINGS_TARGET':
      return { ...state, savingsTarget: clampAmount(action.payload) }

    case 'SET_GOAL_TARGET':
      return { ...state, goalTarget: clampAmount(action.payload) }

    case 'SET_GOAL_CURRENT_SAVED':
      return { ...state, goalCurrentSaved: clampAmount(action.payload) }

    case 'ADD_FIXED_EXPENSE':
      return {
        ...state,
        fixedExpenses: [
          ...state.fixedExpenses,
          { id: crypto.randomUUID(), name: '', amount: 0 },
        ],
      }

    case 'ADD_VARIABLE_EXPENSE':
      return {
        ...state,
        variableExpenses: [
          ...state.variableExpenses,
          { id: crypto.randomUUID(), name: '', amount: 0 },
        ],
      }

    case 'UPDATE_FIXED_EXPENSE':
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.map((e) =>
          e.id === action.payload.id
            ? { ...action.payload, amount: clampAmount(action.payload.amount) }
            : e
        ),
      }

    case 'UPDATE_VARIABLE_EXPENSE':
      return {
        ...state,
        variableExpenses: state.variableExpenses.map((e) =>
          e.id === action.payload.id
            ? { ...action.payload, amount: clampAmount(action.payload.amount) }
            : e
        ),
      }

    case 'DELETE_FIXED_EXPENSE':
      return {
        ...state,
        fixedExpenses: state.fixedExpenses.filter((e) => e.id !== action.payload),
      }

    case 'DELETE_VARIABLE_EXPENSE':
      return {
        ...state,
        variableExpenses: state.variableExpenses.filter((e) => e.id !== action.payload),
      }

    case 'RESET':
      return loadState()

    default:
      return state
  }
}

interface BudgetContextValue {
  state: BudgetState
  dispatch: React.Dispatch<Action>
  resetAll: () => void
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  function resetAll() {
    clearState()
    dispatch({ type: 'RESET' })
  }

  return (
    <BudgetContext.Provider value={{ state, dispatch, resetAll }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider')
  return ctx
}
