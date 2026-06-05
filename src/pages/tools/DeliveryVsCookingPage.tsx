import { useEffect } from 'react'
import { DeliveryVsCookingTool } from '../../tools/delivery-vs-cooking/DeliveryVsCookingTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function DeliveryVsCookingPage() {
  useEffect(() => {
    document.title = '배달 vs 요리 계산기 · 생활계산소'
    recordToolUsage('delivery-vs-cooking')
  }, [])

  return <DeliveryVsCookingTool />
}
