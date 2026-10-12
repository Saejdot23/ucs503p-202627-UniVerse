export function StarDisplay({ rating = 0, size = 14 }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5

  return (
    <span className="stars" style={{ fontSize: size }}>
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  )
}

export function StarPicker({ value, onChange, disabled = false }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 28,
            cursor: disabled ? 'default' : 'pointer',
            color: star <= value ? '#e5a020' : 'var(--text-muted)',
            transition: 'color 0.15s',
            padding: '2px 4px',
          }}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
