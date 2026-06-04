import { useEffect } from 'react'
import { SubscriptionTool } from '../../tools/subscription/SubscriptionTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function SubscriptionPage() {
  useEffect(() => {
    document.title = '구독 계산기 · 생활계산소'
    recordToolUsage('subscription')
  }, [])

  return <SubscriptionTool />
}
