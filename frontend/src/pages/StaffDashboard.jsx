// frontend/src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar'
import StatusBadge from '../components/common/StatusBadge'
import api from '../services/api'
import toast from 'react-hot-toast'

const staffNav = [
  { to: '/staff', icon: '📋', label: 'My Registrations' },
  { to: '/vehicles/new', icon: '➕', label: 'New Registration' },
]

function MyRegistrations() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/vehicles')
      .then(r => setVehicles(r.data))
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Registrations ({vehicles.length})</h2>
        <Link to="/vehicles/new" className="btn-primary">+ New Registration</Link>
      </div>
      {vehicles.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">🚗</p>
          <p className="font-medium">No registrations yet.</p>
          <Link to="/vehicles/new" className="text-primary-600 text-sm mt-2 inline-block">Submit your first registration →</Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Plate</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map(v => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{v.ownerName}</td>
                  <td className="py-3 px-4">{v.make} {v.model} ({v.year})</td>
                  <td className="py-3 px-4">
                    {v.plateNumber
                      ? <span className="font-mono text-xs bg-primary-50 text-primary-800 px-2 py-1 rounded font-bold">{v.plateNumber}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(v.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function StaffDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={staffNav} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Routes>
            <Route index element={<MyRegistrations />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}