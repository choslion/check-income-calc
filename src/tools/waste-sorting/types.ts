export type ResultType = 'food' | 'general' | 'mixed' | 'local-check' | 'unknown'

export interface WastePart {
  name: string
  resultType: ResultType
  resultLabel: string
  disposalMethod: string
}

export interface WasteItem {
  id: string
  name: string
  aliases: string[]
  category: string
  resultType: ResultType
  resultLabel: string
  disposalMethod?: string
  reason?: string
  tip?: string
  caution?: string
  relatedIds?: string[]
  parts?: WastePart[]
  updatedAt: string
}

export interface WasteCategory {
  id: string
  label: string
  emoji: string
}

export interface RecentSearch {
  itemId: string
  itemName: string
  resultType: ResultType
  searchedAt: string
}
