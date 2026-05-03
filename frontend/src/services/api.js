const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('nutrition-ai-token')
  const isFormData = options.body instanceof FormData

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null

  const data = await res.json().catch(() => ({ detail: 'Request failed' }))

  if (!res.ok) {
    const msg = typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data?.detail)
        ? data.detail.map(e => e.msg).join(', ')
        : 'Request failed'
    throw new Error(msg)
  }

  return data
}

export const api = {
  get:    (path, opts)       => request(path, { method: 'GET', ...opts }),
  post:   (path, body, opts) => request(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts) => request(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  delete: (path, opts)       => request(path, { method: 'DELETE', ...opts }),
  upload: (path, formData)   => request(path, { method: 'POST',   body: formData }),
}
