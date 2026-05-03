import { api } from './api'

export const mealLogService = {
  log:         (data)                     => api.post('/meal-logs', data),
  getAll:      (days = 7, slot)           => api.get(`/meal-logs?days=${days}${slot ? `&meal_slot=${slot}` : ''}`),
  getAdherence:(days = 7)                 => api.get(`/meal-logs/adherence?days=${days}`),
  delete:      (id)                       => api.delete(`/meal-logs/${id}`),
}
