import type { DeliveryVsCookingInput, DeliveryVsCookingResult, Winner } from './types'

const SIMILAR_THRESHOLD = 500

export function calculateDeliveryVsCooking(
  input: DeliveryVsCookingInput
): DeliveryVsCookingResult | null {
  const { deliveryFoodPrice, deliveryFee, discountAmount, ingredientCost, expectedMealCount } = input

  if (deliveryFoodPrice <= 0 || ingredientCost <= 0 || expectedMealCount <= 0) return null

  const servings = Math.max(1, input.deliveryServingCount || 1)
  const meals = Math.max(1, expectedMealCount)

  const deliveryTotal = Math.max(0, deliveryFoodPrice + deliveryFee - discountAmount)
  const deliveryCostPerMeal = deliveryTotal / servings
  const cookingCostPerMeal = ingredientCost / meals
  const differencePerMeal = deliveryCostPerMeal - cookingCostPerMeal

  let winner: Winner
  if (differencePerMeal > SIMILAR_THRESHOLD) winner = 'cooking'
  else if (differencePerMeal < -SIMILAR_THRESHOLD) winner = 'delivery'
  else winner = 'similar'

  const totalSaving = winner === 'cooking' ? differencePerMeal * meals : 0

  return { deliveryTotal, deliveryCostPerMeal, cookingCostPerMeal, differencePerMeal, totalSaving, winner }
}
