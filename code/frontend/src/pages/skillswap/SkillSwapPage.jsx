import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TeachMode from './TeachMode'
import LearnMode from './LearnMode'
import MySkillsPanel from './MySkillsPanel'

export default function SkillSwapPage() {
  const [mode, setMode] = useState(null) // null | 'teach' | 'learn'
  const [showMySkills, setShowMySkills] = useState(false)

  if (mode === 'teach') return <TeachMode onBack={() => setMode(null)} />
  if (mode === 'learn') return <LearnMode onBack={() => setMode(null)} />

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p style={{ fontSize: 11, color: 'var(--plum)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10 }}>Skill Swap</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 5vw, 48px)', color: 'var(--warm-cream)', fontWeight: 600, marginBottom: 14 }}>
          What would you like to do?
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
          Earn credits by teaching what you know. Spend credits learning something new.
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        <ModeCard
          color="var(--plum)"
          icon={<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M8 16 L32 16 M8 16 L15 9 M8 16 L15 23" stroke="var(--plum)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          label="I Want to Teach"
          title="Share your expertise"
          desc="Browse students who want to learn skills you know. Connect, schedule a session, and earn +10 credits."
          highlight="+10 credits per session"
          highlightColor="var(--plum)"
          cta="Start Teaching"
          onClick={() => setMode('teach')}
        />
        <ModeCard
          color="var(--muted-blue)"
          icon={<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><path d="M32 24 L8 24 M32 24 L25 17 M32 24 L25 31" stroke="var(--muted-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          label="I Want to Learn"
          title="Find a mentor"
          desc="Search for skills you want to acquire. Find rated mentors, check availability, and book a session."
          highlight="−5 credits per session"
          highlightColor="var(--muted-blue)"
          cta="Find a Mentor"
          onClick={() => setMode('learn')}
        />
      </div>

      {/* My Skills */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="btn btn-ghost"
          onClick={() => setShowMySkills(!showMySkills)}
          style={{ fontSize: 13 }}
        >
          {showMySkills ? '▲ Hide' : '▼ Manage'} My Skill Lists
        </button>
      </div>

      {showMySkills && (
        <div style={{ marginTop: 24 }}>
          <MySkillsPanel />
        </div>
      )}
    </div>
  )
}

function ModeCard({ color, icon, label, title, desc, highlight, highlightColor, cta, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className="card"
      style={{
        borderTop: `2px solid ${color}`,
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.15s',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <div style={{ marginBottom: 16 }}>{icon}</div>
      <p style={{ fontSize: 11, color, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--warm-cream)', marginBottom: 10, fontWeight: 600 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
      <div style={{ padding: '6px 12px', background: `${highlightColor}18`, borderRadius: 2, display: 'inline-block', marginBottom: 20 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: highlightColor }}>{highlight}</span>
      </div>
      <br />
      <button className="btn btn-secondary" style={{ fontSize: 13, borderColor: color, color: color }}>
        {cta} →
      </button>
    </div>
  )
}
