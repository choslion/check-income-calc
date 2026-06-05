import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, ChefHat } from 'lucide-react'
import { RECIPES, MAIN_INGREDIENTS, SEASONINGS } from './data/recipes'
import { matchRecipes } from './utils/matcher'
import { DIFFICULTY_LABEL } from './types'
import type { HandoffToRecipes } from '../delivery-vs-cooking/types'

const HANDOFF_KEY = 'food-budget-handoff'

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium transition-colors"
      style={{
        backgroundColor: selected ? 'var(--primary)' : 'var(--surface-input)',
        color: selected ? 'var(--on-primary)' : 'var(--on-dark)',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--hairline)'}`,
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

const DIFF_COLOR = { easy: 'var(--success)', normal: 'var(--primary)', hard: 'var(--danger)' }

export function FridgeRecipesTool() {
  const navigate = useNavigate()
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set())
  const [selectedSeasonings, setSelectedSeasonings] = useState<Set<string>>(new Set())
  const [customInput, setCustomInput] = useState('')
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [fromCalc, setFromCalc] = useState<HandoffToRecipes | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as HandoffToRecipes
      if (data.fromCalculator) {
        setFromCalc(data)
        sessionStorage.removeItem(HANDOFF_KEY)
      }
    } catch { /* ignore */ }
  }, [])

  function toggleIngredient(name: string) {
    setSelectedIngredients(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function toggleSeasoning(name: string) {
    setSelectedSeasonings(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function addCustomIngredient() {
    const trimmed = customInput.trim()
    if (!trimmed || customIngredients.includes(trimmed)) { setCustomInput(''); return }
    setCustomIngredients(prev => [...prev, trimmed])
    setSelectedIngredients(prev => new Set([...prev, trimmed]))
    setCustomInput('')
  }

  const allIngredients = [...Array.from(selectedIngredients), ...customIngredients.filter(c => !selectedIngredients.has(c))]

  const matches = useMemo(
    () => matchRecipes(allIngredients, Array.from(selectedSeasonings), RECIPES),
    [allIngredients, selectedSeasonings]
  )

  const hasSelection = selectedIngredients.size > 0

  function goToCalculator(recipeName: string) {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({
      fromRecommender: true,
      selectedRecipeName: recipeName,
    }))
    navigate('/tools/delivery-vs-cooking')
  }

  const card = { backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '20px' }
  const sectionTitle = { color: 'var(--on-dark-mute)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }
  const chip = (s: boolean) => ({ backgroundColor: s ? 'rgba(14,203,129,0.15)' : 'var(--surface-input)', color: s ? 'var(--success)' : 'var(--on-dark-mute)', borderRadius: 'var(--radius-pill)', fontSize: 11, padding: '2px 8px', border: `1px solid ${s ? 'rgba(14,203,129,0.3)' : 'var(--hairline)'}` })

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Header */}
        <div className="mb-2">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            Food / Meal Budget
          </p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            냉장고 재료 요리 추천
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--on-dark-mute)' }}>
            있는 재료와 조미료를 골라보세요
          </p>
        </div>

        {/* Contextual message from calculator */}
        {fromCalc && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(14,203,129,0.06)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
            {fromCalc.winner === 'cooking' ? (
              <><span style={{ color: 'var(--success)', fontWeight: 600 }}>요리가 더 이득</span>으로 나왔어요.<br /></>
            ) : (
              <>비용이 비슷하게 나왔어요.<br /></>
            )}
            집에 있는 재료를 입력하면 만들 수 있는 메뉴를 추천해드릴게요.
          </div>
        )}

        {/* Ingredient selector */}
        <div style={card}>
          <p style={sectionTitle}>🥦  재료</p>
          <div className="flex flex-wrap gap-2">
            {MAIN_INGREDIENTS.map(name => (
              <Chip key={name} label={name} selected={selectedIngredients.has(name)} onClick={() => toggleIngredient(name)} />
            ))}
          </div>

          {/* Custom ingredient input */}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
              placeholder="직접 입력 (예: 당근)"
              className="flex-1 px-3 py-2 text-sm outline-none transition-all"
              style={{ backgroundColor: 'var(--surface-input)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', color: 'var(--on-dark)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--info)')}
              onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
            />
            <button
              onClick={addCustomIngredient}
              className="px-3 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', cursor: 'pointer' }}
            >
              추가
            </button>
          </div>

          {customIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customIngredients.map(name => (
                <Chip key={name} label={name} selected={selectedIngredients.has(name)} onClick={() => toggleIngredient(name)} />
              ))}
            </div>
          )}
        </div>

        {/* Seasoning selector */}
        <div style={card}>
          <p style={sectionTitle}>🫙  조미료</p>
          <div className="flex flex-wrap gap-2">
            {SEASONINGS.map(name => (
              <Chip key={name} label={name} selected={selectedSeasonings.has(name)} onClick={() => toggleSeasoning(name)} />
            ))}
          </div>
        </div>

        {/* Empty state */}
        {!hasSelection && (
          <div className="text-center py-6" style={{ color: 'var(--on-dark-mute)', fontSize: 13 }}>
            냉장고에 있는 재료와 조미료를 고르면<br />만들 수 있는 메뉴를 추천해드릴게요.
          </div>
        )}

        {/* No matches */}
        {hasSelection && matches.length === 0 && (
          <div className="text-center py-6" style={{ color: 'var(--on-dark-mute)', fontSize: 13 }}>
            현재 재료로 만들 수 있는 메뉴가 없어요.<br />재료나 조미료를 더 추가해보세요.
          </div>
        )}

        {/* Recipe cards */}
        {matches.map(({ recipe, availableIngredients, missingRequiredIngredients, availableSeasonings, missingRequiredSeasonings }) => (
          <div key={recipe.id} style={card}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--on-dark)' }}>{recipe.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--on-dark-mute)' }}>{recipe.reason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-xs" style={{ color: DIFF_COLOR[recipe.difficulty] }}>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
                <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--on-dark-mute)' }}>
                  <Clock size={11} />
                  {recipe.estimatedTimeMinutes}분
                </span>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-2 mb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--on-dark-mute)', minWidth: 48 }}>있는 재료</span>
                {availableIngredients.map(i => <span key={i} style={chip(true)}>{i}</span>)}
                {missingRequiredIngredients.map(i => (
                  <span key={i} style={{ ...chip(false), color: 'var(--danger)', borderColor: 'rgba(246,70,93,0.3)' }}>
                    {i} 필요
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs" style={{ color: 'var(--on-dark-mute)', minWidth: 48 }}>있는 조미료</span>
                {availableSeasonings.map(s => <span key={s} style={chip(true)}>{s}</span>)}
                {missingRequiredSeasonings.map(s => (
                  <span key={s} style={{ ...chip(false), color: 'var(--danger)', borderColor: 'rgba(246,70,93,0.3)' }}>
                    {s} 필요
                  </span>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-1 mb-4">
              {recipe.simpleSteps.map((step, i) => (
                <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--on-dark-mute)' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 14 }}>{i + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* CTA to calculator */}
            <button
              onClick={() => goToCalculator(recipe.name)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--on-dark-mute)' }}
            >
              <ChefHat size={13} />
              배달보다 얼마나 아끼는지 계산하기
              <ChevronRight size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
