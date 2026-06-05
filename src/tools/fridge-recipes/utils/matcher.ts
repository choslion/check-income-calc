import type { Recipe, RecipeMatchResult, ResultGroup } from '../types'

export function matchRecipes(
  ingredients: string[],
  seasonings: string[],
  recipes: Recipe[]
): RecipeMatchResult[] {
  const ingSet = new Set(ingredients)
  const seaSet = new Set(seasonings)

  const results: RecipeMatchResult[] = []

  for (const recipe of recipes) {
    const availableIngredients       = recipe.requiredIngredients.filter(i => ingSet.has(i))
    const missingRequiredIngredients  = recipe.requiredIngredients.filter(i => !ingSet.has(i))
    const availableSeasonings         = recipe.requiredSeasonings.filter(s => seaSet.has(s))
    const missingRequiredSeasonings   = recipe.requiredSeasonings.filter(s => !seaSet.has(s))

    // Show if missing at most 1 required ingredient AND at most 1 required seasoning (independently)
    if (missingRequiredIngredients.length > 1 || missingRequiredSeasonings.length > 1) continue

    const totalMissing = missingRequiredIngredients.length + missingRequiredSeasonings.length
    const group: ResultGroup = totalMissing === 0 ? 'ready' : 'almostReady'

    const score =
      availableIngredients.length * 50 +
      availableSeasonings.length * 20 +
      recipe.optionalIngredients.filter(i => ingSet.has(i)).length * 10 +
      recipe.optionalSeasonings.filter(s => seaSet.has(s)).length * 5 +
      missingRequiredIngredients.length * -30 +
      missingRequiredSeasonings.length * -10 +
      (recipe.estimatedTimeMinutes <= 15 ? 10 : 0) +
      (recipe.difficulty === 'easy' ? 10 : 0)

    results.push({
      recipe,
      group,
      availableIngredients,
      missingRequiredIngredients,
      availableSeasonings,
      missingRequiredSeasonings,
      score,
    })
  }

  return results.sort((a, b) => {
    if (a.group !== b.group) return a.group === 'ready' ? -1 : 1
    return b.score - a.score
  })
}
