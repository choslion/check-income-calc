import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, ChefHat, Clock, X, Plus } from 'lucide-react'
import { RECIPES, MAIN_INGREDIENTS, SEASONING_GROUPS, PRESETS } from './data/recipes'
import { matchRecipes } from './utils/matcher'
import { DIFFICULTY_LABEL, RESULT_GROUP_LABEL } from './types'
import type { ResultGroup } from './types'
import type { HandoffToRecipes } from '../delivery-vs-cooking/types'

const HANDOFF_KEY = 'food-budget-handoff'

// 자주 쓰는 재료 8개 — 나머지는 "더 보기"로 숨김
const FREQUENT_INGREDIENTS = ['밥', '계란', '김치', '두부', '돼지고기', '양파', '대파', '참치']
const MORE_INGREDIENTS = MAIN_INGREDIENTS.filter(i => !FREQUENT_INGREDIENTS.includes(i))

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
const GROUP_COLOR: Record<ResultGroup, string> = {
  ready: 'var(--success)',
  almostReady: 'var(--on-dark-mute)',
}

export function FridgeRecipesTool() {
  const navigate = useNavigate()
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set())
  const [selectedSeasonings, setSelectedSeasonings]   = useState<Set<string>>(new Set())
  const [customInput, setCustomInput]       = useState('')
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [expandedSteps, setExpandedSteps]   = useState<Set<string>>(new Set())
  const [fromCalc, setFromCalc] = useState<HandoffToRecipes | null>(null)

  // UI 상태
  const [showAllIngredients, setShowAllIngredients] = useState(false)
  const [showCustomInput, setShowCustomInput]       = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['basic']))

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as HandoffToRecipes
      if (data.fromCalculator) { setFromCalc(data); sessionStorage.removeItem(HANDOFF_KEY) }
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

  function toggleGroup(id: string) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function clearAll() {
    setSelectedIngredients(new Set())
    setSelectedSeasonings(new Set())
    setCustomIngredients([])
  }

  function applyPreset(preset: typeof PRESETS[number]) {
    setSelectedIngredients(prev => new Set([...prev, ...preset.ingredients]))
    setSelectedSeasonings(prev => new Set([...prev, ...preset.seasonings]))
  }

  function addCustomIngredient() {
    const trimmed = customInput.trim()
    if (!trimmed || customIngredients.includes(trimmed)) { setCustomInput(''); return }
    setCustomIngredients(prev => [...prev, trimmed])
    setSelectedIngredients(prev => new Set([...prev, trimmed]))
    setCustomInput('')
  }

  function quickAdd(item: string, type: 'ingredient' | 'seasoning') {
    if (type === 'ingredient') setSelectedIngredients(prev => new Set([...prev, item]))
    else setSelectedSeasonings(prev => new Set([...prev, item]))
  }

  function toggleSteps(id: string) {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function goToCalculator(recipeName: string) {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ fromRecommender: true, selectedRecipeName: recipeName }))
    navigate('/tools/delivery-vs-cooking')
  }

  const allIngredients = Array.from(selectedIngredients)
  const matches = useMemo(
    () => matchRecipes(allIngredients, Array.from(selectedSeasonings), RECIPES),
    [allIngredients, selectedSeasonings]
  )

  const totalSelected   = selectedIngredients.size + selectedSeasonings.size
  const selectedPreview = [...selectedIngredients, ...selectedSeasonings]
  const previewText     = selectedPreview.slice(0, 3).join(', ')
  const overflow        = totalSelected > 3 ? totalSelected - 3 : 0

  const hasIngredients = selectedIngredients.size > 0
  const hasSeasonings  = selectedSeasonings.size > 0
  const hasSelection   = hasIngredients

  const readyRecipes       = matches.filter(m => m.group === 'ready')
  const almostReadyRecipes = matches.filter(m => m.group === 'almostReady')

  // "더 보기" 섹션에서 선택된 재료가 있으면 펼쳐진 상태 유지
  const selectedMoreIngredients = MORE_INGREDIENTS.filter(i => selectedIngredients.has(i))
  const showMore = showAllIngredients || selectedMoreIngredients.length > 0

  const CARD = { backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', padding: '16px' }
  const SEC  = { color: 'var(--on-dark-mute)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }
  const tagStyle = (ok: boolean) => ({
    backgroundColor: ok ? 'rgba(14,203,129,0.12)' : 'var(--surface-input)',
    color: ok ? 'var(--success)' : 'var(--danger)',
    borderRadius: 'var(--radius-pill)',
    fontSize: 11,
    padding: '2px 8px',
    border: `1px solid ${ok ? 'rgba(14,203,129,0.3)' : 'rgba(246,70,93,0.3)'}`,
  })

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-3">

        {/* Header */}
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>Food / Meal Budget</p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>냉장고 재료 요리 추천</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--on-dark-mute)' }}>있는 재료와 조미료를 골라보세요</p>
        </div>

        {/* Contextual message */}
        {fromCalc && (
          <div className="px-4 py-4 rounded-xl text-sm" style={{ backgroundColor: 'rgba(14,203,129,0.06)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)', lineHeight: 1.7 }}>
            {fromCalc.winner === 'cooking'
              ? <><span style={{ color: 'var(--success)', fontWeight: 600 }}>요리가 더 이득</span>으로 나왔어요.<br /></>
              : <>비용이 비슷하게 나왔어요.<br /></>
            }
            집에 있는 재료를 입력하면 만들 수 있는 메뉴를 추천해드릴게요.
          </div>
        )}

        {/* Selected summary + clear */}
        {totalSelected > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--surface-input)', border: '1px solid var(--hairline)' }}>
            <div className="min-w-0">
              <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>선택됨 {totalSelected}개</span>
              <span className="text-xs ml-2 truncate" style={{ color: 'var(--on-dark-mute)' }}>
                {previewText}{overflow > 0 ? ` 외 ${overflow}개` : ''}
              </span>
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs ml-3 shrink-0"
              style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--on-dark-mute)')}
            >
              <X size={12} aria-hidden="true" />전체 초기화
            </button>
          </div>
        )}

        {/* Presets */}
        <div style={CARD}>
          <p style={{ ...SEC, marginBottom: 10 }}>⚡  빠른 시작</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-sm font-medium transition-colors"
                style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--hairline)')}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 재료 ── */}
        <div style={CARD}>
          <p style={{ ...SEC, marginBottom: 10 }}>🥦  재료</p>

          {/* 자주 쓰는 재료 */}
          <div className="flex flex-wrap gap-2">
            {FREQUENT_INGREDIENTS.map(name => (
              <Chip key={name} label={name} selected={selectedIngredients.has(name)} onClick={() => toggleIngredient(name)} />
            ))}
          </div>

          {/* 더 보기 섹션 */}
          {showMore && (
            <div className="flex flex-wrap gap-2 mt-2">
              {MORE_INGREDIENTS.map(name => (
                <Chip key={name} label={name} selected={selectedIngredients.has(name)} onClick={() => toggleIngredient(name)} />
              ))}
            </div>
          )}

          {/* 커스텀 입력으로 추가된 것들 */}
          {customIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customIngredients.map(name => (
                <Chip key={name} label={name} selected={selectedIngredients.has(name)} onClick={() => toggleIngredient(name)} />
              ))}
            </div>
          )}

          {/* 더 보기 / 접기 토글 */}
          <div className="flex items-center gap-3 mt-3">
            {!showMore ? (
              <button
                onClick={() => setShowAllIngredients(true)}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <ChevronDown size={13} />
                재료 더 보기 ({MORE_INGREDIENTS.length}개)
              </button>
            ) : (
              <button
                onClick={() => setShowAllIngredients(false)}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <ChevronDown size={13} style={{ transform: 'rotate(180deg)' }} />
                접기
              </button>
            )}

            {/* 직접 입력 토글 */}
            {!showCustomInput && (
              <button
                onClick={() => setShowCustomInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--on-dark-mute)', background: 'transparent', border: '1.5px dashed var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--on-dark-mute)' }}
              >
                <Plus size={13} aria-hidden="true" />직접 입력
              </button>
            )}
          </div>

          {/* 커스텀 입력 폼 */}
          {showCustomInput && (
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomIngredient()}
                aria-label="직접 입력할 재료명"
                placeholder="재료명 입력 (예: 당근)"
                className="flex-1 px-3 py-2 text-sm outline-none transition-all"
                style={{ backgroundColor: 'var(--surface-input)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', color: 'var(--on-dark)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--info)')}
                onBlur={e => (e.target.style.borderColor = 'var(--hairline)')}
                autoFocus
              />
              <button
                onClick={addCustomIngredient}
                className="px-3 py-2 text-sm font-semibold"
                style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-input)', cursor: 'pointer' }}
              >
                추가
              </button>
            </div>
          )}
        </div>

        {/* ── 조미료 — 그룹별 접기 ── */}
        <div style={CARD}>
          <div className="space-y-3">
            {SEASONING_GROUPS.map((group, idx) => {
              const isExpanded = expandedGroups.has(group.id)
              const selectedCount = group.items.filter(i => selectedSeasonings.has(i)).length
              return (
                <div key={group.id} className={idx > 0 ? 'pt-3' : ''} style={idx > 0 ? { borderTop: '1px solid var(--hairline)' } : {}}>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between w-full mb-0"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <span style={{ ...SEC, marginBottom: 0 }}>🫙  {group.label}</span>
                    <span className="flex items-center gap-2">
                      {selectedCount > 0 && (
                        <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>{selectedCount}개 선택</span>
                      )}
                      {!isExpanded && (
                        <span className="text-xs" style={{ color: 'var(--on-dark-mute)' }}>{group.items.length}개</span>
                      )}
                      <ChevronDown size={14} style={{ color: 'var(--on-dark-mute)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {group.items.map(name => (
                        <Chip key={name} label={name} selected={selectedSeasonings.has(name)} onClick={() => toggleSeasoning(name)} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Empty state */}
        {!hasSelection && (
          <div className="text-center py-4" style={{ color: 'var(--on-dark-mute)', fontSize: 13 }}>
            냉장고에 있는 재료와 조미료를 고르면<br />만들 수 있는 메뉴를 추천해드릴게요.
          </div>
        )}

        {/* No result hint */}
        {hasSelection && matches.length === 0 && (() => {
          const noSeasonings = !hasSeasonings
          const suggestions = noSeasonings
            ? [{ item: '간장', type: 'seasoning' as const }, { item: '식용유', type: 'seasoning' as const }]
            : [{ item: '계란', type: 'ingredient' as const }, { item: '대파', type: 'ingredient' as const }, { item: '간장', type: 'seasoning' as const }, { item: '식용유', type: 'seasoning' as const }]
          return (
            <div className="px-4 py-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--hairline)', color: 'var(--on-dark-mute)', lineHeight: 1.65 }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--on-dark)' }}>추천 결과가 아직 부족해요.</p>
              <p className="text-xs mb-3">
                {noSeasonings
                  ? '조미료를 추가하면 더 많은 메뉴가 나와요. 간장이나 식용유부터 선택해보세요.'
                  : '계란, 대파, 간장, 식용유처럼 자주 쓰는 재료를 추가하면 더 많은 메뉴가 나올 수 있어요.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions
                  .filter(s => !(s.type === 'ingredient' ? selectedIngredients : selectedSeasonings).has(s.item))
                  .map(s => (
                    <button
                      key={s.item}
                      onClick={() => quickAdd(s.item, s.type)}
                      className="px-3 py-1.5 text-xs font-semibold"
                      style={{ backgroundColor: 'var(--surface-input)', color: 'var(--primary)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                    >
                      + {s.item}
                    </button>
                  ))}
              </div>
            </div>
          )
        })()}

        {/* Recipe results */}
        {([['ready', readyRecipes], ['almostReady', almostReadyRecipes]] as [ResultGroup, typeof matches][]).map(
          ([group, list]) => list.length === 0 ? null : (
            <div key={group}>
              <p className="text-xs font-semibold mb-2 px-1" style={{ color: GROUP_COLOR[group] }}>
                {RESULT_GROUP_LABEL[group]}
              </p>
              <div className="space-y-3">
                {list.map(({ recipe, availableIngredients, missingRequiredIngredients, availableSeasonings, missingRequiredSeasonings }) => (
                  <div key={recipe.id} style={CARD}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-base" style={{ color: 'var(--on-dark)' }}>{recipe.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--on-dark-mute)' }}>{recipe.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className="text-xs" style={{ color: DIFF_COLOR[recipe.difficulty] }}>{DIFFICULTY_LABEL[recipe.difficulty]}</span>
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: 'var(--on-dark-mute)' }}>
                          <Clock size={11} />{recipe.estimatedTimeMinutes}분
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs shrink-0" style={{ color: 'var(--on-dark-mute)', minWidth: 46 }}>있는 재료</span>
                        {availableIngredients.map(i => <span key={i} style={tagStyle(true)}>{i}</span>)}
                        {missingRequiredIngredients.map(i => <span key={i} style={tagStyle(false)}>{i} 필요</span>)}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs shrink-0" style={{ color: 'var(--on-dark-mute)', minWidth: 46 }}>있는 조미료</span>
                        {availableSeasonings.map(s => <span key={s} style={tagStyle(true)}>{s}</span>)}
                        {missingRequiredSeasonings.map(s => <span key={s} style={tagStyle(false)}>{s} 필요</span>)}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSteps(recipe.id)}
                      className="flex items-center gap-1.5 text-xs mb-3"
                      style={{ color: 'var(--on-dark-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <ChevronDown size={13} style={{ transform: expandedSteps.has(recipe.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      {expandedSteps.has(recipe.id) ? '조리 순서 접기' : '조리 순서 보기'}
                    </button>

                    {expandedSteps.has(recipe.id) && (
                      <div className="space-y-1 mb-3">
                        {recipe.simpleSteps.map((step, i) => (
                          <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--on-dark-mute)' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, minWidth: 14 }}>{i + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => goToCalculator(recipe.name)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors"
                      style={{ backgroundColor: 'var(--surface-input)', color: 'var(--on-dark-mute)', border: '1px solid var(--hairline)', borderRadius: 'var(--radius-pill)', cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--hairline)'; e.currentTarget.style.color = 'var(--on-dark-mute)' }}
                    >
                      <ChefHat size={13} aria-hidden="true" />
                      배달보다 얼마나 아끼는지 계산하기
                      <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
