import { useState, useEffect } from 'react'
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
  const [searchTab, setSearchTab] = useState('skills')
  const [debouncedQ, setDebouncedQ] = useState('')
  const navigate = useNavigate()

  // Debounce the search query by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q)
    }, 350)
    return () => clearTimeout(timer)
  }, [q])

  // Reset page when tab changes
  useEffect(() => {
    setPage(1)
  }, [searchTab])

  const { data, isLoading } = useQuery({
    queryKey: ['learnDiscovery', q, category, page],
    queryFn: () => skillsApi.learnDiscovery({ q, category, page, limit: 15 }),
    select: (res) => res.data?.data,
    keepPreviousData: true,
  })

  // Users tab query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['learnDiscoveryUsers', debouncedQ, page],
    queryFn: () => skillsApi.learnDiscoveryUsers({ q: debouncedQ, page, limit: 15 }),
    select: (res) => res.data?.data,
    keepPreviousData: true,
    enabled: searchTab === 'users',
  })

  const isLoading_ = searchTab === 'skills' ? isLoading : usersLoading
  const currentData = searchTab === 'skills' ? data : usersData

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
            display: searchTab === 'users' ? 'none' : 'block',
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
                  ? '2px solid var(--muted-blue)'
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
      {isLoading_ ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : searchTab === 'skills' ? (
        !data?.skills?.length ? (
          <EmptyState message="No skills found." icon="◎" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.skills.map((skill) => (
              <SkillLearnCard key={skill._id} skill={skill} navigate={navigate} />
            ))}
          </div>
        )
      ) : (
        // Users tab
        !usersData?.users?.length ? (
          <EmptyState message="No mentors found." icon="◎" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {usersData.users.map((user) => (
              <UserDiscoveryCard
                key={user._id}
                user={user}
                onClick={() => navigate(`/profile/${user.username}`)}
                accentColor="var(--muted-blue)"
                skillLabel={`Offers ${user.skillCount || 0} skill${user.skillCount !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {searchTab === 'skills' ? (
        data?.totalPages > 1 && (
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
        )
      ) : (
        usersData?.totalPages > 1 && (
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
              {page} / {usersData.totalPages}
            </span>
            <button
              className="btn btn-ghost"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= usersData.totalPages}
            >
              Next →
            </button>
          </div>
        )
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

function UserDiscoveryCard({ user, onClick, accentColor, skillLabel }) {
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
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        background: hov ? 'rgba(232,210,174,0.06)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(232,210,174,0.14)' : 'transparent'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      <Avatar src={user.avatar} name={user.fullName} size={38} />
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
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {skillLabel}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {user.averageRating > 0 ? (
          <div style={{ textAlign: 'right' }}>
            <StarDisplay rating={user.averageRating} size={12} />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
              {user.averageRating.toFixed(1)}
            </p>
          </div>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>New</span>
        )}
        <span
          style={{
            fontSize: 12,
            color: hov ? accentColor : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
        >
          View Profile →
        </span>
      </div>
    </div>
  )
}
