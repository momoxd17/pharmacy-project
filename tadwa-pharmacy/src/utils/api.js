const API_BASE = '/api'
const TOKEN_KEY = 'tadwa_token'

function getToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  } catch {
    return null
  }
}

function authHeaders() {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export function setAuthToken(token) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(TOKEN_KEY, token)
      else localStorage.removeItem(TOKEN_KEY)
    }
  } catch {}
}

export function getAuthToken() {
  return getToken()
}

export async function apiPost(endpoint, body) {
  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new Error('NETWORK_ERROR')
  }
  if (res.status === 401) {
    setAuthToken(null)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err.error || `HTTP_${res.status}`
    const errObj = new Error(msg)
    errObj.status = res.status
    throw errObj
  }
  return res.json()
}

export async function apiGet(endpoint) {
  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, { headers: authHeaders() })
  } catch (e) {
    throw new Error('NETWORK_ERROR')
  }
  if (res.status === 401) {
    setAuthToken(null)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const ex = new Error(err.error || `HTTP_${res.status}`)
    ex.status = res.status
    throw ex
  }
  return res.json()
}

export async function apiPostFile(endpoint, formData) {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
  } catch (e) {
    throw new Error('NETWORK_ERROR')
  }
  if (res.status === 401) {
    setAuthToken(null)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const ex = new Error(err.error || `HTTP_${res.status}`)
    ex.status = res.status
    throw ex
  }
  return res.json()
}

export async function apiDelete(endpoint) {
  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
  } catch (e) {
    throw new Error('NETWORK_ERROR')
  }
  if (res.status === 401) {
    setAuthToken(null)
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const ex = new Error(err.error || `HTTP_${res.status}`)
    ex.status = res.status
    throw ex
  }
  return res.json()
}
