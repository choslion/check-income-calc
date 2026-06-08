import { useEffect } from 'react'
import { StainRemovalTool } from '../../tools/stain-removal/StainRemovalTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function StainRemovalPage() {
  useEffect(() => {
    document.title = '얼룩 제거 가이드 · 생활계산소'
    recordToolUsage('stain-removal')
  }, [])

  return <StainRemovalTool />
}
