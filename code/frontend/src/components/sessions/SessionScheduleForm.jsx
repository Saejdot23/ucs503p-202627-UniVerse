/**
 * SessionScheduleForm Component
 * Allows participants to fill in session scheduling details.
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionScheduleApi } from '../../services/sessionScheduleApi'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function SessionScheduleForm({ session, onClose, onSuccess }) {
  const qc = useQueryClient()
  const [formData, setFormData] = useState({
    scheduledDate: session.scheduledDate ? new Date(session.scheduledDate).toISOString().split('T')[0] : '',
    scheduledTime: session.scheduledTime || '',
    durationMinutes: session.durationMinutes || 60,
    mode: session.mode || 'Online',
    meetingLink: session.meetingLink || '',
  })
  const [error, setError] = useState(null)

  const updateMutation = useMutation({
    mutationFn: (data) => sessionScheduleApi.update(session._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session', session._id] })
      qc.invalidateQueries({ queryKey: ['sessions'] })
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update schedule')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    // Validate required fields
    if (!formData.scheduledDate) {
      setError('Please select a date')
      return
    }
    if (!formData.scheduledTime) {
      setError('Please select a time')
      return
    }
    if (!formData.mode) {
      setError('Please select a mode')
      return
    }

    updateMutation.mutate(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: 0 }}>
            Schedule Session
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
          Fill in the details to schedule your session for <strong style={{ color: 'var(--warm-cream)' }}>{session.skill?.name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Date *
            </label>
            <input
              type="date"
              className="input"
              value={formData.scheduledDate}
              onChange={(e) => handleChange('scheduledDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          {/* Time */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Time (24-hour format) *
            </label>
            <input
              type="time"
              className="input"
              value={formData.scheduledTime}
              onChange={(e) => handleChange('scheduledTime', e.target.value)}
              required
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Duration (minutes)
            </label>
            <select
              className="input"
              value={formData.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', Number(e.target.value))}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>

          {/* Mode */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Mode *
            </label>
            <select
              className="input"
              value={formData.mode}
              onChange={(e) => handleChange('mode', e.target.value)}
              required
            >
              <option value="">Select mode...</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          {/* Meeting Link */}
          {formData.mode === 'Online' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Meeting Link (optional)
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://meet.google.com/..."
                value={formData.meetingLink}
                onChange={(e) => handleChange('meetingLink', e.target.value)}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Google Meet, Zoom, or any video conferencing link
              </p>
            </div>
          )}

          {error && (
            <p style={{ color: '#e06c75', fontSize: 13, marginBottom: 16 }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? <LoadingSpinner size={14} /> : 'Save Schedule'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, padding: 12, background: 'rgba(46,134,171,0.08)', borderRadius: 4, border: '1px solid rgba(46,134,171,0.2)' }}>
          <p style={{ margin: 0, fontSize: 11, color: 'var(--muted-blue)', lineHeight: 1.6 }}>
            💡 <strong>Tip:</strong> Both participants can update these details. The other participant will be notified of any changes.
          </p>
        </div>
      </div>
    </div>
  )
}
