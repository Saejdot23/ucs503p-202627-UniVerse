import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

export default function TeachMode({ onBack }) {
  const [searchTab, setSearchTab] = useState('skills')
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['teachDiscovery', q, category, page],
    queryFn: () => skillsApi.teachDiscovery({ q, category, page, limit: 15 }),
    select: (res) => res.data?.data,
    keepPreviousData: true,
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>
          ← Back
        </button>
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 26,
              color: 'var(--warm-cream)',
              margin: 0,
            }}
          >
            I Want to Teach
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Skills most in demand to be learned · Click a student to view their profile
          </p>
        </div>
      </div>

      {/* Search + category filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            className="input"
            placeholder="Search skills or students…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            padding: '9px 12px',
            fontSize: 13,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Non-tech">Non-Tech</option>
        </select>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
        }}
      >
        {['skills', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSearchTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px 20px',
              borderBottom:
                searchTab === tab
                  ? '2px solid var(--plum)'
                  : '2px solid transparent',
              color:
                searchTab === tab ? 'var(--warm-cream)' : 'var(--text-muted)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              letterSpacing: '0.04em',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : !data?.skills?.length ? (
        <EmptyState message="No skills found matching your search." icon="⊕" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.skills.map((skill) => (
            <SkillTeachCard
              key={skill._id}
              skill={skill}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 28,
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
            {page} / {data.totalPages}
          </span>
          <button
            className="btn btn-ghost"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function SkillTeachCard({ skill, navigate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      {/* Skill header — click to expand/collapse */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 6,
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
                color: 'var(--warm-cream)',
                margin: 0,
                textTransform: 'capitalize',
              }}
            >
              {skill.name}
            </h3>
            <span
              className={`badge badge-${
                skill.category === 'Tech' ? 'tech' : 'nontech'
              }`}
            >
              {skill.category}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--plum)' }}>{skill.demandToLearn}</strong>{' '}
            student{skill.demandToLearn !== 1 ? 's' : ''} want to learn this
          </p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 18, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Learner list — each row navigates to the learner's profile */}
      {expanded && (
        <div
          style={{
            marginTop: 16,
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}
        >
          {skill.learners?.length > 0 ? (
            <>
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Students wanting to learn · Click to view profile
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {skill.learners.slice(0, 5).map((learner) => (
                  <UserRow
                    key={learner._id}
                    user={learner}
                    accentColor="var(--plum)"
                    onClick={() => navigate(`/profile/${learner.username}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No students listed yet for this skill.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function UserRow({ user, onClick, accentColor }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 'var(--radius-sm)',
        background: hov ? 'rgba(232,210,174,0.06)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(232,210,174,0.14)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      <Avatar src={user.avatar} name={user.fullName} size={34} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {user.fullName}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          @{user.username}
          {user.branch ? ` · ${user.branch}` : ''}
          {user.year ? ` · Year ${user.year}` : ''}
        </p>
      </div>
      <span
        style={{
          fontSize: 12,
          color: hov ? accentColor : 'var(--text-muted)',
          transition: 'color 0.15s',
          flexShrink: 0,
        }}
      >
        View Profile →
      </span>
    </div>
  )
}
