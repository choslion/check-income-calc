import type { ReactNode } from 'react'
import { AppHeader } from './AppHeader'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--canvas)' }}>
      <AppHeader />
      <main>{children}</main>
    </div>
  )
}
