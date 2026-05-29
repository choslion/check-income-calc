const ADS_ENABLED = import.meta.env.VITE_ENABLE_ADS === 'true'

export function AdBannerSlot() {
  if (!ADS_ENABLED) return null

  return (
    <div
      className="w-full flex items-center justify-center text-xs"
      style={{
        height: '60px',
        backgroundColor: 'var(--surface-card)',
        border: '1px dashed var(--hairline)',
        borderRadius: 'var(--radius-card)',
        color: 'var(--muted)',
      }}
    >
      광고 영역
    </div>
  )
}
