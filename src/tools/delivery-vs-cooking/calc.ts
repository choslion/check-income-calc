import type { DeliveryVsCookingInput, DeliveryVsCookingResult, Winner } from './types'

const SIMILAR_THRESHOLD = 500

export function calculateDeliveryVsCooking(
  input: DeliveryVsCookingInput
): DeliveryVsCookingResult | null {
  const { deliveryFoodPrice, deliveryFee, discountAmount, ingredientCost, cookingMealCount } = input

  if (deliveryFoodPrice <= 0 || ingredientCost <= 0 || cookingMealCount <= 0) return null

  const deliveryMeals = Math.max(1, input.deliveryMealCount || 1)
  const cookingMeals  = Math.max(1, cookingMealCount)

  const deliveryTotal      = Math.max(0, deliveryFoodPrice + deliveryFee - discountAmount)
  const deliveryCostPerMeal = deliveryTotal / deliveryMeals
  const cookingCostPerMeal  = ingredientCost / cookingMeals
  const differencePerMeal   = deliveryCostPerMeal - cookingCostPerMeal

  let winner: Winner
  if (differencePerMeal > SIMILAR_THRESHOLD) winner = 'cooking'
  else if (differencePerMeal < -SIMILAR_THRESHOLD) winner = 'delivery'
  else winner = 'similar'

  const totalSaving = winner === 'cooking' ? differencePerMeal * cookingMeals : 0

  const breakEvenMealCount =
    deliveryCostPerMeal > 0
      ? Math.ceil(ingredientCost / deliveryCostPerMeal)
      : undefined

  return {
    deliveryTotal,
    deliveryCostPerMeal,
    cookingCostPerMeal,
    differencePerMeal,
    totalSaving,
    winner,
    breakEvenMealCount,
  }
}
