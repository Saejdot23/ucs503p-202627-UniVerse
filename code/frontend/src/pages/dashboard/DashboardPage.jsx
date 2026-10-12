import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../services/api'
import { StarDisplay } from '../../components/ui/StarRating'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: mySkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
    select: (res) => res.data?.data,
  })

  const teachCount = mySkills?.skillsToTeach?.length || 0
  const learnCount = mySkills?.skillsToLearn?.length || 0

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          Welcome back
        </p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, color: 'var(--warm-cream)', lineHeight: 1.1 }}>
          Hello, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          @{user?.username}
          {user?.branch && ` · ${user.branch}`}
          {user?.year ? ` · Year ${user.year}` : ''}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard
          label="Your Credits"
          value={user?.credits ?? 0}
          icon="◎"
          color="var(--muted-blue)"
          sub="Skill Swap balance"
        />
        <StatCard
          label="Skills"
          value={skillsLoading ? '—' : `${teachCount} Offered · ${learnCount} Wanted`}
          icon="⊕"
          color="var(--plum)"
          sub="Teach & learn list"
          valueSmall
        />
        <StatCard
          label="Rating"
          value={user?.averageRating ? user.averageRating.toFixed(1) : '—'}
          icon="★"
          color="#e5a020"
          sub={user?.totalRatings ? `${user.totalRatings} ratings` : 'No ratings yet'}
        />
      </div>

      {/* Two main areas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 40 }}>
        {/* Skill Swap */}
        <SectionCard
          color="var(--plum)"
          label="Skill Swap"
          title="Teach. Learn. Grow."
          desc="Exchange skills with peers using the credit system. Teach to earn, learn to grow."
          to="/skillswap"
          cta="Enter Skill Swap"
          icon={<svg width="32" height="32" viewBox="0 0 36 36" fill="none"><path d="M6 12 L30 12 M6 12 L12 6 M6 12 L12 18" stroke="var(--plum)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M30 24 L6 24 M30 24 L24 18 M30 24 L24 30" stroke="var(--muted-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          stats={[
            { label: 'Skills you teach', value: teachCount },
            { label: 'Skills you learn', value: learnCount },
          ]}
        />

        {/* Utility Channels */}
        <SectionCard
          color="var(--muted-blue)"
          label="Utility Channels"
          title="General · Borrow/Lend · Lost & Found"
          desc="Browse campus discussions, lend or borrow items, and help others find what they lost."
          to="/channels"
          cta="Explore Channels"
          icon={<svg width="32" height="32" viewBox="0 0 36 36" fill="none"><rect x="4" y="8" width="28" height="20" rx="2" stroke="var(--muted-blue)" strokeWidth="2"/><path d="M4 14 L32 14" stroke="var(--muted-blue)" strokeWidth="1.5" strokeDasharray="3 3"/><circle cx="10" cy="22" r="2" fill="var(--plum)"/><circle cx="18" cy="22" r="2" fill="var(--plum)" opacity="0.6"/><circle cx="26" cy="22" r="2" fill="var(--plum)" opacity="0.3"/></svg>}
          noCredits
        />
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <QuickAction to="/skillswap/learn" label="Find a Skill" icon="🔍" />
          <QuickAction to="/skillswap/teach" label="Offer a Skill" icon="🎓" />
          <QuickAction to="/channels/general" label="General Channel" icon="💬" />
          <QuickAction to="/channels/borrow-lend" label="Borrow / Lend" icon="📚" />
          <QuickAction to="/channels/lost-found" label="Lost & Found" icon="🔎" />
          <QuickAction to={`/profile/${user?.username}`} label="My Profile" icon="👤" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, sub, valueSmall }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 20, color }}>{icon}</span>
      </div>
      <div style={{ fontSize: valueSmall ? 20 : 32, fontWeight: 600, fontFamily: valueSmall ? 'var(--font-sans)' : 'var(--font-serif)', color: 'var(--warm-cream)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}

function SectionCard({ color, label, title, desc, to, cta, icon, stats, noCredits }) {
  return (
    <div className="card" style={{ borderTop: `2px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <span style={{ fontSize: 11, color, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
      </div>
      <div>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', marginBottom: 8, fontWeight: 600 }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      </div>
      {stats && (
        <div style={{ display: 'flex', gap: 20 }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--warm-cream)', fontFamily: 'var(--font-serif)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {noCredits && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          No credits used in Utility Channels
        </p>
      )}
      <Link to={to} className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
        {cta} →
      </Link>
    </div>
  )
}

function QuickAction({ to, label, icon }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-secondary)',
        fontSize: 13,
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(232,210,174,0.25)'
        e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-secondary)'
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
