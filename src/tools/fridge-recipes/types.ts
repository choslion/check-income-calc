export type Difficulty = 'easy' | 'normal' | 'hard'

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
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
  availableIngredients: string[]
  missingRequiredIngredients: string[]
  availableSeasonings: string[]
  missingRequiredSeasonings: string[]
  score: number
}
