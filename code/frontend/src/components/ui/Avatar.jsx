export default function Avatar({ src, name = '?', size = 36, style = {} }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="avatar"
        style={{ width: size, height: size, ...style }}
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: 'var(--plum)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        color: 'var(--warm-cream)',
        fontFamily: 'var(--font-serif)',
        ...style,
      }}
    >
      {initials}
    </div>
  )
}
