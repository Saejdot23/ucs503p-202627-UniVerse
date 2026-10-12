import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { skillsApi } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MySkillsPanel() {
  const qc = useQueryClient()
  const [addMode, setAddMode] = useState(null) // 'teach' | 'learn' | null
  const [skillName, setSkillName] = useState('')
  const [category, setCategory] = useState('Tech')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
    select: (res) => res.data?.data,
  })

  const removeTeach = useMutation({
    mutationFn: (id) => skillsApi.removeTeachSkill(id),
    onSuccess: () => qc.invalidateQueries(['mySkills']),
  })

  const removeLearn = useMutation({
    mutationFn: (id) => skillsApi.removeLearnSkill(id),
    onSuccess: () => qc.invalidateQueries(['mySkills']),
  })

  const handleAdd = async () => {
    if (!skillName.trim()) return
    setCreating(true)
    setError(null)
    try {
      // Create skill in catalog if doesn't exist
      const skillRes = await skillsApi.create({ name: skillName.trim(), category })
      const skillId = skillRes.data?.data?._id
      if (addMode === 'teach') await skillsApi.addTeachSkill(skillId)
      else await skillsApi.addLearnSkill(skillId)
      qc.invalidateQueries(['mySkills'])
      setSkillName('')
      setAddMode(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill')
    } finally {
      setCreating(false)
    }
  }

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><LoadingSpinner /></div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
      <SkillList
        title="Skills I Teach"
        skills={data?.skillsToTeach || []}
        color="var(--plum)"
        onRemove={(id) => removeTeach.mutate(id)}
        onAdd={() => setAddMode('teach')}
      />
      <SkillList
        title="Skills I Learn"
        skills={data?.skillsToLearn || []}
        color="var(--muted-blue)"
        onRemove={(id) => removeLearn.mutate(id)}
        onAdd={() => setAddMode('learn')}
      />

      {/* Add skill modal */}
      {addMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#1a0a07', border: '1px solid var(--border)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 400 }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--warm-cream)', marginBottom: 20 }}>
              Add Skill to {addMode === 'teach' ? 'Teach' : 'Learn'} List
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                className="input"
                placeholder="Skill name (e.g. Python, Guitar)"
                value={skillName}
                onChange={e => setSkillName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', padding: '9px 12px', fontSize: 14, outline: 'none' }}
              >
                <option value="Tech">Tech</option>
                <option value="Non-tech">Non-Tech</option>
              </select>
            </div>
            {error && <p style={{ color: '#e06c75', fontSize: 13, marginTop: 8 }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={() => { setAddMode(null); setError(null) }} disabled={creating}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={creating || !skillName.trim()}>
                {creating ? <LoadingSpinner size={14} /> : 'Add Skill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SkillList({ title, skills, color, onRemove, onAdd }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>{title}</h3>
        <button
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: '5px 10px' }}
          onClick={onAdd}
        >
          + Add
        </button>
      </div>
      {skills.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>None added yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map(s => (
            <div key={s._id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 8px 4px 10px', borderRadius: 2,
              background: color === 'var(--plum)' ? 'rgba(91,44,77,0.2)' : 'rgba(46,134,171,0.15)',
              border: `1px solid ${color === 'var(--plum)' ? 'rgba(91,44,77,0.3)' : 'rgba(46,134,171,0.25)'}`,
            }}>
              <span style={{ fontSize: 12, color: color === 'var(--plum)' ? '#c07db0' : 'var(--muted-blue)', textTransform: 'capitalize' }}>{s.name}</span>
              <button
                onClick={() => onRemove(s._id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
                title="Remove"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
