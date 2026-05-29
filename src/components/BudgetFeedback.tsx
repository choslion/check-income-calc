import { useBudget } from '../context/BudgetContext'
import { calculate } from '../lib/calc'

interface FeedbackConfig {
  message: string
  color: string
  bg: string
  border: string
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
      color: 'var(--color-on-dark-mute)',
      bg: 'var(--color-surface-elevated)',
      border: 'var(--color-hairline-dark)',
    }
  }

  if (remainingAfterExpenses < 0) {
    return {
      message: '지출이 소득을 초과했습니다. 지출을 줄여주세요.',
      color: 'var(--color-danger)',
      bg: 'rgba(226,59,74,0.08)',
      border: 'rgba(226,59,74,0.3)',
    }
  }

  if (savingsTarget > 0 && !savingsAchievable) {
    return {
      message: '저축 목표를 달성하려면 변동 지출을 줄여야 합니다.',
      color: 'var(--color-danger)',
      bg: 'rgba(226,59,74,0.08)',
      border: 'rgba(226,59,74,0.3)',
    }
  }

  if (expenseRatio > 80) {
    return {
      message: '지출 비율이 소득의 80%를 초과했습니다. 지출 점검이 필요합니다.',
      color: '#ec7e00',
      bg: 'rgba(236,126,0,0.08)',
      border: 'rgba(236,126,0,0.3)',
    }
  }

  if (savingsTarget > 0 && savingsAchievable && remainingAfterSavings >= 0) {
    return {
      message: '저축 목표를 달성할 수 있습니다.',
      color: 'var(--color-success)',
      bg: 'rgba(66,134,25,0.08)',
      border: 'rgba(66,134,25,0.3)',
    }
  }

  if (expenseRatio <= 50 && remainingAfterExpenses > 0) {
    return {
      message: '지출 비율이 양호합니다. 저축 목표를 설정해보세요.',
      color: 'var(--color-success)',
      bg: 'rgba(66,134,25,0.08)',
      border: 'rgba(66,134,25,0.3)',
    }
  }

  return {
    message: '수지 균형이 맞습니다. 저축 목표를 설정해보세요.',
    color: 'var(--color-on-dark-mute)',
    bg: 'var(--color-surface-elevated)',
    border: 'var(--color-hairline-dark)',
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
      className="rounded-[20px] px-5 py-4 flex items-center gap-3"
      style={{ backgroundColor: feedback.bg, border: `1px solid ${feedback.border}` }}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: feedback.color }}
      />
      <p className="text-sm font-medium" style={{ color: feedback.color }}>
        {feedback.message}
      </p>
    </div>
  )
}
