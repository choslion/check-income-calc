export type Winner = 'delivery' | 'cooking' | 'similar'

export interface DeliveryVsCookingInput {
  deliveryFoodPrice: number
  deliveryFee: number
  discountAmount: number
  deliveryMealCount: number
  ingredientCost: number
  cookingMealCount: number
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
  breakEvenMealCount?: number
}

export interface HandoffToRecipes {
  fromCalculator: true
  ingredientCost: number
  cookingMealCount: number
  winner: Winner
}

export interface HandoffToCalculator {
  fromRecommender: true
  selectedRecipeName: string
}
