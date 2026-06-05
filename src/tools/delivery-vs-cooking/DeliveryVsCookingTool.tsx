import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { calculateDeliveryVsCooking } from './calc'
import type { HandoffToCalculator, Winner } from './types'

const HANDOFF_KEY = 'food-budget-handoff'

function fmt(n: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.round(n))
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''))
  return isNaN(n) || n < 0 ? 0 : n
}

const WINNER_CFG: Record<Winner, { label: string; color: string; bg: string }> = {
  cooking:  { label: '요리가 더 이득',  color: 'var(--success)',      bg: 'rgba(14,203,129,0.1)'  },
  delivery: { label: '배달이 더 이득',  color: 'var(--primary)',      bg: 'rgba(252,213,53,0.1)'  },
  similar:  { label: '비슷한 비용',     color: 'var(--on-dark-mute)', bg: 'var(--surface-input)'  },
}

const INPUT_BASE = {
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-input)',
  fontFamily: 'var(--font-number)',
}

// Field: label on top, input below
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: 'var(--on-dark-mute)' }}>{label}</span>
      {children}
    </div>
  )
}

// UnitInput: right-aligned number, unit at far right with enough padding
function UnitInput({
  value, onChange, unit, placeholder = '0',
}: {
  value: string
  onChange: (v: string) => void
  unit: string
  placeholder?: string
}) {
  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 text-right text-sm outline-none transition-all"
        style={INPUT_BASE}
        onFocus={e => (e.target.style.borderColor = 'var(--info)')}
        onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
      />
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
        style={{ color: 'var(--muted)' }}
      >
        {unit}
      </span>
    </div>
  )
}

export function DeliveryVsCookingTool() {
  const navigate = useNavigate()

  const [deliveryPrice, setDeliveryPrice] = useState('')
  const [deliveryFee, setDeliveryFee]     = useState('')
  const [discount, setDiscount]           = useState('')
  const [servings, setServings]           = useState('1')
  const [ingredientCost, setIngredientCost] = useState('')
  const [mealCount, setMealCount]           = useState('1')
  const [cookTime, setCookTime]   = useState('')
  const [cleanTime, setCleanTime] = useState('')
  const [showTime, setShowTime]   = useState(false)
  const [fromRecipe, setFromRecipe] = useState<HandoffToCalculator | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as HandoffToCalculator
      if (data.fromRecommender) { setFromRecipe(data); sessionStorage.removeItem(HANDOFF_KEY) }
    } catch { /* ignore */ }
  }, [])

  const result = calculateDeliveryVsCooking({
    deliveryFoodPrice:    parseNum(deliveryPrice),
    deliveryFee:          parseNum(deliveryFee),
    discountAmount:       parseNum(discount),
    deliveryServingCount: parseNum(servings) || 1,
    ingredientCost:       parseNum(ingredientCost),
    expectedMealCount:    parseNum(mealCount) || 1,
    cookingTimeMinutes:   parseNum(cookTime),
    cleanupTimeMinutes:   parseNum(cleanTime),
  })

  const totalTime = parseNum(cookTime) + parseNum(cleanTime)

  function goToRecipes() {
    if (!result) return
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
      fromCalculator: true,
      ingredientCost: parseNum(ingredientCost),
      expectedMealCount: parseNum(mealCount) || 1,
      winner: result.winner,
    }))
    navigate('/tools/fridge-recipes')
  }

  const CARD = { backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '16px' }
  const SEC  = { color: 'var(--on-dark-mute)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-3">

        {/* Header */}
        <div className="mb-1">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            Food / Meal Budget
          </p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            배달 vs 요리
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--on-dark-mute)' }}>
            1끼당 비용을 비교해드릴게요
          </p>
        </div>

        {/* Contextual message */}
        {fromRecipe && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(252,213,53,0.08)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fromRecipe.selectedRecipeName}</span>을 해먹는 비용이 배달보다 이득인지 비교해볼게요.
            재료비와 예상 끼니 수를 입력해 주세요.
          </div>
        )}

        {/* ── 배달 비용 ── */}
        <div style={CARD}>
          <p style={SEC}>🛵  배달 비용</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="음식 가격">
              <UnitInput value={deliveryPrice} onChange={setDeliveryPrice} unit="원" />
            </Field>
            <Field label="배달비">
              <UnitInput value={deliveryFee} onChange={setDeliveryFee} unit="원" />
            </Field>
            <Field label="할인 금액">
              <UnitInput value={discount} onChange={setDiscount} unit="원" />
            </Field>
            <Field label="인원 수">
              <UnitInput value={servings} onChange={setServings} unit="명" />
            </Field>
          </div>
        </div>

        {/* ── 요리 비용 ── */}
        <div style={CARD}>
          <p style={SEC}>🍳  요리 비용</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <Field label="재료비 합계">
                <UnitInput value={ingredientCost} onChange={setIngredientCost} unit="원" />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Field label="예상 끼니 수">
                <UnitInput value={mealCount} onChange={setMealCount} unit="끼" />
              </Field>
            </div>
          </div>

          {/* Time toggle */}
          <button
            onClick={() => setShowTime(p => !p)}
            className="flex items-center gap-1.5 mt-4 text-xs"
            style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronDown
              size={13}
              style={{ transform: showTime ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
            시간 고려 (선택)
          </button>

          {showTime && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="조리 시간">
                <UnitInput value={cookTime} onChange={setCookTime} unit="분" />
              </Field>
              <Field label="설거지 시간">
                <UnitInput value={cleanTime} onChange={setCleanTime} unit="분" />
              </Field>
            </div>
          )}
        </div>

        {/* ── Empty state ── */}
        {!result && (
          <p className="text-center py-4 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
            배달 비용과 재료비를 입력하면<br />1끼당 비용을 비교해드릴게요.
          </p>
        )}

        {/* ── 계산 결과 ── */}
        {result && (() => {
          const cfg = WINNER_CFG[result.winner]
          return (
            <div style={CARD}>
              {/* Winner badge */}
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>

              {/* Per-meal comparison — two columns */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-input)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>배달 1끼당</p>
                  <p className="font-bold text-base" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.deliveryCostPerMeal)}
                    <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--on-dark-mute)' }}>원</span>
                  </p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-input)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>요리 1끼당</p>
                  <p className="font-bold text-base" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.cookingCostPerMeal)}
                    <span className="text-xs font-normal ml-0.5" style={{ color: 'var(--on-dark-mute)' }}>원</span>
                  </p>
                </div>
              </div>

              {/* Saving row */}
              {result.winner === 'cooking' && result.totalSaving > 0 && (
                <div className="flex justify-between items-center px-1 mb-3">
                  <span className="text-sm" style={{ color: 'var(--success)' }}>절약 가능 금액</span>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-number)', color: 'var(--success)', fontSize: 17 }}>
                    {fmt(result.totalSaving)}원
                  </span>
                </div>
              )}

              {/* Message */}
              <div className="rounded-xl px-4 py-3 text-sm mb-3" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.65 }}>
                {result.winner === 'cooking' && (
                  <>
                    요리가 1끼당 약{' '}
                    <strong style={{ color: 'var(--success)' }}>{fmt(Math.abs(result.differencePerMeal))}원</strong> 저렴해요.
                    {parseNum(mealCount) > 1 && (
                      <><br />{parseNum(mealCount)}끼 기준 약{' '}
                      <strong style={{ color: 'var(--success)' }}>{fmt(result.totalSaving)}원</strong> 절약할 수 있어요.</>
                    )}
                  </>
                )}
                {result.winner === 'delivery' && (
                  <>이번에는 배달이 더 저렴할 수 있어요.<br />재료를 한 번만 쓰고 남는 재료가 없다면 요리가 오히려 비쌀 수 있어요.</>
                )}
                {result.winner === 'similar' && (
                  <>비용 차이가 크지 않아요.<br />시간과 설거지까지 고려하면 편한 쪽을 선택해도 괜찮아요.</>
                )}
              </div>

              {/* Time note */}
              {showTime && totalTime > 0 && (
                <p className="text-xs px-1 mb-3" style={{ color: 'var(--on-dark-mute)' }}>
                  조리와 설거지에 약 {totalTime}분이 필요해요.
                  {result.winner === 'cooking' && ' 비용은 요리가 저렴하지만, 시간이 부족하면 배달이 더 편할 수 있어요.'}
                </p>
              )}

              {/* CTA */}
              {(result.winner === 'cooking' || result.winner === 'similar') && (
                <button
                  onClick={goToRecipes}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--primary)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                >
                  냉장고 재료로 요리 추천받기
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
