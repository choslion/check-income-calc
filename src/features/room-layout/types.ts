export type Unit = 'cm' | 'm'

export type Room = {
  widthCm: number
  heightCm: number
}

export type Furniture = {
  id: string
  name: string
  widthCm: number
  depthCm: number
  xCm: number
  yCm: number
  rotated: boolean
}

export type FurnitureEffectiveSize = {
  widthCm: number
  depthCm: number
}

export type WallClearance = {
  left: number
  right: number
  top: number
  bottom: number
}

export type OccupancyStatus = 'Spacious' | 'Normal' | 'Tight' | 'Very tight'

export type LayoutWarningType = 'overlap' | 'clearance' | 'boundary'

export type LayoutWarning = {
  type: LayoutWarningType
  message: string
  furnitureIds?: string[]
}

export type LayoutSummary = {
  roomAreaCm2: number
  totalFurnitureAreaCm2: number
  occupancyPercent: number
  status: OccupancyStatus
  warnings: LayoutWarning[]
}
