import { BudgetProvider, useBudget } from './context/BudgetContext'
import { SalaryInput } from './components/SalaryInput'
import { ExpenseList } from './components/ExpenseList'
import { SavingsTargetInput } from './components/SavingsTargetInput'
import { BudgetSummary } from './components/BudgetSummary'
import { BudgetFeedback } from './components/BudgetFeedback'
import { RotateCcw } from 'lucide-react'

function ResetButton() {
  const { resetAll } = useBudget()

  function handleReset() {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?')) {
      resetAll()
    }
  }

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors"
      style={{
        color: 'var(--color-muted)',
        backgroundColor: 'var(--color-surface-card-dark)',
        border: '1px solid var(--color-hairline-on-dark)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.color = 'var(--color-trading-down)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = 'var(--color-muted)')
      }
    >
      <RotateCcw size={12} />
      전체 초기화
    </button>
  )
}

function Calculator() {
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ backgroundColor: 'var(--color-canvas-dark)' }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--color-on-dark)' }}
            >
              월급 계산기
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>
              소득 · 지출 · 저축 한눈에 확인
            </p>
          </div>
          <ResetButton />
        </div>

        <div className="mb-4">
          <BudgetFeedback />
        </div>

        <div className="space-y-4">
          <SalaryInput />
          <ExpenseList type="fixed" />
          <ExpenseList type="variable" />
          <SavingsTargetInput />
          <BudgetSummary />
        </div>

        <p
          className="text-xs text-center mt-8"
          style={{ color: 'var(--color-muted)' }}
        >
          입력한 데이터는 이 기기에만 저장됩니다
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <Calculator />
    </BudgetProvider>
  )
}
