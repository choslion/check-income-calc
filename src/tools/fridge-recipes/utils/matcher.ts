import type { Recipe, RecipeMatchResult } from '../types'

export function matchRecipes(
  ingredients: string[],
  seasonings: string[],
  recipes: Recipe[]
): RecipeMatchResult[] {
  const ingSet = new Set(ingredients)
  const seaSet = new Set(seasonings)

  const results: RecipeMatchResult[] = []

  for (const recipe of recipes) {
    const availableIngredients = recipe.requiredIngredients.filter(i => ingSet.has(i))
    const missingRequiredIngredients = recipe.requiredIngredients.filter(i => !ingSet.has(i))
    const availableSeasonings = recipe.requiredSeasonings.filter(s => seaSet.has(s))
    const missingRequiredSeasonings = recipe.requiredSeasonings.filter(s => !seaSet.has(s))

    // Skip if missing more than 1 required ingredient or more than 1 required seasoning
    if (missingRequiredIngredients.length > 1 || missingRequiredSeasonings.length > 1) continue

    const score =
      availableIngredients.length * 3 +
      recipe.optionalIngredients.filter(i => ingSet.has(i)).length +
      availableSeasonings.length * 2 +
      recipe.optionalSeasonings.filter(s => seaSet.has(s))

    results.push({
      recipe,
      availableIngredients,
      missingRequiredIngredients,
      availableSeasonings,
      missingRequiredSeasonings,
      score,
    })
  }

  return results.sort((a, b) => b.score - a.score)
}
