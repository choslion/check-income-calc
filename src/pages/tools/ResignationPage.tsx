import { useEffect } from 'react'
import { ResignationCalculator } from '../../tools/resignation/ResignationCalculator'
import { recordToolUsage } from '../../utils/recentTools'

export default function ResignationPage() {
  useEffect(() => {
    recordToolUsage('resignation')
  }, [])

  return <ResignationCalculator />
}
