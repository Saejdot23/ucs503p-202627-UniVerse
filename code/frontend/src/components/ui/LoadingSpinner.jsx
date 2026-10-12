export default function LoadingSpinner({ size = 20, color = 'var(--muted-blue)' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--near-black)',
    }}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <LoadingSpinner size={36} />
        <span style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>
          Loading UniVerse…
        </span>
      </div>
    </div>
  )
}
