import { useEffect } from 'react'
import { ResignationCalculator } from '../../tools/resignation/ResignationCalculator'
import { recordToolUsage } from '../../utils/recentTools'

export default function ResignationPage() {
  useEffect(() => {
    document.title = '퇴사 정산 계산기 · 생활계산소'
    recordToolUsage('resignation')
  }, [])

  return <ResignationCalculator />
}
