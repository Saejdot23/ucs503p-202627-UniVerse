import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '../../services/api'
import PostCard from './PostCard'
import CreatePostModal from './CreatePostModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

const TAG_OPTIONS = {
  borrow_lend: ['LEND', 'BORROW'],
  lost_found: ['LOST', 'FOUND'],
  general: [],
}

export default function ChannelFeed({ channel, onBack }) {
  const [tagFilter, setTagFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['posts', channel.id, tagFilter, statusFilter, page],
    queryFn: () => postsApi.list({
      channel: channel.id,
      tag: tagFilter || undefined,
      status: statusFilter,
      page,
      limit: 20,
    }),
    select: (res) => res.data?.data,
    keepPreviousData: true,
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={onBack} style={{ fontSize: 13 }}>← Channels</button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--warm-cream)', margin: 0 }}>
            {channel.emoji} {channel.label}
          </h2>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + New Post
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Tag filter */}
        {TAG_OPTIONS[channel.id]?.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
            style={{
              padding: '5px 14px', borderRadius: 2, fontSize: 12,
              background: tagFilter === tag ? channel.color : 'var(--surface)',
              color: tagFilter === tag ? 'var(--near-black)' : 'var(--text-secondary)',
              border: `1px solid ${tagFilter === tag ? channel.color : 'var(--border)'}`,
              cursor: 'pointer', fontWeight: tagFilter === tag ? 600 : 400,
              transition: 'all 0.15s', letterSpacing: '0.06em',
            }}
          >
            {tag}
          </button>
        ))}

        {/* Status filter (only for channels with lifecycle) */}
        {channel.id !== 'general' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {['open', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '5px 14px', borderRadius: 2, fontSize: 12,
                  background: statusFilter === s ? 'rgba(232,210,174,0.1)' : 'transparent',
                  color: statusFilter === s ? 'var(--warm-cream)' : 'var(--text-muted)',
                  border: `1px solid ${statusFilter === s ? 'var(--border)' : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><LoadingSpinner size={28} /></div>
      ) : !data?.posts?.length ? (
        <EmptyState
          message={`No ${statusFilter} posts in ${channel.label} yet.`}
          icon={channel.emoji}
          action={
            <button className="btn btn-secondary" onClick={() => setCreating(true)}>
              Create the first post
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              channel={channel}
              onRefresh={() => qc.invalidateQueries(['posts', channel.id])}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
          <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ padding: '10px 16px', color: 'var(--text-muted)', fontSize: 13 }}>{page} / {data.totalPages}</span>
          <button className="btn btn-ghost" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}>Next →</button>
        </div>
      )}

      {/* Create post modal */}
      {creating && (
        <CreatePostModal
          channel={channel}
          onClose={() => setCreating(false)}
          onCreated={() => {
            qc.invalidateQueries(['posts', channel.id])
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}
