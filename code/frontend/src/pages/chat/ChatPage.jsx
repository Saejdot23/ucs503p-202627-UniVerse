/**
 * ChatPage — /chat
 * Lists all conversations for the authenticated user.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { chatApi } from '../../services/api'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/ErrorState'

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.listConversations(),
    select: (res) => res.data?.data,
    refetchInterval: 15000, // poll every 15s for new conversations
  })

  const getOtherParticipant = (convo) => {
    const myId = user?._id?.toString()
    return (
      convo.participants.find((p) => p._id?.toString() !== myId) ||
      convo.participants[0]
    )
  }

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : ''

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28,
            color: 'var(--warm-cream)',
            margin: 0,
          }}
        >
          Messages
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          Your one-to-one conversations
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <LoadingSpinner size={28} />
        </div>
      ) : !conversations?.length ? (
        <EmptyState
          message="No conversations yet. Start a chat from another user's profile."
          icon="💬"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {conversations.map((convo) => {
            const other = getOtherParticipant(convo)
            return (
              <ConversationRow
                key={convo._id}
                other={other}
                lastMessage={convo.lastMessage}
                lastMessageAt={convo.lastMessageAt}
                onClick={() => navigate(`/chat/${convo._id}`)}
                fmt={fmt}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConversationRow({ other, lastMessage, lastMessageAt, onClick, fmt }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: hov ? 'var(--surface)' : 'transparent',
        border: `1px solid ${hov ? 'var(--border)' : 'transparent'}`,
      }}
    >
      <Avatar src={other?.avatar} name={other?.fullName || '?'} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {other?.fullName || 'Unknown User'}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: 'var(--text-muted)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lastMessage || 'Start the conversation'}
        </p>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
        {fmt(lastMessageAt)}
      </span>
    </div>
  )
}
