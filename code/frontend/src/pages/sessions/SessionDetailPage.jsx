/**
 * SessionDetailPageEnhanced
 * Enhanced version of SessionDetailPage with scheduling functionality.
 * Drop-in replacement for SessionDetailPage.jsx
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { sessionsApi, chatApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/ui/Avatar'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'
import SessionScheduleForm from '../../components/sessions/SessionScheduleForm'

const STATUS_COLOR = {
  pending: '#e5a020',
  accepted: '#2E86AB',
  scheduled: '#2E86AB',
  completed: '#98c379',
  rejected: '#e06c75',
  cancelled: '#888',
}

export default function SessionDetailPageEnhanced() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session', id],
    queryFn: () => sessionsApi.get(id),
    select: (res) => res.data?.data,
  })

  if (isLoading) return <PageLoader />
  if (isError || !session) return <ErrorState message="Session not found." />

  const isMentor = session.mentor?._id?.toString() === user?._id?.toString()
  const other = isMentor ? session.learner : session.mentor

  const openChat = async () => {
    try {
      const res = await chatApi.getOrCreateConversation(other._id)
      navigate(`/chat/${res.data?.data?._id}`)
    } catch {}
  }

  const color = STATUS_COLOR[session.status] || 'var(--border)'

  // Show schedule button for accepted or scheduled sessions
  const canSchedule = ['accepted', 'scheduled'].includes(session.status)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <button className="btn btn-ghost" onClick={() => navigate('/sessions')} style={{ marginBottom: 20, fontSize: 13 }}>
        ← Back to Sessions
      </button>
      
      <div className="card" style={{ borderTop: `2px solid ${color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>
              {session.status}
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--warm-cream)', margin: '4px 0 0' }}>
              {session.skill?.name || 'Session'}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canSchedule && (
              <button 
                className="btn btn-secondary" 
                onClick={() => setScheduleModalOpen(true)} 
                style={{ fontSize: 13 }}
              >
                📅 {session.scheduledDate ? 'Update' : 'Set'} Schedule
              </button>
            )}
            <button className="btn btn-ghost" onClick={openChat} style={{ fontSize: 13 }}>
              💬 Chat
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Avatar src={other?.avatar} name={other?.fullName} size={44} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{other?.fullName}</p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              @{other?.username} · {isMentor ? 'Learner' : 'Mentor'}
            </p>
          </div>
        </div>

        {/* Schedule Details */}
        {!session.scheduledDate && canSchedule && (
          <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(229,160,32,0.08)', borderRadius: 4, border: '1px solid rgba(229,160,32,0.3)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#e5a020' }}>
              ⚠️ Session details not set yet. Click "Set Schedule" to add date, time, and meeting details.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'Mode', value: session.mode || '—' },
            { label: 'Scheduled', value: session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString() : '—' },
            { label: 'Time', value: session.scheduledTime || '—' },
            { label: 'Duration', value: session.durationMinutes ? `${session.durationMinutes} min` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
            </div>
          ))}
        </div>

        {session.meetingLink && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(46,134,171,0.1)', borderRadius: 4, border: '1px solid rgba(46,134,171,0.3)' }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted-blue)' }}>Meeting Link</p>
            <a
              href={session.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--warm-cream)', fontSize: 13, wordBreak: 'break-all' }}
            >
              {session.meetingLink}
            </a>
          </div>
        )}

        {session.cancellationReason && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(224,108,117,0.08)', borderRadius: 4, border: '1px solid rgba(224,108,117,0.2)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#e06c75' }}>Cancellation Reason</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{session.cancellationReason}</p>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleModalOpen && (
        <SessionScheduleForm
          session={session}
          onClose={() => setScheduleModalOpen(false)}
          onSuccess={() => {
            // Modal will auto-close after invalidating queries
          }}
        />
      )}
    </div>
  )
}
