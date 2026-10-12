import { useState } from 'react'
import { postsApi } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const TAG_OPTIONS = {
  borrow_lend: ['LEND', 'BORROW'],
  lost_found: ['LOST', 'FOUND'],
  general: [],
}

export default function CreatePostModal({ channel, onClose, onCreated }) {
  const tags = TAG_OPTIONS[channel.id] || []
  const [form, setForm] = useState({
    title: '',
    body: '',
    tag: tags[0] || '',
    location: '',
    itemDate: '',
  })
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length > 5) { setError('Maximum 5 images'); return }
    for (const f of selected) {
      if (f.size > 5 * 1024 * 1024) { setError('Each image must be under 5 MB'); return }
    }
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
    setError(null)
  }

  const submit = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.body.trim()) { setError('Body is required'); return }
    if (tags.length && !form.tag) { setError('Please select a tag'); return }

    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('channel', channel.id)
      fd.append('title', form.title.trim())
      fd.append('body', form.body.trim())
      if (form.tag) fd.append('tag', form.tag)
      if (form.location) fd.append('location', form.location.trim())
      if (form.itemDate) fd.append('itemDate', form.itemDate)
      for (const file of files) fd.append('images', file)

      await postsApi.create(fd)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', margin: 0 }}>
            {channel.emoji} New Post in {channel.label}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tag selector */}
          {tags.length > 0 && (
            <div>
              <label style={labelStyle}>Tag</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {tags.map(t => (
                  <button
                    key={t}
                    onClick={() => setField('tag', t)}
                    style={{
                      padding: '7px 20px', borderRadius: 2, fontSize: 13, fontWeight: 600,
                      background: form.tag === t ? channel.color : 'transparent',
                      color: form.tag === t ? '#180807' : 'var(--text-secondary)',
                      border: `1px solid ${form.tag === t ? channel.color : 'var(--border)'}`,
                      cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.06em',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input className="input" placeholder="What's this about?" value={form.title} onChange={e => setField('title', e.target.value)} />
          </div>

          {/* Body */}
          <div>
            <label style={labelStyle}>Details</label>
            <textarea className="input" rows={4} placeholder="Describe in detail…" value={form.body} onChange={e => setField('body', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {/* Location (Lost & Found) */}
          {channel.id === 'lost_found' && (
            <div>
              <label style={labelStyle}>Location (optional)</label>
              <input className="input" placeholder="e.g. Library, Block D canteen" value={form.location} onChange={e => setField('location', e.target.value)} />
            </div>
          )}

          {/* Item date (Lost & Found) */}
          {channel.id === 'lost_found' && (
            <div>
              <label style={labelStyle}>Date (optional)</label>
              <input type="date" className="input" value={form.itemDate} onChange={e => setField('itemDate', e.target.value)} />
            </div>
          )}

          {/* Images (not general) */}
          {channel.id !== 'general' && (
            <div>
              <label style={labelStyle}>Images (max 5, max 5 MB each)</label>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple onChange={handleFiles} style={{ color: 'var(--text-secondary)', fontSize: 13 }} />
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {previews.map((p, i) => (
                    <img key={i} src={p} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p style={{ color: '#e06c75', fontSize: 13, marginTop: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? <LoadingSpinner size={14} /> : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
