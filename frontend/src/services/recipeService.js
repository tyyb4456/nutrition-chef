import { api } from './api'

export const recipeService = {
  generate:  (data)  => api.post('/recipes/generate', data),
  followup:  (id, q) => api.post(`/recipes/${id}/followup`, { question: q }),
  getAll:    (page = 1, limit = 20) => api.get(`/recipes?page=${page}&limit=${limit}`),
  getById:   (id)    => api.get(`/recipes/${id}`),
}
