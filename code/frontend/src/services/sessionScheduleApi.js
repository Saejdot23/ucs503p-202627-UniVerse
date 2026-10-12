/**
 * Session Schedule API
 * Handles API calls for session scheduling functionality.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
})

export const sessionScheduleApi = {
  /**
   * Update session schedule details
   * @param {string} sessionId 
   * @param {object} data - { scheduledDate, scheduledTime, durationMinutes, mode, meetingLink }
   */
  update: (sessionId, data) => api.patch(`/session-schedule/${sessionId}`, data),

  /**
   * Get session schedule details
   * @param {string} sessionId 
   */
  get: (sessionId) => api.get(`/session-schedule/${sessionId}`),
}

export default sessionScheduleApi
