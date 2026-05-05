import { api } from './api'

export const mealPlanService = {
  generate: (data = {}) => api.post('/meal-plans/generate', data),
  generateStream: (data = {}, onEvent) => api.streamPost('/meal-plans/generate/stream', data, onEvent),
  getActive: () => api.get('/meal-plans/active'),
  getAll: () => api.get('/meal-plans'),
  getById: (id) => api.get(`/meal-plans/${id}`),
}
