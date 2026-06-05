import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown } from 'lucide-react'
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
  cooking: { label: '요리가 더 이득', color: 'var(--success)', bg: 'rgba(14,203,129,0.1)' },
  delivery: { label: '배달이 더 이득', color: 'var(--primary)', bg: 'rgba(252,213,53,0.1)' },
  similar: { label: '비슷한 비용', color: 'var(--on-dark-mute)', bg: 'var(--surface-input)' },
}

const INPUT_STYLE = {
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-input)',
  fontFamily: 'var(--font-number)',
}

function NumInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        placeholder={placeholder ?? '0'}
        className="w-full px-3 py-2.5 pr-7 text-right text-sm outline-none transition-all"
        style={INPUT_STYLE}
        onFocus={e => (e.target.style.borderColor = 'var(--info)')}
        onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>원</span>
    </div>
  )
}

export function DeliveryVsCookingTool() {
  const navigate = useNavigate()

  const [deliveryPrice, setDeliveryPrice] = useState('')
  const [deliveryFee, setDeliveryFee] = useState('')
  const [discount, setDiscount] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredientCost, setIngredientCost] = useState('')
  const [mealCount, setMealCount] = useState('1')
  const [cookTime, setCookTime] = useState('')
  const [cleanTime, setCleanTime] = useState('')
  const [showTime, setShowTime] = useState(false)
  const [fromRecipe, setFromRecipe] = useState<HandoffToCalculator | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as HandoffToCalculator
      if (data.fromRecommender) {
        setFromRecipe(data)
        sessionStorage.removeItem(HANDOFF_KEY)
      }
    } catch { /* ignore */ }
  }, [])

  const result = calculateDeliveryVsCooking({
    deliveryFoodPrice: parseNum(deliveryPrice),
    deliveryFee: parseNum(deliveryFee),
    discountAmount: parseNum(discount),
    deliveryServingCount: parseNum(servings) || 1,
    ingredientCost: parseNum(ingredientCost),
    expectedMealCount: parseNum(mealCount) || 1,
    cookingTimeMinutes: parseNum(cookTime),
    cleanupTimeMinutes: parseNum(cleanTime),
  })

  const totalTime = parseNum(cookTime) + parseNum(cleanTime)
  const hasResult = result !== null

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

  const card = { backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '20px' }
  const label = { color: 'var(--on-dark-mute)', fontSize: 13 }
  const sectionTitle = { color: 'var(--on-dark-mute)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="mb-2">
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

        {/* Contextual message from recipe recommender */}
        {fromRecipe && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(252,213,53,0.08)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fromRecipe.selectedRecipeName}</span>을 해먹는 비용이 배달보다 이득인지 비교해볼게요.
            <br />재료비와 예상 끼니 수를 입력해 주세요.
          </div>
        )}

        {/* Delivery side */}
        <div style={card}>
          <p style={sectionTitle}>🛵  배달 비용</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>음식 가격</span>
              <NumInput value={deliveryPrice} onChange={setDeliveryPrice} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>배달비</span>
              <NumInput value={deliveryFee} onChange={setDeliveryFee} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>할인 금액</span>
              <NumInput value={discount} onChange={setDiscount} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>인원 수</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={servings}
                  onChange={e => setServings(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2.5 pr-9 text-right text-sm outline-none transition-all"
                  style={INPUT_STYLE}
                  onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>명</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cooking side */}
        <div style={card}>
          <p style={sectionTitle}>🍳  요리 비용</p>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>재료비 합계</span>
              <NumInput value={ingredientCost} onChange={setIngredientCost} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>예상 끼니 수</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={mealCount}
                  onChange={e => setMealCount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2.5 pr-9 text-right text-sm outline-none transition-all"
                  style={INPUT_STYLE}
                  onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>끼니</span>
              </div>
            </div>
          </div>

          {/* Time toggle */}
          <button
            onClick={() => setShowTime(p => !p)}
            className="flex items-center gap-1.5 mt-4 text-xs"
            style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronDown size={14} style={{ transform: showTime ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            시간 고려 (선택)
          </button>

          {showTime && (
            <div className="space-y-2.5 mt-3">
              <div className="flex items-center gap-3">
                <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>조리 시간</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cookTime}
                    onChange={e => setCookTime(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 pr-10 text-right text-sm outline-none transition-all"
                    style={INPUT_STYLE}
                    onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>분</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm shrink-0" style={{ ...label, width: 80 }}>설거지 시간</span>
                <div className="relative flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cleanTime}
                    onChange={e => setCleanTime(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 pr-10 text-right text-sm outline-none transition-all"
                    style={INPUT_STYLE}
                    onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted)' }}>분</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!hasResult && (
          <div className="text-center py-6" style={{ color: 'var(--on-dark-mute)', fontSize: 13 }}>
            배달 비용과 재료비를 입력하면<br />1끼당 비용을 비교해드릴게요.
          </div>
        )}

        {/* Result */}
        {hasResult && result && (() => {
          const cfg = WINNER_CFG[result.winner]
          return (
            <div style={card}>
              {/* Winner badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </div>

              {/* Cost comparison */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>배달 합계</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.deliveryTotal)}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>배달 1끼당</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.deliveryCostPerMeal)}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>요리 1끼당</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.cookingCostPerMeal)}원
                  </span>
                </div>
                {result.winner === 'cooking' && result.totalSaving > 0 && (
                  <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>절약 가능 금액</span>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-number)', color: 'var(--success)', fontSize: 16 }}>
                      {fmt(result.totalSaving)}원
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="rounded-xl px-4 py-3 text-sm mb-4"
                style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
                {result.winner === 'cooking' && (
                  <>요리가 1끼당 약 <strong style={{ color: 'var(--success)' }}>{fmt(Math.abs(result.differencePerMeal))}원</strong> 저렴해요.
                  {parseNum(mealCount) > 1 && <><br />{parseNum(mealCount)}끼 기준 약 <strong style={{ color: 'var(--success)' }}>{fmt(result.totalSaving)}원</strong> 절약할 수 있어요.</>}</>
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
                <p className="text-xs mb-4" style={{ color: 'var(--on-dark-mute)' }}>
                  조리와 설거지에 약 {totalTime}분이 필요해요.
                  {result.winner === 'cooking' && ' 비용은 요리가 저렴하지만, 시간이 부족하면 배달이 더 편할 수 있어요.'}
                </p>
              )}

              {/* CTA to fridge recipes */}
              {(result.winner === 'cooking' || result.winner === 'similar') && (
                <button
                  onClick={goToRecipes}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--primary)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                >
                  냉장고 재료로 요리 추천받기
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
