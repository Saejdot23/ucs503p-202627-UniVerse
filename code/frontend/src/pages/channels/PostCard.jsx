import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { postsApi, commentsApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const fmt = (d, year = false) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', ...(year ? { year: 'numeric' } : {}),
  })

export default function PostCard({ post, channel, onRefresh }) {
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const isClosed = post.status === 'closed'
  const isOwn = post.author?._id?.toString() === user?._id?.toString() || post.author?.toString() === user?._id?.toString()

  const closeMutation = useMutation({ mutationFn: () => postsApi.close(post._id), onSuccess: onRefresh })
  const voteMutation = useMutation({ mutationFn: (vote) => postsApi.vote(post._id, vote), onSuccess: onRefresh })

  const shareFn = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/channels/${channel.id}/${post._id}`).catch(() => {})
    alert('Link copied to clipboard!')
  }

  const tagColorMap = { LEND: 'badge-lend', BORROW: 'badge-borrow', LOST: 'badge-lost', FOUND: 'badge-found' }

  return (
    <div className="card" style={{ opacity: isClosed ? 0.75 : 1, borderLeft: isClosed ? '3px solid var(--text-muted)' : `3px solid ${channel.color}`, transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <Avatar src={post.author?.avatar} name={post.author?.fullName} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{post.author?.fullName}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{post.author?.username}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {fmt(post.createdAt, true)}</span>
          </div>
          {post.tag && <span className={`badge ${tagColorMap[post.tag] || ''}`} style={{ marginTop: 4 }}>{post.tag}</span>}
          {isClosed && <span className="badge badge-closed" style={{ marginLeft: post.tag ? 6 : 0 }}>Resolved</span>}
        </div>
      </div>

      <h3 style={{ fontSize: 16, color: 'var(--warm-cream)', marginBottom: 6, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }} onClick={() => setExpanded(!expanded)}>
        {post.title}
      </h3>

      {expanded && (
        <>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>{post.body}</p>
          {post.location && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {post.location}</p>}
          {post.images?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {post.images.map((img, i) => (
                <img key={i} src={img.url} alt={`Post image ${i + 1}`} style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => window.open(img.url, '_blank')} />
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        {channel.id === 'general' && !isClosed && (
          <>
            <ActionBtn onClick={() => voteMutation.mutate('up')} disabled={voteMutation.isPending}>▲ {post.upvotes || 0}</ActionBtn>
            <ActionBtn onClick={() => voteMutation.mutate('down')} disabled={voteMutation.isPending}>▼ {post.downvotes || 0}</ActionBtn>
          </>
        )}
        <ActionBtn onClick={() => setShowComments(!showComments)}>💬 Comments</ActionBtn>
        <ActionBtn onClick={shareFn}>⬆ Share</ActionBtn>
        {!isClosed && channel.id !== 'general' && (isOwn || user?.role === 'admin') && (
          <ActionBtn onClick={() => window.confirm('Mark this post as resolved?') && closeMutation.mutate()} disabled={closeMutation.isPending} color="var(--muted-blue)">✓ Resolve</ActionBtn>
        )}
      </div>

      {isClosed && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(100,100,100,0.1)', borderRadius: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          This post has been resolved. No further comments are accepted.
        </div>
      )}

      {showComments && <CommentsSection postId={post._id} isClosed={isClosed} />}
    </div>
  )
}

function ActionBtn({ children, onClick, disabled, color = 'var(--text-muted)' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer', fontSize: 12, color, padding: '4px 8px', borderRadius: 2, transition: 'background 0.15s', opacity: disabled ? 0.5 : 1 }} onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'rgba(232,210,174,0.06)')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      {children}
    </button>
  )
}

function CommentsSection({ postId, isClosed }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentsApi.list(postId),
    select: (res) => res.data?.data,
  })

  const submit = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      await commentsApi.create(postId, { body: body.trim() })
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      setBody('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
      {!isClosed && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <Avatar src={user?.avatar} name={user?.fullName} size={28} />
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <input className="input" placeholder="Write a comment…" value={body} onChange={e => setBody(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()} style={{ fontSize: 13 }} />
            <button className="btn btn-primary" onClick={submit} disabled={submitting || !body.trim()} style={{ padding: '9px 16px', fontSize: 13 }}>
              {submitting ? <LoadingSpinner size={14} /> : 'Post'}
            </button>
          </div>
        </div>
      )}
      {isLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><LoadingSpinner /></div>}
      {data?.comments?.map(comment => (
        <CommentItem key={comment._id} comment={comment} isClosed={isClosed} postId={postId} depth={0} />
      ))}
    </div>
  )
}

function CommentItem({ comment, isClosed, postId, depth }) {
  const qc = useQueryClient()
  const [replyBody, setReplyBody] = useState('')
  const [showReply, setShowReply] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submitReply = async () => {
    if (!replyBody.trim()) return
    setSubmitting(true)
    try {
      await commentsApi.create(postId, { body: replyBody.trim(), parentId: comment._id })
      qc.invalidateQueries({ queryKey: ['comments', postId] })
      setReplyBody('')
      setShowReply(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginLeft: depth * 28, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Avatar src={comment.author?.avatar} name={comment.author?.fullName} size={28} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '8px 12px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{comment.author?.fullName}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(comment.createdAt)}</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{comment.body}</p>
          {!isClosed && depth < 2 && (
            <button onClick={() => setShowReply(!showReply)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', marginTop: 4 }}>Reply</button>
          )}
        </div>
      </div>

      {showReply && (
        <div style={{ marginLeft: 38, display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="input" placeholder="Write a reply…" value={replyBody} onChange={e => setReplyBody(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitReply()} style={{ fontSize: 13 }} />
          <button className="btn btn-primary" onClick={submitReply} disabled={submitting} style={{ padding: '9px 14px', fontSize: 13 }}>
            {submitting ? <LoadingSpinner size={12} /> : '↵'}
          </button>
        </div>
      )}

      {comment.replies?.map(reply => (
        <CommentItem key={reply._id} comment={reply} isClosed={isClosed} postId={postId} depth={depth + 1} />
      ))}
    </div>
  )
}
