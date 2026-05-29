import { useBudget } from '../context/BudgetContext'
import { calculate } from '../lib/calc'

interface FeedbackConfig {
  message: string
  color: string
  bg: string
}

function getFeedback(
  salary: number,
  expenseRatio: number,
  remainingAfterExpenses: number,
  remainingAfterSavings: number,
  savingsTarget: number,
  savingsAchievable: boolean
): FeedbackConfig {
  if (salary === 0) {
    return {
      message: '월 소득을 입력하면 결과를 확인할 수 있습니다.',
      color: 'var(--color-muted)',
      bg: 'var(--color-surface-elevated-dark)',
    }
  }

  if (remainingAfterExpenses < 0) {
    return {
      message: '지출이 소득을 초과했습니다. 지출을 줄여주세요.',
      color: 'var(--color-trading-down)',
      bg: 'rgba(246,70,93,0.08)',
    }
  }

  if (savingsTarget > 0 && !savingsAchievable) {
    return {
      message: '저축 목표를 달성하려면 변동 지출을 줄여야 합니다.',
      color: 'var(--color-trading-down)',
      bg: 'rgba(246,70,93,0.08)',
    }
  }

  if (expenseRatio > 80) {
    return {
      message: '지출 비율이 소득의 80%를 초과했습니다. 지출 점검이 필요합니다.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
    }
  }

  if (savingsTarget > 0 && savingsAchievable && remainingAfterSavings >= 0) {
    return {
      message: '저축 목표를 달성할 수 있습니다.',
      color: 'var(--color-trading-up)',
      bg: 'rgba(14,203,129,0.08)',
    }
  }

  if (expenseRatio <= 50 && remainingAfterExpenses > 0) {
    return {
      message: '지출 비율이 양호합니다. 저축 목표를 설정해보세요.',
      color: 'var(--color-trading-up)',
      bg: 'rgba(14,203,129,0.08)',
    }
  }

  return {
    message: '수지 균형이 맞습니다. 저축 목표를 설정해보세요.',
    color: 'var(--color-muted-strong)',
    bg: 'var(--color-surface-elevated-dark)',
  }
}

export function BudgetFeedback() {
  const { state } = useBudget()
  const calc = calculate(state)

  const feedback = getFeedback(
    state.salary,
    calc.expenseRatio,
    calc.remainingAfterExpenses,
    calc.remainingAfterSavings,
    state.savingsTarget,
    calc.savingsAchievable
  )

  return (
    <div
      className="rounded-xl p-4 flex items-start gap-3"
      style={{ backgroundColor: feedback.bg, border: `1px solid ${feedback.color}22` }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
        style={{ backgroundColor: feedback.color }}
      />
      <p className="text-sm font-medium leading-relaxed" style={{ color: feedback.color }}>
        {feedback.message}
      </p>
    </div>
  )
}
