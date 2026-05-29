import { useTheme } from '../context/ThemeContext'

export function ThemeSwitch() {
  const { theme, toggle } = useTheme()
  const isBinance = theme === 'binance'

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all"
      style={{
        backgroundColor: 'var(--surface-card)',
        color: 'var(--on-dark-mute)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-pill)',
      }}
      aria-label="테마 전환"
    >
      {/* 트랙 */}
      <div
        className="relative w-9 h-5 transition-colors duration-200"
        style={{
          backgroundColor: isBinance ? '#fcd535' : '#494fdf',
          borderRadius: '9999px',
        }}
      >
        {/* 썸 */}
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
          style={{
            backgroundColor: isBinance ? '#181a20' : '#ffffff',
            left: isBinance ? '2px' : 'calc(100% - 18px)',
          }}
        />
      </div>
      <span style={{ color: 'var(--on-dark)' }}>
        {isBinance ? 'Binance' : 'Revolut'}
      </span>
    </button>
  )
}
