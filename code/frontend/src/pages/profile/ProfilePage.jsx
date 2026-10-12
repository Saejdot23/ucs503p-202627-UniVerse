import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { usersApi, authApi, chatApi, sessionsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import { StarDisplay } from '../../components/ui/StarRating'
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner'
import ErrorState from '../../components/ui/ErrorState'

export default function ProfilePage() {
  const { username } = useParams()
  const { user: authUser, refreshUser } = useAuth()
  const qc = useQueryClient()
  const isOwn = authUser?.username === username

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username),
    select: (res) => res.data?.data,
  })

  if (isLoading) return <PageLoader />
  if (isError || !profile) return <ErrorState message="Profile not found." />

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <ProfileHeader profile={profile} isOwn={isOwn} onUpdated={() => {
        qc.invalidateQueries(['profile', username])
        if (isOwn) refreshUser()
      }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
        <SkillsCard title="Skills I Teach" skills={profile.skillsToTeach} color="var(--plum)" />
        <SkillsCard title="Skills I Want to Learn" skills={profile.skillsToLearn} color="var(--muted-blue)" />
      </div>
      <StatsRow profile={profile} />
    </div>
  )
}

function ProfileHeader({ profile, isOwn, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)

  return (
    <div className="card" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar src={profile.avatar} name={profile.fullName} size={90} />
        {isOwn && (
          <button
            onClick={() => setAvatarModalOpen(true)}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--plum)', border: 'none', borderRadius: '50%',
              width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--warm-cream)', fontSize: 12,
            }}
            title="Change avatar"
          >✎</button>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--warm-cream)', fontWeight: 600, margin: 0 }}>
            {profile.fullName}
          </h1>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{profile.username}</span>
        </div>

        {profile.branch && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 4 }}>
            {profile.degree || 'B.Tech'} · {profile.branch}
            {profile.year ? ` · Year ${profile.year}` : ''}
            {profile.CGPA ? ` · CGPA ${profile.CGPA}` : ''}
          </p>
        )}

        {profile.averageRating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <StarDisplay rating={profile.averageRating} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {profile.averageRating.toFixed(1)} ({profile.totalRatings} ratings)
            </span>
          </div>
        )}

        {profile.bio && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, maxWidth: 500 }}>{profile.bio}</p>
        )}

        {isOwn && (
          <button className="btn btn-ghost" style={{ marginTop: 12, fontSize: 12 }} onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editing && <EditProfileModal profile={profile} onClose={() => setEditing(false)} onSaved={onUpdated} />}
      {avatarModalOpen && <AvatarModal onClose={() => setAvatarModalOpen(false)} onSaved={onUpdated} />}
      {!isOwn && <ProfileActions profile={profile} />}
    </div>
  )
}

function StatsRow({ profile }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginTop: 20 }}>
      {[
        { label: 'Credits', value: profile.credits ?? 0 },
        { label: 'Sessions', value: profile.sessionsCompleted ?? 0 },
        { label: 'Teaches', value: profile.skillsToTeach?.length ?? 0 },
        { label: 'Learning', value: profile.skillsToLearn?.length ?? 0 },
      ].map(s => (
        <div key={s.label} className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warm-cream)', fontFamily: 'var(--font-serif)' }}>{s.value}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

function SkillsCard({ title, skills = [], color }) {
  return (
    <div className="card">
      <h3 style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>{title}</h3>
      {skills.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>None added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map(s => (
            <span key={s._id} style={{
              padding: '4px 10px', borderRadius: 2, fontSize: 12,
              background: color === 'var(--plum)' ? 'rgba(91,44,77,0.2)' : 'rgba(46,134,171,0.15)',
              color: color === 'var(--plum)' ? '#c07db0' : 'var(--muted-blue)',
              border: `1px solid ${color === 'var(--plum)' ? 'rgba(91,44,77,0.3)' : 'rgba(46,134,171,0.25)'}`,
            }}>
              {s.name}
              <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.6 }}>{s.category === 'Tech' ? '⚙' : '◈'}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    bio: profile.bio || '',
    degree: profile.degree || '',
    branch: profile.branch || '',
    year: profile.year || '',
    EndYear: profile.EndYear || '',
    CGPA: profile.CGPA || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await authApi.updateProfile(form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <ModalHeader title="Edit Profile" onClose={onClose} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full Name" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
          <Field label="Bio" value={form.bio} onChange={v => setForm(f => ({ ...f, bio: v }))} multiline />
          <Field label="Degree" value={form.degree} onChange={v => setForm(f => ({ ...f, degree: v }))} placeholder="e.g. B.Tech" />
          <Field label="Branch" value={form.branch} onChange={v => setForm(f => ({ ...f, branch: v }))} placeholder="e.g. Computer Engineering" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Year" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} type="number" placeholder="1–6" />
            <Field label="End Year" value={form.EndYear} onChange={v => setForm(f => ({ ...f, EndYear: v }))} type="number" placeholder="e.g. 2027" />
            <Field label="CGPA" value={form.CGPA} onChange={v => setForm(f => ({ ...f, CGPA: v }))} type="number" placeholder="0–10" />
          </div>
        </div>
        {error && <p style={{ color: '#e06c75', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <LoadingSpinner size={14} /> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarModal({ onClose, onSaved }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('File must be under 5 MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError(null)
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await authApi.updateAvatar(fd)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: 380 }}>
        <ModalHeader title="Change Avatar" onClose={onClose} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--surface-2)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 28 }}>
              ＋
            </div>
          )}
          <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFile} style={{ fontSize: 13, color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG or WEBP · Max 5 MB</p>
        </div>
        {error && <p style={{ color: '#e06c75', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="btn btn-primary" onClick={upload} disabled={!file || uploading}>
            {uploading ? <LoadingSpinner size={14} /> : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, multiline }) {
  const sharedStyle = { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', fontSize: 14, padding: '9px 12px', outline: 'none', width: '100%' }
  return (
    <div>
      <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...sharedStyle, resize: 'vertical' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={sharedStyle} />
      }
    </div>
  )
}

function ModalHeader({ title, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: 0 }}>{title}</h2>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
    </div>
  )
}

function ProfileActions({ profile }) {
  const navigate = useNavigate()
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [showSessionModal, setShowSessionModal] = useState(false)

  const startChat = async () => {
    setChatLoading(true)
    setChatError(null)
    try {
      const res = await chatApi.getOrCreateConversation(profile._id)
      const convoId = res.data?.data?._id
      if (convoId) navigate(`/chat/${convoId}`)
    } catch (err) {
      setChatError(err.response?.data?.message || 'Failed to open chat')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160, flexShrink: 0 }}>
      <button
        className="btn btn-primary"
        onClick={startChat}
        disabled={chatLoading}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {chatLoading ? <LoadingSpinner size={14} /> : '💬 Chat'}
      </button>
      <button
        className="btn btn-secondary"
        onClick={() => setShowSessionModal(true)}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        📅 Request Session
      </button>
      {chatError && <p style={{ fontSize: 12, color: '#e06c75', margin: 0 }}>{chatError}</p>}
      {showSessionModal && (
        <RequestSessionModal
          mentor={profile}
          onClose={() => setShowSessionModal(false)}
        />
      )}
    </div>
  )
}

function RequestSessionModal({ mentor, onClose }) {
  const [selectedSkillId, setSelectedSkillId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const skills = mentor.skillsToTeach || []

  const submit = async () => {
    if (!selectedSkillId && skills.length > 0) { setError('Please select a skill'); return }
    const skillId = selectedSkillId || (skills[0]?._id)
    if (!skillId) { setError('This user has no teachable skills listed. You can still send a connection request via Chat.'); return }
    setSubmitting(true)
    setError(null)
    try {
      await sessionsApi.request({ mentorId: mentor._id, skillId })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: 0 }}>Request Session</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
            <p style={{ color: 'var(--warm-cream)', fontSize: 15, marginBottom: 8 }}>Request sent!</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{mentor.fullName} will be notified.</p>
            <button className="btn btn-ghost" onClick={onClose} style={{ marginTop: 20 }}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              Send a session request to <strong style={{ color: 'var(--warm-cream)' }}>{mentor.fullName}</strong>
            </p>
            {skills.length > 0 && (
              <>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Select Skill</label>
                <select
                  value={selectedSkillId}
                  onChange={e => setSelectedSkillId(e.target.value)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none', width: '100%', marginBottom: 16 }}
                >
                  <option value="">Choose a skill…</option>
                  {skills.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </>
            )}
            {error && <p style={{ color: '#e06c75', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? <LoadingSpinner size={14} /> : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
}
const modalStyle = {
  background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
  padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
}
