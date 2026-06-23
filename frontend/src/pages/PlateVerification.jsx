// frontend/src/pages/PlateVerification.jsx
// Public page — no login required
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function PlateVerification() {
  const [plate, setPlate] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await api.get(`/plates/verify/${plate.toUpperCase()}`)
      setResult(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setResult({ found: false })
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold">Plate Number Verification</h1>
          <p className="text-primary-200 text-sm mt-1">Check if a vehicle plate is registered</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
              <input className="input-field text-center text-xl font-mono uppercase tracking-widest"
                placeholder="ABC-1234" value={plate}
                onChange={e => setPlate(e.target.value.toUpperCase())} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Verifying...' : '🔍 Verify Plate'}
            </button>
          </form>

          {result && result.found && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-green-700 font-bold text-center mb-3">✅ Plate Registered</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Owner</span><span className="font-medium">{result.vehicle.ownerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Make / Model</span><span className="font-medium">{result.vehicle.make} {result.vehicle.model}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Year</span><span className="font-medium">{result.vehicle.year}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Color</span><span className="font-medium">{result.vehicle.color}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`font-medium ${result.vehicle.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{result.vehicle.status}</span></div>
              </div>
            </div>
          )}

          {result && !result.found && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200 text-center">
              <p className="text-red-700 font-bold">❌ Plate Not Found</p>
              <p className="text-red-500 text-sm mt-1">This plate number is not registered in the system.</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm text-center">{error}</div>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-primary-200 hover:text-white text-sm">← Back to Home</Link>
        </div>
      </div>
    </div>
  )
}