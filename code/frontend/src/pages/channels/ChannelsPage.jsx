import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ChannelFeed from './ChannelFeed'

const CHANNELS = [
  {
    id: 'general',
    label: 'General',
    emoji: '💬',
    desc: 'College discussions, questions, advice, and campus conversations.',
    color: 'var(--muted-blue)',
    features: ['upvote / downvote', 'nested comments', 'save / share / report'],
  },
  {
    id: 'borrow_lend',
    label: 'Borrow / Lend',
    emoji: '📚',
    desc: 'Lend or borrow campus resources — books, lab coats, calculators.',
    color: 'var(--plum)',
    features: ['LEND / BORROW tags', 'photos', 'mark resolved'],
  },
  {
    id: 'lost_found',
    label: 'Lost & Found',
    emoji: '🔎',
    desc: 'Report a lost item or share what you found on campus.',
    color: '#e5a020',
    features: ['LOST / FOUND tags', 'location', 'photos', 'mark resolved'],
  },
]

export default function ChannelsPage() {
  const { channel } = useParams()
  const navigate = useNavigate()

  const activeChannel = CHANNELS.find(c => c.id === channel)

  if (activeChannel) {
    return (
      <ChannelFeed
        channel={activeChannel}
        onBack={() => navigate('/channels')}
      />
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Utility Channels</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 5vw, 40px)', color: 'var(--warm-cream)', fontWeight: 600, marginBottom: 10 }}>
          Campus Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 500 }}>
          Three dedicated channels for campus life. No credits involved — just students helping students.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CHANNELS.map(ch => (
          <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/channels/${ch.id}`)} />
        ))}
      </div>

      <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(232,210,174,0.04)', borderRadius: 8, border: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          These channels are fixed. New channels cannot be created by users.
          Credits from Skill Swap are not used here.
        </p>
      </div>
    </div>
  )
}

function ChannelCard({ channel, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className="card"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 20, cursor: 'pointer',
        borderLeft: `3px solid ${channel.color}`,
        transition: 'transform 0.15s, border-color 0.2s',
        transform: hov ? 'translateX(3px)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ fontSize: 32, lineHeight: 1 }}>{channel.emoji}</div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: '0 0 6px', fontWeight: 600 }}>
          {channel.label}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{channel.desc}</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {channel.features.map(f => (
            <span key={f} style={{ fontSize: 11, color: channel.color, background: `${channel.color}18`, padding: '2px 8px', borderRadius: 2, letterSpacing: '0.04em' }}>
              {f}
            </span>
          ))}
        </div>
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: 20 }}>→</span>
    </div>
  )
}
