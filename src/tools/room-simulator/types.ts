export type Unit = 'cm' | 'm'

export interface Room {
  width: number  // cm
  height: number // cm
}

export interface FurnitureItem {
  id: string
  name: string
  width: number  // cm (physical width)
  depth: number  // cm (physical depth)
  x: number      // cm from room left
  y: number      // cm from room top
  rotated: boolean
  color: string
  showClearance: boolean
}

export interface ClearanceWarning {
  id: string
  message: string
}

export type Step = 'room' | 'furniture' | 'result'
