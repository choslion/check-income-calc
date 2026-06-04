import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import type { Room, FurnitureItem, FixedElement, ClearanceWarning } from '../types'
import { getFurnitureHeightCm } from '../utils/furniture3dDefaults'

// 1 Three.js unit = 100cm
const CM = 0.01

function u(cm: number): number {
  return cm * CM
}

// ── Floor ─────────────────────────────────────────────────────────────────────

function RoomFloor({ room }: { room: Room }) {
  const w = u(room.width)
  const d = u(room.height)
  return (
    <mesh position={[w / 2, 0, d / 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color="#151c28" />
    </mesh>
  )
}

// ── Walls ─────────────────────────────────────────────────────────────────────

function RoomWalls({ room }: { room: Room }) {
  const W = u(room.width)
  const D = u(room.height)
  const wh = u(240)
  const wt = u(5)
  const hy = wh / 2

  return (
    <>
      <mesh position={[W / 2, hy, 0]}>
        <boxGeometry args={[W + wt * 2, wh, wt]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} />
      </mesh>
      <mesh position={[W / 2, hy, D]}>
        <boxGeometry args={[W + wt * 2, wh, wt]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, hy, D / 2]}>
        <boxGeometry args={[wt, wh, D]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} />
      </mesh>
      <mesh position={[W, hy, D / 2]}>
        <boxGeometry args={[wt, wh, D]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} />
      </mesh>
    </>
  )
}

// ── Furniture block ───────────────────────────────────────────────────────────

function FurnitureBlock({ item, hasWarning }: { item: FurnitureItem; hasWarning: boolean }) {
  const fw = item.rotated ? item.depth : item.width
  const fd = item.rotated ? item.width : item.depth
  const fh = getFurnitureHeightCm(item)
  const W = u(fw)
  const D = u(fd)
  const H = u(fh)
  const px = u(item.x) + W / 2
  const pz = u(item.y) + D / 2
  const blockColor = hasWarning ? '#c49a1c' : item.color

  return (
    <group>
      <mesh position={[px, H / 2, pz]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={blockColor} transparent opacity={0.88} />
      </mesh>
      {/* Top face highlight */}
      <mesh position={[px, H + 0.001, pz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.97, D * 0.97]} />
        <meshBasicMaterial color={blockColor} transparent opacity={0.45} />
      </mesh>
      {/* Name label */}
      <Html position={[px, H + 0.07, pz]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '2px 5px',
            borderRadius: '3px',
            whiteSpace: 'nowrap',
            maxWidth: '90px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontFamily: 'Inter, -apple-system, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {item.name}
        </div>
      </Html>
    </group>
  )
}

// ── Fixed element ─────────────────────────────────────────────────────────────

type FixedCfg = { color: string; heightCm: number; elevCm: number; opacity: number }

const FIXED_CFG: Record<string, FixedCfg> = {
  door:            { color: '#4f80f7', heightCm: 200, elevCm: 0,  opacity: 0.6 },
  balconyDoor:     { color: '#3b6fd4', heightCm: 220, elevCm: 0,  opacity: 0.6 },
  window:          { color: '#7dd3fc', heightCm: 110, elevCm: 75, opacity: 0.55 },
  builtInCloset:   { color: '#6b7280', heightCm: 220, elevCm: 0,  opacity: 0.75 },
  column:          { color: '#374151', heightCm: 240, elevCm: 0,  opacity: 0.9 },
  unavailableArea: { color: '#92400e', heightCm: 12,  elevCm: 0,  opacity: 0.7 },
}

function FixedElement3D({ el }: { el: FixedElement }) {
  const cfg: FixedCfg = FIXED_CFG[el.type] ?? { color: '#6b7280', heightCm: 100, elevCm: 0, opacity: 0.7 }
  const W = u(el.widthCm)
  const D = u(el.depthCm)
  const H = u(cfg.heightCm)
  const cy = H / 2 + u(cfg.elevCm)

  return (
    <mesh position={[u(el.xCm) + W / 2, cy, u(el.yCm) + D / 2]}>
      <boxGeometry args={[W, H, D]} />
      <meshStandardMaterial color={cfg.color} transparent opacity={cfg.opacity} />
    </mesh>
  )
}

// ── Camera rig ────────────────────────────────────────────────────────────────

type CameraPreset = 'iso' | 'top' | 'front'

interface CameraRigProps {
  preset: CameraPreset
  cx: number
  cz: number
  maxDim: number
}

function CameraRig({ preset, cx, cz, maxDim }: CameraRigProps) {
  const { camera } = useThree()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  const applyPreset = useCallback((p: CameraPreset) => {
    let px: number, py: number, pz: number
    if (p === 'top') {
      px = cx; py = maxDim * 2.5; pz = cz + 0.0001
    } else if (p === 'front') {
      px = cx; py = maxDim * 0.5; pz = cz + maxDim * 2.2
    } else {
      px = cx + maxDim * 0.9; py = maxDim * 0.85; pz = cz + maxDim * 1.1
    }
    camera.position.set(px, py, pz)
    if (controlsRef.current) {
      controlsRef.current.target.set(cx, 0, cz)
      controlsRef.current.update()
    }
  }, [camera, cx, cz, maxDim])

  useEffect(() => {
    applyPreset(preset)
  }, [preset, applyPreset])

  return (
    <OrbitControls
      ref={controlsRef}
      target={[cx, 0, cz]}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.3}
      maxDistance={maxDim * 5}
    />
  )
}

// ── ThreePreview ──────────────────────────────────────────────────────────────

interface ThreePreviewProps {
  room: Room
  furniture: FurnitureItem[]
  fixedElements: FixedElement[]
  warnings: ClearanceWarning[]
}

export function ThreePreview({ room, furniture, fixedElements, warnings }: ThreePreviewProps) {
  const [preset, setPreset] = useState<CameraPreset>('iso')

  const warnedIds = useMemo(
    () => new Set(furniture.filter(f => warnings.some(w => w.id.includes(f.id))).map(f => f.id)),
    [furniture, warnings]
  )

  const W = u(room.width)
  const D = u(room.height)
  const cx = W / 2
  const cz = D / 2
  const maxDim = Math.max(W, D)

  const initPos = useMemo<[number, number, number]>(
    () => [cx + maxDim * 0.9, maxDim * 0.85, cz + maxDim * 1.1],
    // Only recalculate on room size change, not on orbit
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [room.width, room.height]
  )

  const viewButtons: { id: CameraPreset; label: string }[] = [
    { id: 'iso',   label: '사선' },
    { id: 'top',   label: '위'   },
    { id: 'front', label: '정면' },
  ]

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: initPos, fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: '#0d1117', display: 'block' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 5]} intensity={0.6} />
        <directionalLight position={[-3, 5, -3]} intensity={0.25} />
        <RoomFloor room={room} />
        <RoomWalls room={room} />
        {furniture.map(f => (
          <FurnitureBlock key={f.id} item={f} hasWarning={warnedIds.has(f.id)} />
        ))}
        {fixedElements.map(el => (
          <FixedElement3D key={el.id} el={el} />
        ))}
        <CameraRig preset={preset} cx={cx} cz={cz} maxDim={maxDim} />
      </Canvas>

      {/* Preview badge */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          padding: '3px 8px',
          borderRadius: 'var(--radius-pill)',
          backgroundColor: 'rgba(13,17,23,0.75)',
          color: 'var(--on-dark-mute)',
          fontSize: '11px',
          fontWeight: 600,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        3D 미리보기
      </div>

      {/* Camera preset buttons */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {viewButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setPreset(btn.id)}
            style={{
              padding: '5px 11px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${preset === btn.id ? 'var(--primary)' : 'rgba(255,255,255,0.18)'}`,
              backgroundColor: preset === btn.id ? 'var(--primary)' : 'rgba(13,17,23,0.7)',
              color: preset === btn.id ? 'var(--on-primary)' : 'var(--on-dark-mute)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
