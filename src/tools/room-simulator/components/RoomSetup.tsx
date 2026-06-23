import { useState } from 'react'
import type { CSSProperties } from 'react'
import { ChevronRight, Check } from 'lucide-react'
import type { Room, Unit } from '../types'
import { ROOM_PRESETS } from '../data/presets'

interface Props {
  room: Room
  onRoomChange: (room: Room) => void
  onNext: () => void
}

export function RoomSetup({ room, onRoomChange, onNext }: Props) {
  const [unit, setUnit] = useState<Unit>('cm')
  const [widthInput, setWidthInput] = useState(String(room.width))
  const [heightInput, setHeightInput] = useState(String(room.height))
  const [errors, setErrors] = useState<{ width?: string; height?: string }>({})

  function toCm(val: string): number {
    const n = parseFloat(val)
    if (isNaN(n) || n <= 0) return 0
    return unit === 'm' ? Math.round(n * 100) : Math.round(n)
  }

  function validate(): boolean {
    const w = toCm(widthInput)
    const h = toCm(heightInput)
    const errs: { width?: string; height?: string } = {}
    if (!w) errs.width = '유효한 너비를 입력해주세요'
    else if (w > 2000) errs.width = '너무 큰 값이에요 (최대 2000cm)'
    if (!h) errs.height = '유효한 높이를 입력해주세요'
    else if (h > 2000) errs.height = '너무 큰 값이에요 (최대 2000cm)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleWidthChange(val: string) {
    setWidthInput(val)
    const w = toCm(val)
    if (w > 0) onRoomChange({ ...room, width: w })
  }

  function handleHeightChange(val: string) {
    setHeightInput(val)
    const h = toCm(val)
    if (h > 0) onRoomChange({ ...room, height: h })
  }

  function handleUnitChange(newUnit: Unit) {
    const w = toCm(widthInput)
    const h = toCm(heightInput)
    setUnit(newUnit)
    if (w > 0) setWidthInput(newUnit === 'm' ? (w / 100).toFixed(2) : String(w))
    if (h > 0) setHeightInput(newUnit === 'm' ? (h / 100).toFixed(2) : String(h))
  }

  function handlePreset(preset: (typeof ROOM_PRESETS)[0]) {
    onRoomChange({ width: preset.width, height: preset.height })
    setWidthInput(unit === 'm' ? (preset.width / 100).toFixed(2) : String(preset.width))
    setHeightInput(unit === 'm' ? (preset.height / 100).toFixed(2) : String(preset.height))
    setErrors({})
  }

  function handleNext() {
    if (validate()) onNext()
  }

  const w = toCm(widthInput)
  const h = toCm(heightInput)
  const areaCm2 = w * h
  const areaPy = areaCm2 > 0 ? (areaCm2 / 33057).toFixed(1) : null

  const inputStyle: CSSProperties = {
    backgroundColor: 'var(--surface-input)',
    border: '1px solid var(--hairline)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--on-dark)',
    fontSize: '18px',
    fontFamily: 'var(--font-number)',
    padding: '12px 14px',
    width: '100%',
    outline: 'none',
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--on-dark-mute)' }}>
          Step 1
        </p>
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--on-dark)', letterSpacing: '-0.5px' }}>
          방 크기 입력
        </h2>
        <p className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>
          예시 버튼으로 시작하거나 직접 입력하세요.
        </p>
      </div>

      {/* Unit toggle */}
      <div className="flex gap-2">
        {(['cm', 'm'] as Unit[]).map(u => (
          <button
            key={u}
            onClick={() => handleUnitChange(u)}
            style={{
              padding: '6px 18px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${unit === u ? 'var(--primary)' : 'var(--hairline)'}`,
              backgroundColor: unit === u ? 'var(--primary)' : 'var(--surface-card)',
              color: unit === u ? 'var(--on-primary)' : 'var(--on-dark-mute)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Width / Height inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--on-dark-mute)' }}>
            가로 (너비)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={widthInput}
            onChange={e => handleWidthChange(e.target.value)}
            placeholder={unit === 'm' ? '예: 3.6' : '예: 360'}
            style={{
              ...inputStyle,
              borderColor: errors.width ? 'var(--danger)' : 'var(--hairline)',
            }}
          />
          {errors.width && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.width}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-2" style={{ color: 'var(--on-dark-mute)' }}>
            세로 (깊이)
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={heightInput}
            onChange={e => handleHeightChange(e.target.value)}
            placeholder={unit === 'm' ? '예: 5.4' : '예: 540'}
            style={{
              ...inputStyle,
              borderColor: errors.height ? 'var(--danger)' : 'var(--hairline)',
            }}
          />
          {errors.height && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.height}</p>
          )}
        </div>
      </div>

      {/* Calculated area */}
      {areaCm2 > 0 && (
        <div
          style={{
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--radius-card)',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="text-sm" style={{ color: 'var(--on-dark-mute)' }}>계산된 방 넓이</span>
          <div>
            <span
              className="font-bold"
              style={{ color: 'var(--on-dark)', fontFamily: 'var(--font-number)' }}
            >
              {(areaCm2 / 10000).toFixed(2)}m²
            </span>
            {areaPy && (
              <span className="text-sm ml-2" style={{ color: 'var(--on-dark-mute)' }}>
                (약 {areaPy}평)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Presets */}
      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-3"
          style={{ color: 'var(--on-dark-mute)' }}
        >
          예시로 시작하기
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ROOM_PRESETS.map(preset => {
            const isSelected = room.width === preset.width && room.height === preset.height
            return (
            <button
              key={preset.id}
              onClick={() => handlePreset(preset)}
              aria-pressed={isSelected}
              style={{
                position: 'relative',
                padding: '10px 12px',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--hairline)'}`,
                borderRadius: 8,
                backgroundColor: isSelected ? 'var(--primary-soft, var(--surface-card))' : 'var(--surface-card)',
                boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {isSelected && (
                <Check
                  size={14}
                  style={{ position: 'absolute', top: 10, right: 10, color: 'var(--primary)' }}
                />
              )}
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-dark)' }}>
                {preset.label}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  marginTop: 2,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-number)',
                }}
              >
                {preset.width} × {preset.height}cm
              </div>
              <div style={{ fontSize: '10px', marginTop: 2, color: 'var(--muted)' }}>
                {preset.description}
              </div>
            </button>
            )
          })}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          실제 방 구조에 따라 달라요. 선택 후 직접 수정하세요.
        </p>
      </div>

      <button
        onClick={handleNext}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-button)',
          border: 'none',
          backgroundColor: 'var(--primary)',
          color: 'var(--on-primary)',
          fontWeight: 700,
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        가구 배치하기 <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
      </button>
    </div>
  )
}
