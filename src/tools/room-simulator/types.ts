export type Unit = 'cm' | 'm'

export interface Room {
  width: number  // cm
  height: number // cm
}

export interface FurnitureItem {
  id: string
  name: string
  width: number    // cm (physical width)
  depth: number    // cm (physical depth)
  heightCm?: number // cm (physical height, optional — used for 3D preview)
  x: number        // cm from room left
  y: number        // cm from room top
  rotated: boolean
  color: string
  showClearance: boolean
}

export interface ClearanceWarning {
  id: string
  message: string
}

export type FixedElementType =
  | 'door'
  | 'window'
  | 'builtInCloset'
  | 'balconyDoor'
  | 'column'
  | 'unavailableArea'

export type WallSide = 'top' | 'right' | 'bottom' | 'left'

export interface FixedElement {
  id: string
  type: FixedElementType
  name: string
  xCm: number      // top-left corner in room coordinates
  yCm: number
  widthCm: number  // horizontal dimension
  depthCm: number  // vertical dimension
  wallSide?: WallSide
}

export type Step = 'room' | 'furniture' | 'result'

export interface LayoutVersion {
  id: string
  name: string
  room: Room
  furnitureList: FurnitureItem[]
  fixedElements: FixedElement[]
  createdAt: string
  updatedAt: string
}

export interface LayoutVersionSummary {
  layoutVersionId: string
  name: string
  occupancyPercent: number
  status: { label: string; sublabel: string; color: string }
  furnitureCount: number
  warningCount: number
  overlapWarningCount: number
  fixedElementConflictCount: number
  minimumClearanceCm: number | null
  mainWarning: ClearanceWarning | null
  isRecommended: boolean
  recommendedReason: string | null
  score: number
  scoreStatusLabel: string
  mainSuggestion: string | null
}
