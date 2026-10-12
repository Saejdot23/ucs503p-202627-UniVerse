/**
 * useSocket — singleton Socket.IO client.
 *
 * The socket is created once when the user is authenticated and reused
 * across all components. It disconnects on logout.
 *
 * Authentication: the existing HTTP-only accessToken cookie is sent
 * automatically via withCredentials — no second auth system required.
 */
import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

let socketInstance = null

export function useSocket() {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) {
      if (socketInstance) {
        socketInstance.disconnect()
        socketInstance = null
      }
      socketRef.current = null
      return
    }

    if (!socketInstance) {
      // Empty string → connects to the same origin as the page (through Vite proxy in dev)
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      })

      socketInstance.on('connect', () => {
        console.log('[socket] connected:', socketInstance.id)
      })
      socketInstance.on('disconnect', (reason) => {
        console.log('[socket] disconnected:', reason)
      })
      socketInstance.on('connect_error', (err) => {
        console.error('[socket] connect error:', err.message)
      })
      socketInstance.on('error', ({ message }) => {
        console.error('[socket] server error:', message)
      })
    }

    socketRef.current = socketInstance
  }, [user])

  return socketRef.current
}
