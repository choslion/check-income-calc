export type ParseConfidence = 'high' | 'medium' | 'low'

export interface ParsedFurnitureSize {
  widthMm?: number
  depthMm?: number
  heightMm?: number
  sourceText: string
  confidence: ParseConfidence
  assumptions: string[]
}

export interface FurnitureSizeParseResult {
  success: boolean
  parsed?: ParsedFurnitureSize
  errorMessage?: string
}
