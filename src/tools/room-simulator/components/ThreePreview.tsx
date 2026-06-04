import { useState, useMemo, useRef, useEffect, useCallback, Component } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
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
  // Use a thin box (not planeGeometry) so the floor is visible from all camera angles
  return (
    <mesh position={[w / 2, -0.003, d / 2]}>
      <boxGeometry args={[w, 0.006, d]} />
      <meshStandardMaterial color="#1e2d42" />
    </mesh>
  )
}

// ── Room perimeter border ─────────────────────────────────────────────────────

function RoomBorder({ room }: { room: Room }) {
  const W = u(room.width)
  const D = u(room.height)
  const thick = u(4)
  const bh = u(6)
  const by = bh / 2
  const color = '#4d8ad6'

  return (
    <>
      <mesh position={[W / 2, by, 0]}>
        <boxGeometry args={[W + thick * 2, bh, thick]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[W / 2, by, D]}>
        <boxGeometry args={[W + thick * 2, bh, thick]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, by, D / 2]}>
        <boxGeometry args={[thick, bh, D]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[W, by, D / 2]}>
        <boxGeometry args={[thick, bh, D]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </>
  )
}

// ── Floor perimeter outline ────────────────────────────────────────────────────

function RoomFloorOutline({ room }: { room: Room }) {
  const W = u(room.width)
  const D = u(room.height)
  const y = 0.005
  const points: [number, number, number][] = [
    [0, y, 0], [W, y, 0], [W, y, D], [0, y, D], [0, y, 0],
  ]
  return <Line points={points} color="#7ab8ff" lineWidth={2} />
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
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position={[W / 2, hy, D]}>
        <boxGeometry args={[W + wt * 2, wh, wt]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position={[0, hy, D / 2]}>
        <boxGeometry args={[wt, wh, D]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position={[W, hy, D / 2]}>
        <boxGeometry args={[wt, wh, D]} />
        <meshStandardMaterial color="#2a3448" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </>
  )
}

// ── Furniture block ───────────────────────────────────────────────────────────

function FurnitureBlock({ item }: { item: FurnitureItem }) {
  const fw = item.rotated ? item.depth : item.width
  const fd = item.rotated ? item.width : item.depth
  const fh = getFurnitureHeightCm(item)
  const W = u(fw)
  const D = u(fd)
  const H = u(fh)
  const px = u(item.x) + W / 2
  const pz = u(item.y) + D / 2

  return (
    <group>
      <mesh position={[px, H / 2, pz]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={item.color} transparent opacity={0.88} />
      </mesh>
      {/* Top face highlight */}
      <mesh position={[px, H + 0.001, pz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.97, D * 0.97]} />
        <meshBasicMaterial color={item.color} transparent opacity={0.45} />
      </mesh>
      {/* Name label */}
      <Html position={[px, H + 0.07, pz]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={LABEL_STYLE}>{item.name}</div>
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

const LABEL_STYLE: CSSProperties = {
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
}

// Minimum 3D render thickness for wall-mounted elements (WALL_DEPTH_CM=8 is too thin to see)
const MIN_WALL_THICKNESS_CM = 25

function FixedElement3D({ el }: { el: FixedElement }) {
  const cfg: FixedCfg = FIXED_CFG[el.type] ?? { color: '#6b7280', heightCm: 100, elevCm: 0, opacity: 0.7 }

  // Expand the thin wall-perpendicular axis so the element is always visible
  let widthCm = el.widthCm
  let depthCm = el.depthCm
  if (el.wallSide === 'top' || el.wallSide === 'bottom') {
    depthCm = Math.max(depthCm, MIN_WALL_THICKNESS_CM)
  } else if (el.wallSide === 'left' || el.wallSide === 'right') {
    widthCm = Math.max(widthCm, MIN_WALL_THICKNESS_CM)
  }

  const W = u(widthCm)
  const D = u(depthCm)
  const H = u(cfg.heightCm)
  const elev = u(cfg.elevCm)
  const cx = u(el.xCm) + W / 2
  const cz = u(el.yCm) + D / 2

  return (
    <group>
      <mesh position={[cx, H / 2 + elev, cz]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color={cfg.color} transparent opacity={cfg.opacity} depthWrite={false} />
      </mesh>
      <Html position={[cx, H + elev + 0.07, cz]} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={LABEL_STYLE}>{el.name}</div>
      </Html>
    </group>
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

// ── Error boundary ────────────────────────────────────────────────────────────

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: 'var(--radius-card)',
            backgroundColor: 'var(--surface-card)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--on-dark)', fontSize: '14px', fontWeight: 600 }}>
            3D 미리보기를 불러올 수 없습니다
          </p>
          <p style={{ color: 'var(--on-dark-mute)', fontSize: '13px', lineHeight: 1.6 }}>
            현재 기기에서 3D 미리보기를 불러오지 못했습니다.
            <br />
            2D 배치 화면을 이용해 주세요.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ── ThreePreview ──────────────────────────────────────────────────────────────

interface ThreePreviewProps {
  room: Room
  furniture: FurnitureItem[]
  fixedElements: FixedElement[]
  warnings?: ClearanceWarning[]
}

export function ThreePreview({ room, furniture, fixedElements }: ThreePreviewProps) {
  const [preset, setPreset] = useState<CameraPreset>('iso')

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
    <CanvasErrorBoundary>
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
        <RoomBorder room={room} />
        <RoomFloorOutline room={room} />
        <RoomWalls room={room} />
        {furniture.map(f => (
          <FurnitureBlock key={f.id} item={f} />
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
    </CanvasErrorBoundary>
  )
}
