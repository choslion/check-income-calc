import { useEffect } from 'react'
import { BudgetProvider, useBudget } from '../../context/BudgetContext'
import { SalaryInput } from '../../components/SalaryInput'
import { ExpenseList } from '../../components/ExpenseList'
import { SavingsTargetInput } from '../../components/SavingsTargetInput'
import { BudgetSummary } from '../../components/BudgetSummary'
import { BudgetFeedback } from '../../components/BudgetFeedback'
import { AnnualSavingsProjection } from '../../components/AnnualSavingsProjection'
import { GoalAchievementCalculator } from '../../components/GoalAchievementCalculator'
import { SpendingHealthScore } from '../../components/SpendingHealthScore'
import { BudgetRatioDonutChart } from '../../components/BudgetRatioDonutChart'
import { recordToolUsage } from '../../utils/recentTools'
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

function BudgetCalculator() {
  useEffect(() => {
    document.title = '예산 계산기 · 생활계산소'
    recordToolUsage('budget')
  }, [])

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
              Budget Calculator
            </p>
            <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
              예산 계산기
            </h1>
          </div>
          <ResetButton />
        </div>

        <div className="mb-3">
          <BudgetFeedback />
        </div>

        <div className="space-y-3">
          <SalaryInput />
          <ExpenseList type="fixed" />
          <ExpenseList type="variable" />
          <SavingsTargetInput />
        </div>

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

export default function BudgetPage() {
  return (
    <BudgetProvider>
      <BudgetCalculator />
    </BudgetProvider>
  )
}
