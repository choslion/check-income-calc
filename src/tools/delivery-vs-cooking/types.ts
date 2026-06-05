export type Winner = 'delivery' | 'cooking' | 'similar'

export interface DeliveryVsCookingInput {
  deliveryFoodPrice: number
  deliveryFee: number
  discountAmount: number
  deliveryServingCount: number
  ingredientCost: number
  expectedMealCount: number
  cookingTimeMinutes: number
  cleanupTimeMinutes: number
}

export interface DeliveryVsCookingResult {
  deliveryTotal: number
  deliveryCostPerMeal: number
  cookingCostPerMeal: number
  differencePerMeal: number
  totalSaving: number
  winner: Winner
}

export interface HandoffToRecipes {
  fromCalculator: true
  ingredientCost: number
  expectedMealCount: number
  winner: Winner
}

export interface HandoffToCalculator {
  fromRecommender: true
  selectedRecipeName: string
}
