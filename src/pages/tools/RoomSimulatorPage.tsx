import { useEffect } from 'react'
import { RoomSimulatorTool } from '../../tools/room-simulator/RoomSimulatorTool'
import { recordToolUsage } from '../../utils/recentTools'

export default function RoomSimulatorPage() {
  useEffect(() => {
    recordToolUsage('room-simulator')
  }, [])

  return <RoomSimulatorTool />
}
