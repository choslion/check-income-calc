import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  STAIN_GUIDES, CONDITION_MODIFIERS, FABRIC_MODIFIERS,
  DIFFICULTY_LABEL, composeDifficulty,
  getConditionById, getFabricById,
} from './data/stains'
import type { StainId, StainCondition, FabricType } from './data/stains'

const DIFF_COLOR = {
  easy:   'var(--success)',
  normal: 'var(--primary)',
  hard:   'var(--danger)',
}

const CARD: React.CSSProperties = {
  backgroundColor: 'var(--surface-card)',
  borderRadius: 'var(--radius-card)',
  padding: '16px',
}

const SEC: React.CSSProperties = {
  color: 'var(--on-dark-mute)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 10,
}

function SelectChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm font-medium transition-colors text-left"
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

export function StainRemovalTool() {
  const [selectedStain, setSelectedStain]     = useState<StainId | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<StainCondition>('fresh')
  const [selectedFabric, setSelectedFabric]   = useState<FabricType>('general')

  const stain     = selectedStain ? STAIN_GUIDES.find(s => s.id === selectedStain) : null
  const condition = getConditionById(selectedCondition)!
  const fabric    = getFabricById(selectedFabric)!

  const difficulty = stain ? composeDifficulty(stain.difficulty, condition) : null

  const doNot = stain
    ? [...stain.doNot, ...(fabric.additionalDont ?? [])]
    : []

  const materials = stain
    ? [...stain.materials, ...(fabric.additionalMaterials ?? [])]
    : []

  const steps = stain
    ? condition.prefixStep
      ? [condition.prefixStep, ...stain.steps]
      : [...stain.steps]
    : []

  const cautions = [
    stain?.caution,
    fabric.warning,
  ].filter(Boolean) as string[]

  const showProfessional =
    fabric.professionalRecommended || condition.suggestProfessional

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
            Daily Utility
          </p>
          <h1 className="text-3xl font-bold leading-none" style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}>
            얼룩 제거 가이드
          </h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--on-dark-mute)' }}>
            얼룩 종류, 상태, 소재를 선택하면 처리 방법을 알려드려요.
          </p>
        </div>

        {/* ── 1. 얼룩 종류 ── */}
        <div style={CARD}>
          <p style={SEC}>🧺  얼룩 종류</p>
          <div className="flex flex-wrap gap-2">
            {STAIN_GUIDES.map(s => (
              <SelectChip
                key={s.id}
                label={`${s.emoji} ${s.name}`}
                selected={selectedStain === s.id}
                onClick={() => setSelectedStain(s.id)}
              />
            ))}
          </div>
        </div>

        {/* ── 2. 얼룩 상태 ── */}
        <div style={CARD}>
          <p style={SEC}>⏱️  현재 상태</p>
          <div className="flex flex-wrap gap-2">
            {CONDITION_MODIFIERS.map(c => (
              <SelectChip
                key={c.id}
                label={c.label}
                selected={selectedCondition === c.id}
                onClick={() => setSelectedCondition(c.id)}
              />
            ))}
          </div>
        </div>

        {/* ── 3. 의류 소재 ── */}
        <div style={CARD}>
          <p style={SEC}>👕  의류 소재</p>
          <div className="flex flex-wrap gap-2">
            {FABRIC_MODIFIERS.map(f => (
              <SelectChip
                key={f.id}
                label={f.label}
                selected={selectedFabric === f.id}
                onClick={() => setSelectedFabric(f.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {!stain && (
          <p className="text-center py-4 text-sm" style={{ color: 'var(--on-dark-mute)' }}>
            얼룩 종류를 선택하면 처리 방법을 알려드릴게요.
          </p>
        )}

        {/* ── 결과 카드 ── */}
        {stain && difficulty && (
          <div style={CARD}>

            {/* 헤더 */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--on-dark-mute)' }}>
                  {stain.emoji} {stain.name} · {condition.label} · {fabric.label}
                </p>
                <p className="font-bold text-base" style={{ color: 'var(--on-dark)' }}>
                  {stain.summary}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-1 shrink-0 ml-3"
                style={{
                  color: DIFF_COLOR[difficulty],
                  backgroundColor: `${DIFF_COLOR[difficulty]}18`,
                  borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${DIFF_COLOR[difficulty]}40`,
                }}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            </div>

            {/* 상태 노트 */}
            {condition.note && (
              <div className="rounded-xl px-4 py-2.5 mb-4 text-xs" style={{ backgroundColor: 'rgba(252,213,53,0.08)', border: '1px solid rgba(252,213,53,0.2)', color: 'var(--primary)', lineHeight: 1.6 }}>
                {condition.note}
              </div>
            )}

            {/* 하지 말 것 */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--danger)' }}>
                ⛔ 이것만은 하지 마세요
              </p>
              <div className="space-y-1.5">
                {doNot.map((item, i) => (
                  <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--danger)', flexShrink: 0 }}>✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 필요한 재료 */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--on-dark-mute)' }}>
                🧴 필요한 재료
              </p>
              <div className="flex flex-wrap gap-1.5">
                {materials.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1"
                    style={{
                      backgroundColor: 'var(--surface-input)',
                      color: 'var(--on-dark)',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--hairline)',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* 처리 순서 */}
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--on-dark-mute)' }}>
                📋 처리 순서
              </p>
              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)', marginTop: 2 }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 주의사항 */}
            {cautions.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--on-dark-mute)' }}>
                  ⚠️ 주의사항
                </p>
                <div className="space-y-2">
                  {cautions.map((c, i) => (
                    <div key={i} className="flex gap-2 text-xs" style={{ color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
                      <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 세탁소 권장 */}
            {showProfessional && (
              <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: 'rgba(246,70,93,0.06)', border: '1px solid rgba(246,70,93,0.2)', color: 'var(--on-dark-mute)', lineHeight: 1.6 }}>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
                  <span>
                    이 소재·상태 조합은 <strong style={{ color: 'var(--danger)' }}>드라이클리닝</strong>을 권장해요.
                    집에서 처리 시 섬유가 손상되거나 얼룩이 고착될 수 있어요.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
