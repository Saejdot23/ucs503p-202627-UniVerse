export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      gap: 16,
      textAlign: 'center',
    }}>
      <span style={{ fontSize: 32 }}>⚠</span>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 360 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-ghost" onClick={onRetry} style={{ marginTop: 8 }}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message = 'Nothing here yet.', icon = '◎', action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      gap: 14,
      textAlign: 'center',
    }}>
      <span style={{ fontSize: 28, color: 'var(--text-muted)' }}>{icon}</span>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>
      {action}
    </div>
  )
}
