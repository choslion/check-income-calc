import { useEffect } from 'react'
import { WasteSortingTool } from '../../tools/waste-sorting/WasteSortingTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function WasteSortingPage() {
  useEffect(() => {
    document.title = '이거 어디 버려? · 생활계산소'
    recordToolUsage('waste-sorting')
  }, [])

  return <WasteSortingTool />
}
