import { api } from './api'

export const authService = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),

  login: (name, password) =>
    api.post('/auth/login', { name, password }),
}
