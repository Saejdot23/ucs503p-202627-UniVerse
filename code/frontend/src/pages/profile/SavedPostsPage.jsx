import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../../services/api'
import { EmptyState } from '../../components/ui/ErrorState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const CHANNEL_LABELS = {
  general: '💬 General',
  borrow_lend: '📚 Borrow/Lend',
  lost_found: '🔎 Lost & Found',
}

export default function SavedPostsPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['savedPosts'],
    queryFn: () => usersApi.getSavedPosts(),
    select: (res) => res.data?.data,
  })

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--warm-cream)', marginBottom: 24 }}>Saved Posts</h1>
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : !data?.posts?.length ? (
        <EmptyState message="No saved posts yet. Save posts from the Channels." icon="🔖" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.posts.map(post => (
            <div
              key={post._id}
              className="card"
              style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => navigate(`/channels/${post.channel}`)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>
                    {CHANNEL_LABELS[post.channel] || post.channel}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--warm-cream)', margin: 0, fontWeight: 500 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    by {post.author?.fullName} · {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {post.tag && (
                  <span className={`badge badge-${post.tag.toLowerCase()}`}>{post.tag}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
