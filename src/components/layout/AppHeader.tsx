import { Link, useLocation } from 'react-router-dom'

export function AppHeader() {
  const { pathname } = useLocation()

  function navStyle(path: string): React.CSSProperties {
    const active = pathname === path || (path === '/tools' && pathname.startsWith('/tools'))
    return {
      color: active ? 'var(--primary)' : 'var(--on-dark-mute)',
      fontWeight: active ? 600 : 400,
      fontSize: '14px',
      textDecoration: 'none',
      transition: 'color 0.15s',
    }
  }

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ backgroundColor: 'var(--canvas)', borderBottom: '1px solid var(--hairline)' }}
    >
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-bold text-base tracking-tight"
          style={{ color: 'var(--on-dark)', textDecoration: 'none', letterSpacing: '-0.3px' }}
        >
          생활계산소
        </Link>
        <nav className="flex items-center gap-5">
          <Link to="/" style={navStyle('/')}>홈</Link>
          <Link to="/tools" style={navStyle('/tools')}>도구</Link>
        </nav>
      </div>
    </header>
  )
}
