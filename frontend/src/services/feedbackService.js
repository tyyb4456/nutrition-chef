import { api } from './api'

export const feedbackService = {
  submit: ({ recipe_id, rating, comment, thread_id }) =>
    api.post('/feedback/', { recipe_id, rating, comment, thread_id }),

  listForRecipe: (recipe_id) =>
    api.get(`/feedback/?recipe_id=${recipe_id}`),

  delete: (feedback_id) =>
    api.delete(`/feedback/${feedback_id}`),
}
