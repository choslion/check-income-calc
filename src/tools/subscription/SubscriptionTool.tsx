import { useState, useEffect, useRef, useMemo } from 'react'
import { Plus, Pencil, Trash2, Check, RotateCcw, X, ChevronDown } from 'lucide-react'
import type { Subscription, SubscriptionCategory, SubscriptionStatus } from './types'
import { SUBSCRIPTION_CATEGORIES } from './types'
import { loadSubscriptions, saveSubscriptions } from './storage'
import { calcTotals, calcCategoryTotals, calcUpcomingPayments, toMonthlyCost, toYearlyCost } from './utils/calc'
import { QUICK_ADD_PRESETS, PRESET_GROUPS, SUBSCRIPTION_COLORS } from './data/presets'
import type { SubPreset } from './data/presets'

function fmt(n: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n))
}

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active:          '유지',
  considering:     '고민',
  cancelCandidate: '해지 후보',
}

type StatusConfig = { chipColor: string; chipBg: string; cardBg: string }
const STATUS_CFG: Record<SubscriptionStatus, StatusConfig> = {
  active:          { chipColor: 'var(--on-dark)',   chipBg: 'var(--surface-input)', cardBg: 'var(--surface-card)' },
  considering:     { chipColor: '#f7d04f',           chipBg: 'rgba(247,208,79,0.12)', cardBg: 'rgba(247,208,79,0.04)' },
  cancelCandidate: { chipColor: 'var(--danger)',     chipBg: 'rgba(246,70,93,0.10)', cardBg: 'rgba(246,70,93,0.05)' },
}

function pickColor(existing: Subscription[]): string {
  const used = new Set(existing.map(s => s.color))
  return SUBSCRIPTION_COLORS.find(c => !used.has(c)) ?? SUBSCRIPTION_COLORS[existing.length % SUBSCRIPTION_COLORS.length]
}

type FormErrors = { name?: string; amount?: string }

type SortOrder = 'amount-desc' | 'payment-asc' | 'name-asc' | 'recent-desc'

const SORT_LABELS: Record<SortOrder, string> = {
  'amount-desc':  '금액 높은순',
  'payment-asc':  '결제일 빠른순',
  'name-asc':     '이름순',
  'recent-desc':  '최근 추가순',
}

const SORT_STORAGE_KEY = 'subscription-sort-v1'

function getPaymentSortKey(sub: Subscription): number {
  if (sub.cycle === 'monthly') {
    const pd = sub.paymentDay
    return pd >= 1 && pd <= 31 ? pd : 999
  }
  if (sub.nextPaymentDate) {
    const d = parseInt(sub.nextPaymentDate.split('-')[2] ?? '999', 10)
    return isNaN(d) ? 999 : d
  }
  return 999
}

function sortSubscriptions(subs: Subscription[], order: SortOrder): Subscription[] {
  return [...subs].sort((a, b) => {
    switch (order) {
      case 'amount-desc':
        return toMonthlyCost(b.amount, b.cycle) - toMonthlyCost(a.amount, a.cycle)
      case 'payment-asc':
        return getPaymentSortKey(a) - getPaymentSortKey(b)
      case 'name-asc':
        return a.name.localeCompare(b.name, 'ko')
      case 'recent-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
}

const INPUT_STYLE = {
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-input)',
} as const

function inputStyle(hasError: boolean) {
  return {
    ...INPUT_STYLE,
    ...(hasError ? { border: '1px solid var(--danger)' } : {}),
  }
}

export function SubscriptionTool() {
  const [subs, setSubs] = useState<Subscription[]>(() => loadSubscriptions())
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [category, setCategory] = useState<SubscriptionCategory>('기타')
  const [paymentDay, setPaymentDay] = useState('')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [nextPaymentDate, setNextPaymentDate] = useState('')
  const [sortOrder, setSortOrderState] = useState<SortOrder>(() => {
    const saved = localStorage.getItem(SORT_STORAGE_KEY)
    const valid: SortOrder[] = ['amount-desc', 'payment-asc', 'name-asc', 'recent-desc']
    return valid.includes(saved as SortOrder) ? (saved as SortOrder) : 'amount-desc'
  })
  const formRef = useRef<HTMLDivElement>(null)

  const sortedSubs = useMemo(() => sortSubscriptions(subs, sortOrder), [subs, sortOrder])

  useEffect(() => {
    saveSubscriptions(subs)
  }, [subs])

  const totals = calcTotals(subs)
  const categoryTotals = calcCategoryTotals(subs)
  const addedNames = new Set(subs.map(s => s.name))

  const cancelCandidates = subs.filter(s => s.status === 'cancelCandidate')
  const cancelMonthlySavings = cancelCandidates.reduce((sum, s) => sum + toMonthlyCost(s.amount, s.cycle), 0)

  const upcoming = calcUpcomingPayments(subs)

  function validate(): boolean {
    const errs: FormErrors = {}
    if (!name.trim()) {
      errs.name = '구독명을 입력해 주세요'
    }
    const a = parseFloat(amount.replace(/[,\s]/g, ''))
    if (!amount.trim()) {
      errs.amount = '금액을 입력해 주세요'
    } else if (isNaN(a) || a <= 0) {
      errs.amount = '0보다 큰 금액을 입력해 주세요'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function resetForm() {
    setName('')
    setAmount('')
    setCycle('monthly')
    setCategory('기타')
    setPaymentDay('')
    setNextPaymentDate('')
    setMemo('')
    setErrors({})
    setSelectedPreset(null)
    setShowAdvanced(false)
  }

  // Fills the form with preset values; user can edit before clicking 추가.
  function prefillForm(preset: SubPreset) {
    setName(preset.name)
    setAmount(String(preset.suggestedPrice))
    setCycle(preset.cycle)
    setCategory(preset.category)
    setSelectedPreset(preset.name)
    setEditingId(null)
    setErrors({})
  }

  function startEdit(sub: Subscription) {
    setEditingId(sub.id)
    setName(sub.name)
    setAmount(String(sub.amount))
    setCycle(sub.cycle)
    setCategory(sub.category)
    setPaymentDay(sub.paymentDay > 1 ? String(sub.paymentDay) : '')
    setNextPaymentDate(sub.nextPaymentDate ?? '')
    setMemo(sub.memo)
    setSelectedPreset(null)
    setErrors({})
    // Auto-open advanced if the item has non-default advanced values
    const hasAdvanced = sub.paymentDay > 1 || !!sub.nextPaymentDate || !!sub.memo || sub.category !== '기타'
    setShowAdvanced(hasAdvanced)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function cancelEdit() {
    setEditingId(null)
    resetForm()
  }

  function saveForm() {
    if (!validate()) return
    const a = parseFloat(amount.replace(/[,\s]/g, ''))
    const day = parseInt(paymentDay, 10)
    const pd = !isNaN(day) && day >= 1 && day <= 31 ? day : 1

    if (editingId) {
      setSubs(prev => prev.map(s => s.id === editingId ? {
        ...s,
        name: name.trim(),
        amount: a,
        cycle,
        category,
        paymentDay: cycle === 'monthly' ? pd : 1,
        nextPaymentDate: cycle === 'yearly' && nextPaymentDate ? nextPaymentDate : undefined,
        memo: memo.trim(),
        updatedAt: new Date().toISOString(),
      } : s))
      setEditingId(null)
    } else {
      setSubs(prev => [...prev, {
        id: crypto.randomUUID(),
        name: name.trim(),
        amount: a,
        cycle,
        category,
        paymentDay: cycle === 'monthly' ? pd : 1,
        nextPaymentDate: cycle === 'yearly' && nextPaymentDate ? nextPaymentDate : undefined,
        status: 'active',
        memo: memo.trim(),
        createdAt: new Date().toISOString(),
        color: pickColor(prev),
      }])
    }
    resetForm()
  }

  function removeSub(id: string) {
    if (editingId === id) cancelEdit()
    setSubs(prev => prev.filter(s => s.id !== id))
  }

  function updateStatus(id: string, status: SubscriptionStatus) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status } : s))
  }

  function setSortOrder(order: SortOrder) {
    setSortOrderState(order)
    localStorage.setItem(SORT_STORAGE_KEY, order)
  }

  function removeCancelCandidates() {
    const count = cancelCandidates.length
    if (count === 0) return
    if (window.confirm(`해지 후보로 표시된 ${count}개 구독을 목록에서 제거할까요? 제거 후에는 되돌릴 수 없습니다.`)) {
      const candidateIds = new Set(cancelCandidates.map(s => s.id))
      if (editingId && candidateIds.has(editingId)) cancelEdit()
      setSubs(prev => prev.filter(s => !candidateIds.has(s.id)))
    }
  }

  function handleReset() {
    if (subs.length === 0) return
    if (window.confirm('모든 구독 목록을 초기화하시겠습니까?')) setSubs([])
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
              Subscription Tracker
            </p>
            <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
              구독 계산기
            </h1>
            {subs.length > 0 && (
              <p className="text-sm mt-1" style={{ color: 'var(--on-dark-mute)' }}>
                총 {subs.length}개 구독 중
              </p>
            )}
          </div>
          {subs.length > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 font-semibold"
              style={{ color: 'var(--on-dark-mute)', backgroundColor: 'var(--surface-card)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
            >
              <RotateCcw size={12} />
              초기화
            </button>
          )}
        </div>

        {/* Summary card */}
        <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '20px' }}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>월 합계</p>
              <p className="font-bold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                {fmt(totals.monthlyTotal)}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>연 합계</p>
              <p className="font-bold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                {fmt(totals.yearlyTotal)}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
              </p>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>하루 환산</p>
              <p className="font-bold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                {fmt(Math.round(totals.dailyTotal))}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
              </p>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryTotals.length > 0 && (
          <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '16px 20px' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--on-dark-mute)' }}>카테고리별</p>
            <div className="flex flex-col gap-2">
              {categoryTotals.map(({ category, monthly, count }) => {
                const pct = totals.monthlyTotal > 0
                  ? Math.round((monthly / totals.monthlyTotal) * 100)
                  : 0
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-sm" style={{ color: 'var(--on-dark)' }}>{category}</span>
                        <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>· {count}개</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>{pct}%</span>
                        <span className="text-sm font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>
                          {fmt(Math.round(monthly))}원
                        </span>
                      </div>
                    </div>
                    <div style={{ height: 3, borderRadius: 999, backgroundColor: 'var(--surface-input)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cancel savings banner */}
        {cancelMonthlySavings > 0 && (
          <div style={{ backgroundColor: 'rgba(246,70,93,0.07)', border: '1px solid rgba(246,70,93,0.25)', borderRadius: 'var(--radius-card)', padding: '16px 20px' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--danger)' }}>
              해지 후보 {cancelCandidates.length}개 · 절약 가능 금액
            </p>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>월 절약</p>
                <p className="font-bold" style={{ color: 'var(--danger)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                  {fmt(Math.round(cancelMonthlySavings))}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>연 절약</p>
                <p className="font-bold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                  {fmt(Math.round(cancelMonthlySavings * 12))}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
                </p>
              </div>
            </div>
            <button
              onClick={removeCancelCandidates}
              className="w-full text-sm font-semibold py-2"
              style={{ borderRadius: 'var(--radius-button)', backgroundColor: 'rgba(246,70,93,0.15)', color: 'var(--danger)', border: '1px solid rgba(246,70,93,0.35)', cursor: 'pointer' }}
            >
              해지 후보 목록에서 제거
            </button>
          </div>
        )}

        {/* Upcoming payments */}
        {(upcoming.within7Days > 0 || upcoming.thisMonth > 0) && (
          <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '16px 20px' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--on-dark-mute)' }}>결제 예정</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>7일 내 결제</p>
                <p className="font-bold" style={{ color: upcoming.within7Days > 0 ? 'var(--on-dark)' : 'var(--on-dark-mute)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                  {fmt(Math.round(upcoming.within7Days))}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
                </p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>이번 달 남은</p>
                <p className="font-bold" style={{ color: upcoming.thisMonth > 0 ? 'var(--on-dark)' : 'var(--on-dark-mute)', fontFamily: 'var(--font-number)', fontSize: '20px', letterSpacing: '-0.5px' }}>
                  {fmt(Math.round(upcoming.thisMonth))}<span className="text-sm font-semibold" style={{ color: 'var(--on-dark-mute)', marginLeft: 2 }}>원</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Preset chips — grouped by category */}
        <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '14px 16px' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--on-dark-mute)' }}>빠른 입력</p>
          <div className="flex flex-col gap-4">
            {PRESET_GROUPS.map((group, i) => {
              const groupPresets = QUICK_ADD_PRESETS.filter(p => p.category === group)
              return (
                <div key={group}>
                  {i > 0 && <div style={{ height: 1, backgroundColor: 'var(--hairline)', marginBottom: 12 }} />}
                  <p className="font-bold mb-2" style={{ fontSize: 13, color: 'var(--on-dark)' }}>{group}</p>
                  <div className="flex gap-1.5" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                    {groupPresets.map(preset => {
                      const isSelected = selectedPreset === preset.name
                      const isAdded = addedNames.has(preset.name)
                      return (
                        <button
                          key={preset.name}
                          onClick={() => prefillForm(preset)}
                          className="flex items-center gap-1 text-xs font-semibold shrink-0"
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-pill)',
                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--hairline)'}`,
                            backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-input)',
                            color: isSelected ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                            cursor: 'pointer',
                          }}
                        >
                          {isAdded && !isSelected && <Check size={9} />}
                          {preset.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add / Edit form */}
        <div ref={formRef} style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '14px 16px 16px', outline: editingId ? '1px solid var(--primary)' : 'none' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: editingId ? 'var(--primary)' : 'var(--on-dark-mute)' }}>
            {editingId ? `수정 중: ${name || '…'}` : '직접 추가'}
          </p>
          <div className="flex flex-col gap-3">

            {/* Name */}
            <div>
              <input
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  setSelectedPreset(null)
                  if (errors.name) setErrors(p => ({ ...p, name: undefined }))
                }}
                onKeyDown={e => e.key === 'Enter' && saveForm()}
                placeholder="구독명"
                className="w-full text-sm px-3 py-2 outline-none"
                style={inputStyle(!!errors.name)}
              />
              {errors.name && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.name}</p>
              )}
            </div>

            {/* Amount + Cycle */}
            <div>
              <div className="flex gap-2 items-center">
                <input
                  value={amount}
                  onChange={e => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    setAmount(digits)
                    if (errors.amount) setErrors(p => ({ ...p, amount: undefined }))
                  }}
                  onKeyDown={e => e.key === 'Enter' && saveForm()}
                  placeholder="금액 (원)"
                  inputMode="numeric"
                  className="flex-1 text-sm px-3 py-2 outline-none text-right"
                  style={{ ...inputStyle(!!errors.amount), fontFamily: 'var(--font-number)' }}
                />
                <div className="flex text-xs font-semibold shrink-0" style={{ backgroundColor: 'var(--surface-input)', borderRadius: 'var(--radius-pill)', padding: 2 }}>
                  {(['monthly', 'yearly'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setCycle(c)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-pill)',
                        backgroundColor: cycle === c ? 'var(--primary)' : 'transparent',
                        color: cycle === c ? 'var(--on-primary)' : 'var(--on-dark-mute)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c === 'monthly' ? '월' : '연'}
                    </button>
                  ))}
                </div>
              </div>
              {errors.amount && (
                <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.amount}</p>
              )}
            </div>

            {/* Advanced settings toggle */}
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold self-start"
              style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
            >
              <ChevronDown
                size={13}
                style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              />
              상세 설정
            </button>

            {/* Advanced fields */}
            {showAdvanced && (
              <div className="flex flex-col gap-3">
                {/* Category + Payment day / Next payment date */}
                <div className="flex gap-2 items-center">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SubscriptionCategory)}
                    className="text-xs font-semibold outline-none flex-1"
                    style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', padding: '8px 10px', cursor: 'pointer' }}
                  >
                    {SUBSCRIPTION_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {cycle === 'monthly' ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: 'var(--on-dark-mute)' }}>결제일</span>
                      <input
                        value={paymentDay}
                        onChange={e => {
                          const digits = e.target.value.replace(/[^0-9]/g, '')
                          const n = parseInt(digits, 10)
                          if (digits === '' || (n >= 1 && n <= 31)) setPaymentDay(digits)
                        }}
                        placeholder="—"
                        inputMode="numeric"
                        className="text-sm px-2 py-2 outline-none text-center"
                        style={{ ...INPUT_STYLE, width: 44, fontFamily: 'var(--font-number)' }}
                      />
                      <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>일</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-semibold" style={{ color: 'var(--on-dark-mute)' }}>다음 결제일</span>
                      <input
                        type="date"
                        value={nextPaymentDate}
                        onChange={e => setNextPaymentDate(e.target.value)}
                        className="text-xs px-2 py-2 outline-none"
                        style={{ ...INPUT_STYLE, fontFamily: 'var(--font-number)', colorScheme: 'dark' }}
                      />
                    </div>
                  )}
                </div>
                {/* Memo */}
                <input
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveForm()}
                  placeholder="메모 (선택)"
                  className="w-full text-sm px-3 py-2 outline-none"
                  style={INPUT_STYLE}
                />
              </div>
            )}

            {/* Save / Cancel buttons */}
            <div className="flex justify-end gap-2">
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2"
                  style={{ borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', border: '1px solid var(--hairline)', cursor: 'pointer' }}
                >
                  <X size={13} />
                  취소
                </button>
              )}
              <button
                onClick={saveForm}
                className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2"
                style={{ borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--primary)', color: 'var(--on-primary)', border: 'none', cursor: 'pointer' }}
              >
                {editingId ? <Pencil size={13} /> : <Plus size={14} />}
                {editingId ? '수정 저장' : '추가'}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription list */}
        {subs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold" style={{ color: 'var(--on-dark-mute)' }}>구독 목록</p>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as SortOrder)}
                className="text-xs font-semibold outline-none"
                style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', padding: '4px 8px', cursor: 'pointer' }}
              >
                {(Object.keys(SORT_LABELS) as SortOrder[]).map(o => (
                  <option key={o} value={o}>{SORT_LABELS[o]}</option>
                ))}
              </select>
            </div>
          <div className="space-y-2">
            {sortedSubs.map(sub => {
              const monthlyCost = toMonthlyCost(sub.amount, sub.cycle)
              const yearlyCost = toYearlyCost(sub.amount, sub.cycle)

              const priceLabel = sub.cycle === 'yearly'
                ? `${fmt(yearlyCost)}원/년 (월 ${fmt(Math.round(monthlyCost))}원)`
                : `${fmt(sub.amount)}원/월`

              const details = [
                sub.category,
                priceLabel,
                sub.paymentDay > 1 ? `매월 ${sub.paymentDay}일` : null,
                sub.memo || null,
              ].filter(Boolean).join(' · ')

              const cfg = STATUS_CFG[sub.status]
              const isEditing = editingId === sub.id
              return (
                <div
                  key={sub.id}
                  style={{ backgroundColor: cfg.cardBg, borderRadius: 'var(--radius-card)', padding: '12px 16px', outline: isEditing ? '1px solid var(--primary)' : 'none' }}
                >
                  {/* Top row */}
                  <div className="flex items-center gap-3">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: sub.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--on-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--on-dark-mute)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {details}
                      </p>
                    </div>
                    <p className="text-sm font-bold shrink-0" style={{ color: sub.status === 'cancelCandidate' ? 'var(--danger)' : 'var(--on-dark)', fontFamily: 'var(--font-number)', whiteSpace: 'nowrap' }}>
                      {fmt(Math.round(monthlyCost))}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--on-dark-mute)' }}>원/월</span>
                    </p>
                    <div className="flex items-center shrink-0" style={{ gap: 2 }}>
                      <button
                        onClick={() => startEdit(sub)}
                        style={{ color: isEditing ? 'var(--primary)' : 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', borderRadius: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.color = isEditing ? 'var(--primary)' : 'var(--on-dark-mute)')}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => removeSub(sub.id)}
                        style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', borderRadius: 6 }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {/* Status toggle row */}
                  <div className="flex gap-1 mt-2" style={{ paddingLeft: 22, flexWrap: 'wrap' }}>
                    {(['active', 'considering', 'cancelCandidate'] as SubscriptionStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => updateStatus(sub.id, s)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: sub.status === s ? STATUS_CFG[s].chipBg : 'transparent',
                          color: sub.status === s ? STATUS_CFG[s].chipColor : 'var(--on-dark-mute)',
                          border: `1px solid ${sub.status === s ? STATUS_CFG[s].chipColor : 'var(--hairline)'}`,
                          cursor: 'pointer',
                        }}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          </div>
        )}

        {/* Empty state */}
        {subs.length === 0 && (
          <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '32px 20px', textAlign: 'center' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--on-dark)' }}>아직 추가된 구독이 없어요</p>
            <p className="text-xs mt-1.5" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
              위에서 서비스를 선택하거나<br />금액을 직접 입력해서 추가해 보세요
            </p>
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
          입력한 데이터는 이 기기에만 저장됩니다
        </p>
      </div>
    </div>
  )
}
