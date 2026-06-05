import { useEffect } from 'react'
import { FridgeRecipesTool } from '../../tools/fridge-recipes/FridgeRecipesTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function FridgeRecipesPage() {
  useEffect(() => {
    document.title = '냉장고 재료 요리 추천 · 생활계산소'
    recordToolUsage('fridge-recipes')
  }, [])

  return <FridgeRecipesTool />
}
