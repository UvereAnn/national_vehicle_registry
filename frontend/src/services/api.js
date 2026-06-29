// frontend/src/services/api.js
// Axios instance — base URL points to api-gateway.
// In Docker: nginx proxies /api/* to api-gateway on port 3000.
// In local dev (vite): vite.config.js proxies /api to localhost:3000.
// Token is injected from localStorage on every request automatically.

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api