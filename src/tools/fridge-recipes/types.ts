export type Difficulty = 'easy' | 'normal' | 'hard'
export type ResultGroup = 'ready' | 'almostReady'

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
}

export const RESULT_GROUP_LABEL: Record<ResultGroup, string> = {
  ready: '바로 만들 수 있어요',
  almostReady: '거의 가능해요',
}

export interface Recipe {
  id: string
  name: string
  requiredIngredients: string[]
  optionalIngredients: string[]
  requiredSeasonings: string[]
  optionalSeasonings: string[]
  difficulty: Difficulty
  estimatedTimeMinutes: number
  reason: string
  simpleSteps: string[]
}

export interface RecipeMatchResult {
  recipe: Recipe
  group: ResultGroup
  availableIngredients: string[]
  missingRequiredIngredients: string[]
  availableSeasonings: string[]
  missingRequiredSeasonings: string[]
  score: number
}
