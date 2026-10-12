import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { skillsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import { StarDisplay } from '../../components/ui/StarRating'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

export default function LearnMode({ onBack }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['learnDiscovery', q, category, page],
    queryFn: () => skillsApi.learnDiscovery({ q, category, page, limit: 15 }),
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
            I Want to Learn
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Skills most offered by mentors · Click a mentor to view their profile
          </p>
        </div>
      </div>

      {/* Search + category filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input
            className="input"
            placeholder="Search skills or mentors…"
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
          }}
        >
          <option value="">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Non-tech">Non-Tech</option>
        </select>
      </div>

      {/* Tabs (Skills active by default) */}
      <div
        style={{
          display: 'flex',
          marginBottom: 20,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 20px',
            borderBottom: '2px solid var(--muted-blue)',
            color: 'var(--warm-cream)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
          }}
        >
          Skills
        </button>
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 20px',
            borderBottom: '2px solid transparent',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
          }}
        >
          Users
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : !data?.skills?.length ? (
        <EmptyState message="No skills found." icon="◎" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {data.skills.map((skill) => (
            <SkillLearnCard key={skill._id} skill={skill} navigate={navigate} />
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

function SkillLearnCard({ skill, navigate }) {
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
            <strong style={{ color: 'var(--muted-blue)' }}>
              {skill.demandToTeach}
            </strong>{' '}
            mentor{skill.demandToTeach !== 1 ? 's' : ''} can teach this
          </p>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 18, flexShrink: 0 }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Mentor list — each row navigates to the mentor's profile */}
      {expanded && (
        <div
          style={{
            marginTop: 16,
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}
        >
          {skill.mentors?.length > 0 ? (
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
                Available Mentors · Click to view profile
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {skill.mentors.slice(0, 5).map((mentor) => (
                  <MentorRow
                    key={mentor._id}
                    mentor={mentor}
                    onClick={() => navigate(`/profile/${mentor.username}`)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              No mentors listed yet for this skill.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function MentorRow({ mentor, onClick }) {
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
      <Avatar src={mentor.avatar} name={mentor.fullName} size={34} />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-primary)',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {mentor.fullName}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
          @{mentor.username}
          {mentor.branch ? ` · ${mentor.branch}` : ''}
          {mentor.year ? ` · Year ${mentor.year}` : ''}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {mentor.averageRating > 0 ? (
          <div style={{ textAlign: 'right' }}>
            <StarDisplay rating={mentor.averageRating} size={12} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              {mentor.averageRating.toFixed(1)}
            </p>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>New</span>
        )}
        <span
          style={{
            fontSize: 12,
            color: hov ? 'var(--muted-blue)' : 'var(--text-muted)',
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
        >
          View Profile →
        </span>
      </div>
    </div>
  )
}