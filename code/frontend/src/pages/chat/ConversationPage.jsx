/**
 * ConversationPage — /chat/:conversationId
 * Real-time one-to-one chat via Socket.IO with persistent message history.
 */
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { chatApi } from '../../services/api'
import { useSocket } from '../../hooks/useSocket'
import Avatar from '../../components/ui/Avatar'
import LoadingSpinner, { PageLoader } from '../../components/ui/LoadingSpinner'

export default function ConversationPage() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const socket = useSocket()

  // ── Fetch conversation list (to find the other participant's name/avatar) ──
  const { data: conversations, isLoading: convoLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatApi.listConversations(),
    select: (res) => res.data?.data,
  })

  const myId = user?._id?.toString()
  const conversation = conversations?.find((c) => c._id === conversationId)
  const other = conversation?.participants?.find(
    (p) => p._id?.toString() !== myId
  )

  // ── Fetch message history ─────────────────────────────────────────────────
  const { isLoading: msgLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    select: (res) => res.data?.data?.messages || [],
    enabled: !!conversationId,
    // TanStack Query v5: use onSuccess via useEffect watching data
  })

  // Mirror fetched history into local state (once on load)
  const { data: fetchedMessages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    select: (res) => res.data?.data?.messages || [],
    enabled: !!conversationId,
    staleTime: Infinity, // don't auto-refetch; real-time updates via socket
  })

  useEffect(() => {
    if (fetchedMessages && fetchedMessages.length > 0) {
      setMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  // ── Socket.IO — join room + listen ────────────────────────────────────────
  useEffect(() => {
    if (!socket || !conversationId) return

    socket.emit('join_conversation', { conversationId })

    const handleNewMessage = ({ message }) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev
        return [...prev, message]
      })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    }

    socket.on('new_message', handleNewMessage)

    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, conversationId, qc])

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async () => {
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setInput('')

    try {
      if (socket?.connected) {
        // Real-time path — the server will broadcast new_message back to us
        socket.emit('send_message', { conversationId, content, type: 'text' })
      } else {
        // REST fallback when socket is unavailable
        const res = await chatApi.sendMessage(conversationId, { content, type: 'text' })
        const msg = res.data?.data
        if (msg) setMessages((prev) => [...prev, msg])
      }
    } catch (err) {
      console.error('[chat] send failed:', err.message)
      setInput(content) // restore input on failure
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (convoLoading && !conversations) return <PageLoader />

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--near-black)',
          flexShrink: 0,
        }}
      >
        <button
          className="btn btn-ghost"
          onClick={() => navigate('/chat')}
          style={{ fontSize: 13, padding: '6px 12px' }}
        >
          ← Back
        </button>
        {other ? (
          <>
            <Avatar src={other.avatar} name={other.fullName} size={34} />
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {other.fullName}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>
                @{other.username}
              </p>
            </div>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Loading…
          </span>
        )}
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {msgLoading && messages.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <LoadingSpinner size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: 28, marginBottom: 10 }}>👋</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Say hello to get the conversation started.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              msg.sender?._id?.toString() === myId ||
              msg.sender?.toString() === myId
            return <MessageBubble key={msg._id} msg={msg} isMine={isMine} />
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          padding: '12px 24px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={1}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            padding: '10px 14px',
            outline: 'none',
            resize: 'none',
            lineHeight: 1.5,
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = 'var(--muted-blue)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = 'var(--border)')
          }
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{ alignSelf: 'flex-end', padding: '10px 18px' }}
        >
          {sending ? <LoadingSpinner size={14} /> : 'Send'}
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ msg, isMine }) {
  const time = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMine ? 'row-reverse' : 'row',
        gap: 8,
        alignItems: 'flex-end',
        maxWidth: '78%',
        alignSelf: isMine ? 'flex-end' : 'flex-start',
      }}
    >
      {!isMine && (
        <Avatar
          src={msg.sender?.avatar}
          name={msg.sender?.fullName || '?'}
          size={26}
        />
      )}
      <div
        style={{
          background: isMine ? 'var(--plum)' : 'var(--surface)',
          border: `1px solid ${isMine ? 'rgba(91,44,77,0.5)' : 'var(--border)'}`,
          borderRadius: isMine
            ? '12px 12px 2px 12px'
            : '12px 12px 12px 2px',
          padding: '9px 14px',
          maxWidth: '100%',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--warm-cream)',
            lineHeight: 1.5,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg.content}
        </p>
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 10,
            color: 'rgba(232,210,174,0.4)',
            textAlign: 'right',
          }}
        >
          {time}
        </p>
      </div>
    </div>
  )
}
