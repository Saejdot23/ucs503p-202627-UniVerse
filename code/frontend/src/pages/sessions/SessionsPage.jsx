import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { sessionsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'
import { StarPicker } from '../../components/ui/StarRating'

const STATUS_COLORS = {
  pending: '#e5a020',
  accepted: '#2E86AB',
  scheduled: '#2E86AB',
  completed: '#98c379',
  rejected: '#e06c75',
  cancelled: '#888',
}

export default function SessionsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('learner')
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', tab],
    queryFn: () => sessionsApi.getMy({ role: tab }),
    select: (res) => res.data?.data,
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, action }) => sessionsApi.respond(id, action),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => sessionsApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const completeMutation = useMutation({
    mutationFn: (id) => sessionsApi.markComplete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const confirmMutation = useMutation({
    mutationFn: (id) => sessionsApi.confirmComplete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })

  const [ratingSession, setRatingSession] = useState(null)
  const [ratingStars, setRatingStars] = useState(0)
  const rateMutation = useMutation({
    mutationFn: ({ id, stars }) => sessionsApi.rate(id, stars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      setRatingSession(null)
      setRatingStars(0)
    },
  })

  if (isLoading) return <PageLoader />

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--warm-cream)', marginBottom: 24 }}>My Sessions</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[['learner', 'As Learner'], ['mentor', 'As Mentor']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)} style={{
            background: 'none', border: 'none', padding: '10px 20px',
            borderBottom: tab === val ? '2px solid var(--plum)' : '2px solid transparent',
            color: tab === val ? 'var(--warm-cream)' : 'var(--text-muted)',
            fontSize: 14, fontFamily: 'var(--font-sans)', cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {!sessions?.length ? (
        <EmptyState message={`No sessions ${tab === 'learner' ? 'as a learner' : 'as a mentor'} yet.`} icon="📅" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sessions.map(session => {
            const isMentor = tab === 'mentor'
            const other = isMentor ? session.learner : session.mentor
            const myConfirmed = isMentor ? session.mentorConfirmed : session.learnerConfirmed
            const otherConfirmed = isMentor ? session.learnerConfirmed : session.mentorConfirmed
            const alreadyRated = isMentor ? session.mentorRated : session.learnerRated

            return (
              <div key={session._id} className="card" style={{ borderLeft: `3px solid ${STATUS_COLORS[session.status] || 'var(--border)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
                  <Avatar src={other?.avatar} name={other?.fullName} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{other?.fullName}</p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{other?.username}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 2,
                        background: `${STATUS_COLORS[session.status]}22`,
                        color: STATUS_COLORS[session.status],
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>{session.status}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                      Skill: <strong style={{ color: 'var(--warm-cream)', textTransform: 'capitalize' }}>{session.skill?.name || '—'}</strong>
                      {session.mode ? ` · ${session.mode}` : ''}
                      {session.scheduledDate ? ` · ${new Date(session.scheduledDate).toLocaleDateString()}` : ''}
                    </p>
                    {session.status === 'completed' && (myConfirmed || otherConfirmed) && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {myConfirmed ? '✓ You confirmed' : ''}
                        {myConfirmed && otherConfirmed ? ' · ' : ''}
                        {otherConfirmed ? `✓ ${other?.fullName?.split(' ')[0]} confirmed` : ''}
                      </p>
                    )}
                    {['accepted', 'scheduled'].includes(session.status) && (myConfirmed || otherConfirmed) && (
                      <p style={{ fontSize: 11, color: '#e5a020', marginTop: 4 }}>
                        {myConfirmed ? '✓ You marked complete' : '⏳ Waiting for your confirmation'}
                        {otherConfirmed && !myConfirmed ? ` · ${other?.fullName?.split(' ')[0]} has confirmed` : ''}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* View detail */}
                    <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
                      onClick={() => navigate(`/sessions/${session._id}`)}>
                      Details
                    </button>

                    {/* Mentor: respond to pending */}
                    {isMentor && session.status === 'pending' && (
                      <>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}
                          onClick={() => respondMutation.mutate({ id: session._id, action: 'accept' })}
                          disabled={respondMutation.isPending}>Accept</button>
                        <button className="btn btn-danger" style={{ fontSize: 12, padding: '6px 12px' }}
                          onClick={() => respondMutation.mutate({ id: session._id, action: 'reject' })}
                          disabled={respondMutation.isPending}>Reject</button>
                      </>
                    )}

                    {/* Cancel */}
                    {['pending', 'accepted', 'scheduled'].includes(session.status) && (
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => window.confirm('Cancel this session?') && cancelMutation.mutate(session._id)}
                        disabled={cancelMutation.isPending}>Cancel</button>
                    )}

                    {/* Mark complete */}
                    {['accepted', 'scheduled'].includes(session.status) && !myConfirmed && (
                      <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => completeMutation.mutate(session._id)}
                        disabled={completeMutation.isPending}>
                        {completeMutation.isPending ? <LoadingSpinner size={12} /> : 'Mark Complete'}
                      </button>
                    )}

                    {/* Confirm (when other has already confirmed) */}
                    {['accepted', 'scheduled'].includes(session.status) && !myConfirmed && otherConfirmed && (
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => confirmMutation.mutate(session._id)}
                        disabled={confirmMutation.isPending}>
                        {confirmMutation.isPending ? <LoadingSpinner size={12} /> : '✓ Confirm Complete'}
                      </button>
                    )}

                    {/* Rate */}
                    {session.status === 'completed' && !alreadyRated && (
                      <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}
                        onClick={() => setRatingSession(session)}>Rate</button>
                    )}
                    {session.status === 'completed' && alreadyRated && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', padding: '6px 0' }}>Rated ✓</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rating modal */}
      {ratingSession && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: 0 }}>Rate Session</h2>
              <button onClick={() => setRatingSession(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              How was your session for <strong style={{ color: 'var(--warm-cream)' }}>{ratingSession.skill?.name}</strong>?
            </p>
            <StarPicker value={ratingStars} onChange={setRatingStars} />
            {rateMutation.error && (
              <p style={{ color: '#e06c75', fontSize: 13, marginTop: 10 }}>
                {rateMutation.error.response?.data?.message || 'Failed to submit rating'}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => setRatingSession(null)} disabled={rateMutation.isPending}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => rateMutation.mutate({ id: ratingSession._id, stars: ratingStars })}
                disabled={!ratingStars || rateMutation.isPending}
              >
                {rateMutation.isPending ? <LoadingSpinner size={14} /> : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
