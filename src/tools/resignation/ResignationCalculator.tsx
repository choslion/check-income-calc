import { useState, useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import type { ResignationState, EligibilityChecklist as EligibilityChecklistType } from './types'
import { loadResignationState, saveResignationState, clearResignationState, DEFAULT_STATE } from './storage'
import { calcEligibilityStatus } from './utils/calc'
import { getPolicyForResignation } from './utils/policyLoader'
import { EmploymentInfoForm } from './components/EmploymentInfoForm'
import { SalaryInfoForm } from './components/SalaryInfoForm'
import { PensionTypeSelector } from './components/PensionTypeSelector'
import { ResignationReasonSelector } from './components/ResignationReasonSelector'
import { EligibilityChecklist } from './components/EligibilityChecklist'
import { ResultSection } from './components/ResultSection'
import { Disclaimer } from './components/Disclaimer'

export function ResignationCalculator() {
  const [state, setState] = useState<ResignationState>(() => loadResignationState())

  useEffect(() => {
    saveResignationState(state)
  }, [state])

  function updateEmployment(field: keyof ResignationState['employment'], value: string) {
    setState(prev => ({ ...prev, employment: { ...prev.employment, [field]: value } }))
  }

  function updateSalary(field: keyof ResignationState['salary'], value: string | boolean) {
    setState(prev => ({ ...prev, salary: { ...prev.salary, [field]: value } }))
  }

  function updateSurvival(field: 'currentSavings' | 'monthlyLivingExpenses', value: string) {
    setState(prev => ({ ...prev, survival: { ...prev.survival, [field]: value } }))
  }

  function updateChecklist(key: keyof EligibilityChecklistType, value: boolean) {
    setState(prev => ({ ...prev, checklist: { ...prev.checklist, [key]: value } }))
  }

  function handleReset() {
    if (window.confirm('퇴사 정산 계산기 데이터를 모두 초기화하시겠습니까?')) {
      clearResignationState()
      setState(DEFAULT_STATE)
    }
  }

  const eligibilityStatus = calcEligibilityStatus(state.resignationReason, state.checklist)
  const policy = getPolicyForResignation(state.employment.resignationDate)

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-3">
        {/* 헤더 */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
              Resignation Calculator
            </p>
            <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
              퇴사 정산 계산기
            </h1>
          </div>
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
        </div>

        <p className="text-sm pb-2" style={{ color: 'var(--on-dark-mute)' }}>
          퇴직금, 실업급여, 퇴사 후 생활 가능 기간을 추정합니다. 모든 결과는 참고용입니다.
        </p>

        {/* 고용 정보 */}
        <EmploymentInfoForm data={state.employment} onChange={updateEmployment} />

        {/* 급여 정보 */}
        <SalaryInfoForm data={state.salary} onChange={updateSalary} />

        {/* 퇴직연금 유형 */}
        <PensionTypeSelector
          value={state.pensionType}
          onChange={(v) => setState(prev => ({ ...prev, pensionType: v }))}
        />

        {/* 퇴사 사유 */}
        <ResignationReasonSelector
          value={state.resignationReason}
          onChange={(v) => setState(prev => ({ ...prev, resignationReason: v }))}
        />

        {/* 실업급여 수급 가능성 체크리스트 */}
        <EligibilityChecklist
          data={state.checklist}
          status={eligibilityStatus}
          onChange={updateChecklist}
        />

        {/* 결과: 퇴직금 + 실업급여 + 생존 기간 */}
        <ResultSection state={state} onSurvivalChange={updateSurvival} />

        {/* 면책 고지 */}
        <Disclaimer policyYear={policy?.year} />

        <p className="text-xs text-center pt-2" style={{ color: 'var(--muted)' }}>
          입력한 데이터는 이 기기에만 저장됩니다
        </p>
      </div>
    </div>
  )
}
