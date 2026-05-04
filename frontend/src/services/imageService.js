import { api } from './api'

export const imageService = {
  upload: (file, { auto_log = false, meal_slot, log_date } = {}) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('auto_log', String(auto_log))
    if (meal_slot) fd.append('meal_slot', meal_slot)
    if (log_date)  fd.append('log_date', log_date)
    return api.upload('/images/upload', fd)
  },

  analyse: ({ image_base64, mime_type = 'image/jpeg', auto_log = false, meal_slot, log_date } = {}) =>
    api.post('/images/analyse', { image_base64, mime_type, auto_log, meal_slot, log_date }),
}
