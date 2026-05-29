import { useEffect } from 'react'
import { WasteSortingTool } from '../../tools/waste-sorting/WasteSortingTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function WasteSortingPage() {
  useEffect(() => {
    recordToolUsage('waste-sorting')
  }, [])

  return <WasteSortingTool />
}
