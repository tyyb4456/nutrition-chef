import { api } from './api'

export const mealPlanService = {
  generate:  (data = {}) => api.post('/meal-plans/generate', data),
  getActive: ()           => api.get('/meal-plans/active'),
  getAll:    ()           => api.get('/meal-plans'),
  getById:   (id)         => api.get(`/meal-plans/${id}`),
}
