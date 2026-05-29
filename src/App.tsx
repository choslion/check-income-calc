import { BudgetProvider, useBudget } from './context/BudgetContext'
import { ThemeProvider } from './context/ThemeContext'
import { SalaryInput } from './components/SalaryInput'
import { ExpenseList } from './components/ExpenseList'
import { SavingsTargetInput } from './components/SavingsTargetInput'
import { BudgetSummary } from './components/BudgetSummary'
import { BudgetFeedback } from './components/BudgetFeedback'
import { ThemeSwitch } from './components/ThemeSwitch'
import { AnnualSavingsProjection } from './components/AnnualSavingsProjection'
import { GoalAchievementCalculator } from './components/GoalAchievementCalculator'
import { SpendingHealthScore } from './components/SpendingHealthScore'
import { BudgetRatioDonutChart } from './components/BudgetRatioDonutChart'
import { RotateCcw } from 'lucide-react'

function ResetButton() {
  const { resetAll } = useBudget()
  function handleReset() {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?')) resetAll()
  }
  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 font-semibold transition-colors"
      style={{ color: 'var(--on-dark-mute)', backgroundColor: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)' }}
      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
    >
      <RotateCcw size={12} />
      초기화
    </button>
  )
}

function Calculator() {
  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--canvas)' }}>
      <div className="max-w-xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--on-dark-mute)' }}>
              Budget Calculator
            </p>
            <h1 className="text-4xl font-semibold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.8px' }}>
              월급 계산기
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <ResetButton />
          </div>
        </div>

        {/* 피드백 */}
        <div className="mb-3">
          <BudgetFeedback />
        </div>

        {/* 입력 섹션 */}
        <div className="space-y-3">
          <SalaryInput />
          <ExpenseList type="fixed" />
          <ExpenseList type="variable" />
          <SavingsTargetInput />
        </div>

        {/* 인사이트 섹션 */}
        <div className="space-y-3 mt-3">
          <BudgetRatioDonutChart />
          <SpendingHealthScore />
          <BudgetSummary />
          <AnnualSavingsProjection />
          <GoalAchievementCalculator />
        </div>

        <p className="text-xs text-center mt-8" style={{ color: 'var(--muted)' }}>
          입력한 데이터는 이 기기에만 저장됩니다
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <Calculator />
      </BudgetProvider>
    </ThemeProvider>
  )
}
