import { useEffect } from 'react'
import { DateCalculatorTool } from '../../tools/date/DateCalculatorTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function DatePage() {
  useEffect(() => {
    document.title = '날짜 계산기 · 생활계산소'
    recordToolUsage('date')
  }, [])

  return <DateCalculatorTool />
}
