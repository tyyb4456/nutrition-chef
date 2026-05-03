import { api } from './api'

export const analyticsService = {
  getProgress:      ()     => api.get('/analytics/progress'),
  generateProgress: (data) => api.post('/analytics/progress', data || {}),
  getPreferences:   ()     => api.get('/analytics/preferences'),
}
