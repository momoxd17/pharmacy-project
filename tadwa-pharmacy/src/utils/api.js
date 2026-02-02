const API_BASE = '/api'

export async function apiPost(endpoint, body) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}
