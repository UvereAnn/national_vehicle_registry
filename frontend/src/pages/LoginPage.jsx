// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (['admin', 'superadmin'].includes(user.role)) {
        navigate('/admin')
      } else {
        navigate('/staff')
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 401) toast.error('❌ Incorrect email or password.')
      else if (status === 403) toast.error('🚫 Account deactivated. Contact admin.')
      else toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold">National Vehicle Registry</h1>
          <p className="text-primary-200 text-sm mt-1">Staff Portal — Authorized Personnel Only</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-xl font-bold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="input-field" placeholder="you@nvr.gov"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input-field" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 mb-1 font-medium">Demo Credentials</p>
            <p className="text-xs text-gray-400">Staff: staff@nvr.gov / REDACTED</p>
            <p className="text-xs text-gray-400">Admin: admin@nvr.gov / REDACTED</p>
          </div>
        </div>
        <div className="text-center mt-4 flex justify-center gap-4">
          <Link to="/" className="text-primary-200 hover:text-white text-sm">← Back to Home</Link>
          <span className="text-primary-500">|</span>
          <Link to="/verify" className="text-primary-200 hover:text-white text-sm">Verify a Plate</Link>
        </div>
      </div>
    </div>
  )
}