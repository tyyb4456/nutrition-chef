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

/**
 * POST to an SSE endpoint and call onEvent(parsedEvent) for each received event.
 * Rejects the returned promise if the HTTP status is not OK.
 *
 * @param {string} path
 * @param {object} body
 * @param {(event: object) => void} onEvent
 * @returns {Promise<void>}
 */
async function streamPost(path, body, onEvent) {
  const token = localStorage.getItem('nutrition-ai-token')
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: 'Request failed' }))
    const msg = typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data?.detail)
        ? data.detail.map(e => e.msg).join(', ')
        : 'Request failed'
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          onEvent(JSON.parse(line.slice(6)))
        } catch { }
      }
    }
  }
}

export const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
  streamPost: (path, body, onEvent) => streamPost(path, body, onEvent),
}
