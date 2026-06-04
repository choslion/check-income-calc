import { useEffect } from 'react'
import { RoomSimulatorTool } from '../../tools/room-simulator/RoomSimulatorTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function RoomSimulatorPage() {
  useEffect(() => {
    document.title = '방 가구 시뮬레이터 · 생활계산소'
    recordToolUsage('room-simulator')
  }, [])

  return <RoomSimulatorTool />
}
