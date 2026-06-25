// frontend/src/services/api.js
// VITE_API_URL is baked in at build time:
//   Local Docker Compose: /api (nginx proxies /api/* to api-gateway)
//   Cloud Run: https://api-gateway-xxxxx-uc.a.run.app/api
//              (set as build arg during GitHub Actions cd.yml)

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api