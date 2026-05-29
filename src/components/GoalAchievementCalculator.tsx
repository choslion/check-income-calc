import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'
import { calculate, formatKRW, parseAmount, calcMonthsToGoal, formatMonthsToGoal } from '../lib/calc'

export function GoalAchievementCalculator() {
  const { state, dispatch } = useBudget()
  const calc = calculate(state)

  const [goalRaw, setGoalRaw] = useState(state.goalTarget > 0 ? formatKRW(state.goalTarget) : '')
  const [savedRaw, setSavedRaw] = useState(state.goalCurrentSaved > 0 ? formatKRW(state.goalCurrentSaved) : '')

  const monthlySavings = Math.max(0, calc.remainingAfterExpenses)
  const months = calcMonthsToGoal(state.goalTarget, state.goalCurrentSaved, monthlySavings)

  const alreadyAchieved = state.goalTarget > 0 && state.goalCurrentSaved >= state.goalTarget
  const cannotCalculate = state.goalTarget > 0 && monthlySavings <= 0 && !alreadyAchieved

  function handleGoalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseAmount(e.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))
    setGoalRaw(parsed > 0 ? formatKRW(parsed) : e.target.value === '' ? '' : formatKRW(parsed))
    dispatch({ type: 'SET_GOAL_TARGET', payload: parsed })
  }

  function handleSavedChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseAmount(e.target.value.replace(/,/g, '').replace(/[^0-9]/g, ''))
    setSavedRaw(parsed > 0 ? formatKRW(parsed) : e.target.value === '' ? '' : formatKRW(parsed))
    dispatch({ type: 'SET_GOAL_CURRENT_SAVED', payload: parsed })
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    color: 'var(--on-dark)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
    fontFamily: 'var(--font-number)',
  }

  return (
    <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '24px' }}>
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--on-dark-mute)' }}>
        목표 달성 계산기
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--on-dark-mute)' }}>목표 금액</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={goalRaw}
              onChange={handleGoalChange}
              onBlur={() => setGoalRaw(state.goalTarget > 0 ? formatKRW(state.goalTarget) : '')}
              placeholder="0"
              className="w-full px-4 py-2.5 pr-10 text-right text-sm font-medium outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
              onBlurCapture={(e) => (e.target.style.borderColor = 'var(--hairline)')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>원</span>
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: 'var(--on-dark-mute)' }}>
            현재 저축액 <span style={{ color: 'var(--muted)' }}>(선택)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={savedRaw}
              onChange={handleSavedChange}
              onBlur={() => setSavedRaw(state.goalCurrentSaved > 0 ? formatKRW(state.goalCurrentSaved) : '')}
              placeholder="0"
              className="w-full px-4 py-2.5 pr-10 text-right text-sm font-medium outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--info)')}
              onBlurCapture={(e) => (e.target.style.borderColor = 'var(--hairline)')}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>원</span>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {state.goalTarget > 0 && (
        <div
          className="mt-4 py-3 px-4 rounded-xl text-center"
          style={{ backgroundColor: 'var(--surface-input)' }}
        >
          {alreadyAchieved ? (
            <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
              이미 목표를 달성했습니다
            </p>
          ) : cannotCalculate ? (
            <p className="text-sm" style={{ color: 'var(--danger)' }}>
              현재 가용 저축액이 없어 계산할 수 없습니다
            </p>
          ) : months !== null ? (
            <>
              <p className="text-sm mb-1" style={{ color: 'var(--on-dark-mute)' }}>
                목표 달성까지
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: 'var(--primary)', fontFamily: 'var(--font-number)', letterSpacing: '-0.4px' }}
              >
                {formatMonthsToGoal(months)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                월 {formatKRW(monthlySavings)}원 저축 기준
              </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
