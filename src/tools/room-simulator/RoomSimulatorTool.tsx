import { useState, lazy, Suspense } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Room, FurnitureItem, FixedElement, Step, LayoutVersion } from './types'
import { RoomSetup } from './components/RoomSetup'
import { RoomCanvas } from './components/RoomCanvas'
import { FurniturePanel } from './components/FurniturePanel'
import { FixedElementPanel } from './components/FixedElementPanel'
import { VersionTabs } from './components/VersionTabs'
import { CompareView } from './components/CompareView'
import { ResultSummary } from './components/ResultSummary'
const ThreePreview = lazy(() =>
  import('./components/ThreePreview').then(m => ({ default: m.ThreePreview }))
)
import {
  getOccupancyPercent,
  getOccupancyStatus,
  checkClearances,
  findInitialPosition,
  makeWallElement,
} from './utils/geometry'
import type { WallSide } from './types'
import {
  createLayoutVersion,
  duplicateLayoutVersion,
  generateId,
  getVersionName,
  getLayoutVersionSummaries,
} from './utils/versions'
import { QUICK_ADD_PRESETS, FURNITURE_COLORS, type FurniturePreset } from './data/presets'
import type { CanvasDisplayOptions } from './utils/canvasDisplay'
import { getDefaultCanvasDisplayOptions } from './utils/canvasDisplay'

const DEFAULT_ROOM: Room = { width: 360, height: 540 }

type SimState = {
  versions: LayoutVersion[]
  activeVersionId: string
}

function makeInitialState(): SimState {
  const first = createLayoutVersion(DEFAULT_ROOM, 'A안')
  return { versions: [first], activeVersionId: first.id }
}

export function RoomSimulatorTool() {
  const [simState, setSimState] = useState<SimState>(makeInitialState)
  const { versions, activeVersionId } = simState
  const activeVersion = versions.find(v => v.id === activeVersionId) ?? versions[0]
  const { room, furnitureList: furniture, fixedElements } = activeVersion

  const [step, setStep] = useState<Step>('room')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [displayOptions, setDisplayOptions] = useState<CanvasDisplayOptions>(getDefaultCanvasDisplayOptions)
  const [showCompare, setShowCompare] = useState(false)
  const [show3D, setShow3D] = useState(false)

  // ── Active version patch helpers ────────────────────────────────────────────

  function patchActive(updates: Partial<Omit<LayoutVersion, 'id' | 'createdAt'>>) {
    const now = new Date().toISOString()
    setSimState(prev => ({
      ...prev,
      versions: prev.versions.map(v =>
        v.id === prev.activeVersionId ? { ...v, ...updates, updatedAt: now } : v
      ),
    }))
  }

  // ── Version management ──────────────────────────────────────────────────────

  function handleAddVersion() {
    const newVersion = createLayoutVersion(room, getVersionName(versions.length), versions.length)
    setSimState(prev => ({
      versions: [...prev.versions, newVersion],
      activeVersionId: newVersion.id,
    }))
    setSelectedId(null)
  }

  function handleDuplicateVersion(id: string) {
    const source = versions.find(v => v.id === id)!
    const dup = duplicateLayoutVersion(source, versions)
    setSimState(prev => ({
      versions: [...prev.versions, dup],
      activeVersionId: dup.id,
    }))
    setSelectedId(null)
  }

  function handleRenameVersion(id: string, name: string) {
    setSimState(prev => ({
      ...prev,
      versions: prev.versions.map(v =>
        v.id === id ? { ...v, name, updatedAt: new Date().toISOString() } : v
      ),
    }))
  }

  function handleDeleteVersion(id: string) {
    setSimState(prev => {
      const remaining = prev.versions.filter(v => v.id !== id)
      const newActiveId = prev.activeVersionId === id ? remaining[0].id : prev.activeVersionId
      return { versions: remaining, activeVersionId: newActiveId }
    })
    setSelectedId(null)
  }

  function handleSwitchVersion(id: string) {
    setSimState(prev => ({ ...prev, activeVersionId: id }))
    setSelectedId(null)
    setShowCompare(false)
  }

  // ── Furniture handlers ──────────────────────────────────────────────────────

  function handleAddFurniture(item: Omit<FurnitureItem, 'id' | 'x' | 'y'>) {
    const id = generateId()
    const now = new Date().toISOString()
    setSimState(prev => {
      const active = prev.versions.find(v => v.id === prev.activeVersionId)!
      const base: FurnitureItem = { ...item, id, x: 0, y: 0 }
      const { x, y } = findInitialPosition(active.room, active.furnitureList, base)
      return {
        ...prev,
        versions: prev.versions.map(v =>
          v.id === prev.activeVersionId
            ? { ...v, furnitureList: [...v.furnitureList, { ...base, x, y }], updatedAt: now }
            : v
        ),
      }
    })
    setSelectedId(id)
  }

  function handleQuickAdd(preset: FurniturePreset) {
    handleAddFurniture({
      name: preset.name,
      width: preset.width,
      depth: preset.depth,
      rotated: false,
      color: FURNITURE_COLORS[furniture.length % FURNITURE_COLORS.length],
      showClearance: false,
    })
  }

  function handleUpdateFurniture(id: string, updates: Partial<FurnitureItem>) {
    patchActive({
      furnitureList: furniture.map(f => (f.id === id ? { ...f, ...updates } : f)),
    })
  }

  function handleDeleteFurniture(id: string) {
    patchActive({ furnitureList: furniture.filter(f => f.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }

  function handleMove(id: string, x: number, y: number) {
    patchActive({
      furnitureList: furniture.map(f => (f.id === id ? { ...f, x, y } : f)),
    })
  }

  // ── Fixed element handlers ──────────────────────────────────────────────────

  function handleAddFixedElement(el: Omit<FixedElement, 'id'>) {
    patchActive({ fixedElements: [...fixedElements, { ...el, id: generateId() }] })
  }

  function handleDeleteFixedElement(id: string) {
    patchActive({ fixedElements: fixedElements.filter(e => e.id !== id) })
  }

  function handleRenameFixedElement(id: string, name: string) {
    patchActive({ fixedElements: fixedElements.map(e => (e.id === id ? { ...e, name } : e)) })
  }

  function handleMoveFixed(id: string, xCm: number, yCm: number) {
    patchActive({ fixedElements: fixedElements.map(e => (e.id === id ? { ...e, xCm, yCm } : e)) })
  }

  function handleRotateFixed(id: string) {
    const el = fixedElements.find(e => e.id === id)
    if (!el) return

    if (el.wallSide) {
      // Cycle wall side: top → right → bottom → left → top
      const order: WallSide[] = ['top', 'right', 'bottom', 'left']
      const nextSide = order[(order.indexOf(el.wallSide) + 1) % 4]
      const opening = (el.wallSide === 'top' || el.wallSide === 'bottom') ? el.widthCm : el.depthCm
      const rotated = { ...el, ...makeWallElement(room, nextSide, opening, el.type, el.name) }
      patchActive({ fixedElements: fixedElements.map(e => e.id === id ? rotated : e) })
    } else {
      // Floor element: swap width ↔ depth, re-clamp to room bounds
      const newW = el.depthCm
      const newD = el.widthCm
      const rotated = {
        ...el,
        widthCm: newW,
        depthCm: newD,
        xCm: Math.max(0, Math.min(room.width - newW, el.xCm)),
        yCm: Math.max(0, Math.min(room.height - newD, el.yCm)),
      }
      patchActive({ fixedElements: fixedElements.map(e => e.id === id ? rotated : e) })
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  function handleReset() {
    setSimState(makeInitialState())
    setStep('room')
    setSelectedId(null)
    setDisplayOptions(getDefaultCanvasDisplayOptions())
    setShowCompare(false)
    setShow3D(false)
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const pct = getOccupancyPercent(room, furniture)
  const status = getOccupancyStatus(pct)
  const warnings = checkClearances(room, furniture)
  const summaries = showCompare || versions.length > 1 ? getLayoutVersionSummaries(versions) : []

  const steps = [
    { id: 'room' as Step, label: '방 크기' },
    { id: 'furniture' as Step, label: '가구 배치' },
    { id: 'result' as Step, label: '결과' },
  ]
  const currentStepIndex = steps.findIndex(s => s.id === step)

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: 'var(--on-dark-mute)' }}
          >
            Room Simulator
          </p>
          <h1
            className="text-3xl font-bold leading-none mb-2"
            style={{ color: 'var(--on-dark)', letterSpacing: '-0.6px' }}
          >
            방 가구 시뮬레이터
          </h1>
          <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
            방 크기를 입력하고 가구를 배치해 실제 공간감을 확인하세요.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              {i > 0 && (
                <div
                  style={{
                    width: 20,
                    height: 1,
                    backgroundColor: i <= currentStepIndex ? 'var(--primary)' : 'var(--hairline)',
                  }}
                />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: i <= currentStepIndex ? 'var(--primary)' : 'var(--surface-card)',
                    border: `2px solid ${i <= currentStepIndex ? 'var(--primary)' : 'var(--hairline)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: i <= currentStepIndex ? 'var(--on-primary)' : 'var(--muted)',
                    flexShrink: 0,
                  }}
                >
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: i === currentStepIndex ? 'var(--on-dark)' : 'var(--muted)',
                    fontWeight: i === currentStepIndex ? 600 : 400,
                  }}
                >
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Room setup */}
        {step === 'room' && (
          <RoomSetup
            room={room}
            onRoomChange={r => patchActive({ room: r })}
            onNext={() => setStep('furniture')}
          />
        )}

        {/* Step 2: Furniture placement */}
        {step === 'furniture' && (
          <div className="space-y-4">
            {/* Version tabs (shown when there are 2+ versions, or always after first add) */}
            <VersionTabs
              versions={versions}
              activeVersionId={activeVersionId}
              onSwitch={handleSwitchVersion}
              onAdd={handleAddVersion}
              onRename={handleRenameVersion}
              onDuplicate={handleDuplicateVersion}
              onDelete={handleDeleteVersion}
            />

            {/* Compare mode */}
            {showCompare ? (
              <CompareView
                versions={versions}
                summaries={summaries}
                activeVersionId={activeVersionId}
                onSelect={handleSwitchVersion}
                onClose={() => setShowCompare(false)}
              />
            ) : (
              <>
                {/* Occupancy stat bar */}
                {furniture.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderRadius: 'var(--radius-card)',
                      padding: '12px 16px',
                    }}
                  >
                    {/* Row 1: stats + compare button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: status.color, fontFamily: 'var(--font-number)' }}
                        >
                          {pct}%
                        </span>
                        <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
                          {status.label}
                        </span>
                        {warnings.length > 0 && (
                          <span style={{ color: '#f7d04f', fontSize: '13px' }}>
                            ⚠ {warnings.length}
                          </span>
                        )}
                      </div>
                      {versions.length > 1 && (
                        <button
                          onClick={() => setShowCompare(true)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--hairline)',
                            backgroundColor: 'var(--surface-input)',
                            color: 'var(--on-dark-mute)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          비교
                        </button>
                      )}
                    </div>

                    {/* Row 2: display option chips */}
                    <div style={{ display: 'flex', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
                      <DisplayChip
                        label="크기 표시"
                        active={displayOptions.showFurnitureSizes}
                        onToggle={() => setDisplayOptions(o => ({ ...o, showFurnitureSizes: !o.showFurnitureSizes }))}
                      />
                      <DisplayChip
                        label="간격선"
                        active={displayOptions.showSpacingGuides}
                        onToggle={() => setDisplayOptions(o => ({ ...o, showSpacingGuides: !o.showSpacingGuides }))}
                      />
                      <DisplayChip
                        label="경고 아이콘"
                        active={displayOptions.showWarningIcons}
                        onToggle={() => setDisplayOptions(o => ({ ...o, showWarningIcons: !o.showWarningIcons }))}
                      />
                    </div>
                  </div>
                )}

                {/* 2D / 3D toggle */}
                {furniture.length > 0 && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <ViewToggle label="2D 배치" active={!show3D} onClick={() => setShow3D(false)} />
                    <ViewToggle label="3D 보기" active={show3D} onClick={() => setShow3D(true)} />
                  </div>
                )}

                {/* Canvas or 3D preview */}
                {show3D && furniture.length > 0 ? (
                  <Suspense fallback={<ThreeLoadingFallback />}>
                    <ThreePreview
                      room={room}
                      furniture={furniture}
                      fixedElements={fixedElements}
                      warnings={warnings}
                    />
                  </Suspense>
                ) : (
                  <RoomCanvas
                    room={room}
                    furniture={furniture}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onMove={handleMove}
                    displayOptions={displayOptions}
                    fixedElements={fixedElements}
                    onFixedMove={handleMoveFixed}
                    warnings={warnings}
                  />
                )}

                {/* Empty state: quick-add chips */}
                {furniture.length === 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      borderRadius: 'var(--radius-card)',
                      padding: '14px 16px',
                    }}
                  >
                    <p className="text-xs mb-3" style={{ color: 'var(--on-dark-mute)' }}>
                      자주 쓰는 가구로 빠르게 시작해보세요
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {QUICK_ADD_PRESETS.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleQuickAdd(preset)}
                          style={{
                            padding: '7px 13px',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--hairline)',
                            backgroundColor: 'var(--surface-input)',
                            color: 'var(--on-dark-mute)',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          + {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fixed elements panel */}
                <FixedElementPanel
                  room={room}
                  fixedElements={fixedElements}
                  onAdd={handleAddFixedElement}
                  onDelete={handleDeleteFixedElement}
                  onRename={handleRenameFixedElement}
                  onRotate={handleRotateFixed}
                />

                {/* Furniture management panel */}
                <FurniturePanel
                  room={room}
                  furniture={furniture}
                  selectedId={selectedId}
                  onAdd={handleAddFurniture}
                  onUpdate={handleUpdateFurniture}
                  onDelete={handleDeleteFurniture}
                  onSelect={setSelectedId}
                />
              </>
            )}

            {/* Navigation */}
            {!showCompare && (
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('room')}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-button)',
                    border: '1px solid var(--hairline)',
                    backgroundColor: 'transparent',
                    color: 'var(--on-dark-mute)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <ChevronLeft size={15} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />방 크기
                </button>
                <button
                  onClick={() => setStep('result')}
                  disabled={furniture.length === 0}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-button)',
                    border: 'none',
                    backgroundColor:
                      furniture.length === 0 ? 'var(--surface-card)' : 'var(--primary)',
                    color: furniture.length === 0 ? 'var(--muted)' : 'var(--on-primary)',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: furniture.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  결과 보기 <ChevronRight size={15} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 2 }} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && (
          <div className="space-y-4">
            <div style={{ display: 'flex', gap: 4 }}>
              <ViewToggle label="2D 배치" active={!show3D} onClick={() => setShow3D(false)} />
              <ViewToggle label="3D 보기" active={show3D} onClick={() => setShow3D(true)} />
            </div>
            {show3D ? (
              <Suspense fallback={<ThreeLoadingFallback />}>
                <ThreePreview
                  room={room}
                  furniture={furniture}
                  fixedElements={fixedElements}
                  warnings={warnings}
                />
              </Suspense>
            ) : (
              <RoomCanvas
                room={room}
                furniture={furniture}
                selectedId={null}
                onSelect={() => {}}
                onMove={() => {}}
                readonly
                fixedElements={fixedElements}
                warnings={warnings}
              />
            )}
            <ResultSummary
              room={room}
              furniture={furniture}
              fixedElements={fixedElements}
              layoutVersionName={activeVersion.name}
              onReset={handleReset}
              onBack={() => setStep('furniture')}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ThreeLoadingFallback ─────────────────────────────────────────────────────

function ThreeLoadingFallback() {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 'var(--radius-card)',
        backgroundColor: 'var(--surface-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--on-dark-mute)',
        fontSize: '13px',
      }}
    >
      3D 미리보기 불러오는 중…
    </div>
  )
}

// ─── ViewToggle ───────────────────────────────────────────────────────────────

function ViewToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px',
        borderRadius: 'var(--radius-button)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--hairline)'}`,
        backgroundColor: active ? 'var(--primary)' : 'var(--surface-card)',
        color: active ? 'var(--on-primary)' : 'var(--on-dark-mute)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ─── DisplayChip ──────────────────────────────────────────────────────────────

function DisplayChip({
  label,
  active,
  onToggle,
}: {
  label: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: '4px 10px',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--hairline)'}`,
        backgroundColor: active ? 'var(--primary)' : 'var(--surface-input)',
        color: active ? 'var(--on-primary)' : 'var(--on-dark-mute)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}
