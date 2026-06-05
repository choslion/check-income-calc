import { useState, useEffect, useId, Children, cloneElement, isValidElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Plus, X } from 'lucide-react'
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

const WINNER_CFG: Record<Winner, { label: string; color: string }> = {
  cooking:  { label: '요리가 더 이득이에요',  color: 'var(--success)'      },
  delivery: { label: '배달이 더 저렴해요',    color: 'var(--primary)'      },
  similar:  { label: '비슷한 비용이에요',     color: 'var(--on-dark-mute)' },
}

const INPUT_BASE = {
  backgroundColor: 'var(--surface-input)',
  color: 'var(--on-dark)',
  border: '1px solid var(--hairline)',
  borderRadius: 'var(--radius-input)',
  fontFamily: 'var(--font-number)',
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId()
  const kids = Children.toArray(children)
  const enhanced = kids.map((child, idx) =>
    idx === kids.length - 1 && isValidElement(child)
      ? cloneElement(child as React.ReactElement<{ id?: string }>, { id })
      : child
  )
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-medium" style={{ color: 'var(--on-dark-mute)' }}>{label}</label>
      {enhanced}
    </div>
  )
}

interface QuickChip { label: string; value: number }

function QuickChips({
  chips, currentValue, onSelect,
}: {
  chips: QuickChip[]; currentValue: string; onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map(chip => {
        const selected = currentValue !== '' && parseNum(currentValue) === chip.value
        return (
          <button
            key={chip.value}
            onClick={() => onSelect(String(chip.value))}
            className="text-xs px-3 py-1.5 transition-colors"
            style={{
              backgroundColor: selected ? 'rgba(252,213,53,0.12)' : 'transparent',
              color: selected ? 'var(--primary)' : 'var(--on-dark-mute)',
              border: `1px solid ${selected ? 'var(--primary)' : 'var(--hairline)'}`,
              borderRadius: 'var(--radius-pill)',
              cursor: 'pointer',
            }}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}

const CHIPS = {
  foodPrice:    [12000, 15000, 18000, 20000].map(v => ({ label: new Intl.NumberFormat('ko-KR').format(v), value: v })),
  deliveryFee:  [0, 2000, 3000, 4000].map(v => ({ label: v === 0 ? '0' : new Intl.NumberFormat('ko-KR').format(v), value: v })),
  deliveryMeals:[1, 2, 3].map(v => ({ label: `${v}끼`, value: v })),
  cookingCost:  [5000, 10000, 15000, 20000].map(v => ({ label: new Intl.NumberFormat('ko-KR').format(v), value: v })),
  cookingMeals: [1, 2, 3, 4].map(v => ({ label: `${v}끼`, value: v })),
}

function UnitInput({
  value, onChange, unit, placeholder = '0', id,
}: {
  value: string; onChange: (v: string) => void; unit: string; placeholder?: string; id?: string
}) {
  return (
    <div className="relative">
      <input
        id={id}
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
      <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--on-dark-mute)' }}>
        {unit}
      </span>
    </div>
  )
}

interface IngredientItem { id: string; name: string; amount: string }

function newItem(): IngredientItem {
  return { id: crypto.randomUUID(), name: '', amount: '' }
}

function BreakEvenMsg({ breakEven, cookingMeals }: { breakEven: number; cookingMeals: number }) {
  if (breakEven === 1) return <span>1끼만 먹어도 배달보다 저렴해요.</span>
  if (cookingMeals >= breakEven) {
    return (
      <span>
        이 재료로 <strong>{breakEven}끼</strong> 이상 먹으면 배달보다 저렴해져요.
        현재 입력한 {cookingMeals}끼는 이미 이득이에요.
      </span>
    )
  }
  return (
    <span>
      이 재료로 <strong>{breakEven}끼</strong> 이상 먹어야 배달보다 저렴해져요.
      현재는 {cookingMeals}끼로 아직 배달이 이득이에요.
    </span>
  )
}

export function DeliveryVsCookingTool() {
  const navigate = useNavigate()

  const [deliveryPrice, setDeliveryPrice]   = useState('')
  const [deliveryFee, setDeliveryFee]       = useState('')
  const [discount, setDiscount]             = useState('')
  const [deliveryMeals, setDeliveryMeals]   = useState('1')
  const [ingredientCost, setIngredientCost] = useState('')
  const [cookingMeals, setCookingMeals]     = useState('1')
  const [showBreakdown, setShowBreakdown]   = useState(false)
  const [items, setItems]                   = useState<IngredientItem[]>([])
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

  const itemsTotal    = items.reduce((sum, it) => sum + parseNum(it.amount), 0)
  const cookingMealsN = parseNum(cookingMeals) || 1

  function addItem()    { setItems(prev => [...prev, newItem()]) }
  function removeItem(id: string) { setItems(prev => prev.filter(it => it.id !== id)) }
  function updateItem(id: string, field: 'name' | 'amount', val: string) {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: val } : it))
  }
  function applyItemsTotal() { setIngredientCost(String(itemsTotal)) }

  const result = calculateDeliveryVsCooking({
    deliveryFoodPrice:  parseNum(deliveryPrice),
    deliveryFee:        parseNum(deliveryFee),
    discountAmount:     parseNum(discount),
    deliveryMealCount:  parseNum(deliveryMeals) || 1,
    ingredientCost:     parseNum(ingredientCost),
    cookingMealCount:   cookingMealsN,
    cookingTimeMinutes: parseNum(cookTime),
    cleanupTimeMinutes: parseNum(cleanTime),
  })

  const totalTime = parseNum(cookTime) + parseNum(cleanTime)

  function goToRecipes() {
    if (!result) return
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
      fromCalculator: true,
      ingredientCost: parseNum(ingredientCost),
      cookingMealCount: cookingMealsN,
      winner: result.winner,
    }))
    navigate('/tools/fridge-recipes')
  }

  const CARD = { backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '16px' }
  const SEC  = { color: 'var(--on-dark-mute)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }
  const HINT = { color: 'var(--muted)', fontSize: 12, lineHeight: 1.5, marginTop: -4 } as const

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-3">

        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>Food / Meal Budget</p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>배달 vs 요리</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--on-dark-mute)' }}>1끼당 비용을 비교해드릴게요</p>
        </div>

        {fromRecipe && (
          <div className="px-4 py-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(252,213,53,0.08)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{fromRecipe.selectedRecipeName}</span>을 해먹는 비용이 배달보다 이득인지 비교해볼게요.
            재료비와 끼니 수를 입력해 주세요.
          </div>
        )}

        {/* ── 배달 비용 ── */}
        <div style={CARD}>
          <p style={SEC}>🛵  배달 비용</p>
          <div className="space-y-4">
            <Field label="먹고 싶은 음식 가격">
              <QuickChips chips={CHIPS.foodPrice} currentValue={deliveryPrice} onSelect={setDeliveryPrice} />
              <UnitInput value={deliveryPrice} onChange={setDeliveryPrice} unit="원" />
            </Field>
            <Field label="배달비">
              <QuickChips chips={CHIPS.deliveryFee} currentValue={deliveryFee} onSelect={setDeliveryFee} />
              <UnitInput value={deliveryFee} onChange={setDeliveryFee} unit="원" />
            </Field>
            <Field label="할인 금액">
              <UnitInput value={discount} onChange={setDiscount} unit="원" />
            </Field>
            <Field label="이 배달로 먹을 끼니 수">
              <QuickChips chips={CHIPS.deliveryMeals} currentValue={deliveryMeals} onSelect={setDeliveryMeals} />
              <UnitInput value={deliveryMeals} onChange={setDeliveryMeals} unit="끼" />
            </Field>
            <p style={HINT}>혼자 2번 먹거나 둘이 한 번 먹으면 2끼로 계산해요.</p>
          </div>
        </div>

        {/* ── 요리 비용 ── */}
        <div style={CARD}>
          <p style={SEC}>🍳  요리 비용</p>
          <div className="space-y-3">
            <Field label="요리에 쓸 재료비">
              <QuickChips chips={CHIPS.cookingCost} currentValue={ingredientCost} onSelect={setIngredientCost} />
              <UnitInput value={ingredientCost} onChange={setIngredientCost} unit="원" />
            </Field>
            <p style={HINT}>새로 사는 재료비를 넣어도 되고, 집에 있는 재료까지 사용분으로 계산해도 돼요.</p>

            <button
              onClick={() => { setShowBreakdown(p => !p); if (!showBreakdown && items.length === 0) addItem() }}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <ChevronDown size={13} aria-hidden="true" style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              재료별로 계산하기
            </button>

            {showBreakdown && (
              <div className="space-y-2 pt-1">
                {items.map(item => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.name}
                      onChange={e => updateItem(item.id, 'name', e.target.value)}
                      placeholder="재료명 (예: 돼지고기)"
                      className="flex-1 min-w-0 px-3 py-2 text-sm outline-none transition-all"
                      style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                    />
                    <div className="shrink-0" style={{ width: 110 }}>
                      <UnitInput value={item.amount} onChange={v => updateItem(item.id, 'amount', v)} unit="원" />
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label={`${item.name || '재료'} 삭제`}
                      className="p-1.5 shrink-0"
                      style={{ color: 'var(--on-dark-mute)', backgroundColor: 'var(--surface-input)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
                    >
                      <X size={13} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <Plus size={13} aria-hidden="true" />재료 추가
                </button>
                {itemsTotal > 0 && (
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--hairline)' }}>
                    <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>
                      현재 합계 <span className="font-semibold" style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}>{fmt(itemsTotal)}원</span>
                    </span>
                    <button
                      onClick={applyItemsTotal}
                      className="text-xs font-semibold px-3 py-1.5"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-pill)', border: 'none', cursor: 'pointer' }}
                    >
                      이 금액으로 반영하기
                    </button>
                  </div>
                )}
                <p style={HINT}>조미료는 제외하거나, 사용한 만큼만 대략 넣어도 돼요.</p>
              </div>
            )}

            <Field label="이 재료로 먹을 끼니 수">
              <QuickChips chips={CHIPS.cookingMeals} currentValue={cookingMeals} onSelect={setCookingMeals} />
              <UnitInput value={cookingMeals} onChange={setCookingMeals} unit="끼" />
            </Field>
          </div>

          <button
            onClick={() => setShowTime(p => !p)}
            className="flex items-center gap-1.5 mt-4 text-xs"
            style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <ChevronDown size={13} aria-hidden="true" style={{ transform: showTime ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            시간 고려 (선택)
          </button>
          {showTime && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="조리 시간"><UnitInput value={cookTime} onChange={setCookTime} unit="분" /></Field>
              <Field label="설거지 시간"><UnitInput value={cleanTime} onChange={setCleanTime} unit="분" /></Field>
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
              <p className="font-bold text-lg mb-3" style={{ color: cfg.color, letterSpacing: '-0.3px' }}>
                {cfg.label}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-input)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>배달 1끼당</p>
                  <p className="font-bold text-base" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.deliveryCostPerMeal)}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--on-dark-mute)' }}>원</span>
                  </p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--surface-input)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>요리 1끼당</p>
                  <p className="font-bold text-base" style={{ fontFamily: 'var(--font-number)', color: 'var(--on-dark)' }}>
                    {fmt(result.cookingCostPerMeal)}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--on-dark-mute)' }}>원</span>
                  </p>
                </div>
              </div>

              {result.winner === 'cooking' && result.totalSaving > 0 && (
                <div className="flex justify-between items-center px-1 mb-3">
                  <span className="text-sm" style={{ color: 'var(--success)' }}>{cookingMealsN}끼 기준 절약</span>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-number)', color: 'var(--success)', fontSize: 17 }}>
                    {fmt(result.totalSaving)}원
                  </span>
                </div>
              )}

              <div className="rounded-xl px-4 py-3 text-sm mb-3" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.65 }}>
                {result.winner === 'cooking' && (
                  <>요리가 1끼당 약 <strong style={{ color: 'var(--success)' }}>{fmt(Math.abs(result.differencePerMeal))}원</strong> 저렴해요.
                  {cookingMealsN > 1 && <><br />{cookingMealsN}끼 기준 약 <strong style={{ color: 'var(--success)' }}>{fmt(result.totalSaving)}원</strong> 절약할 수 있어요.</>}</>
                )}
                {result.winner === 'delivery' && <>이번에는 배달이 더 저렴해요.<br />재료를 한 번만 쓰고 남는 재료가 없다면 요리가 오히려 비쌀 수 있어요.</>}
                {result.winner === 'similar'  && <>비용 차이가 크지 않아요.<br />시간과 설거지까지 고려하면 편한 쪽을 선택해도 괜찮아요.</>}
              </div>

              {result.breakEvenMealCount !== undefined && (
                <div className="px-4 py-2.5 rounded-xl mb-3 text-xs" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
                  <span className="font-semibold" style={{ color: 'var(--on-dark)' }}>손익분기점  </span>
                  <BreakEvenMsg breakEven={result.breakEvenMealCount} cookingMeals={cookingMealsN} />
                </div>
              )}

              {showTime && totalTime > 0 && (
                <p className="text-xs px-1 mb-3" style={{ color: 'var(--on-dark-mute)' }}>
                  조리와 설거지에 약 {totalTime}분이 필요해요.
                  {result.winner === 'cooking' && ' 시간이 부족하면 배달이 더 편할 수 있어요.'}
                </p>
              )}

              {(result.winner === 'cooking' || result.winner === 'similar') && (
                <button
                  onClick={goToRecipes}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--surface-input)', color: 'var(--primary)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
                >
                  냉장고 재료로 요리 추천받기
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
