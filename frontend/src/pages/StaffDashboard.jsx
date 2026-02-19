import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import StatusBadge from '../components/common/StatusBadge';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const staffNav = [
  { to: '/staff', icon: '📊', label: 'My Dashboard' },
  { to: '/staff/registrations', icon: '📋', label: 'My Registrations' },
  { to: '/vehicles/new', icon: '➕', label: 'New Registration' },
];

function StaffOverview({ vehicles }) {
  const { user } = useAuth();
  const total = vehicles.length;
  const pending = vehicles.filter(v => v.status === 'pending').length;
  const approved = vehicles.filter(v => v.status === 'approved').length;
  const rejected = vehicles.filter(v => v.status === 'rejected').length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
        <p className="text-gray-500 mt-1">Here's your registration activity overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '📋', label: 'Total Submitted', value: total, color: 'bg-blue-100' },
          { icon: '⏳', label: 'Pending Approval', value: pending, color: 'bg-yellow-100' },
          { icon: '✅', label: 'Approved', value: approved, color: 'bg-green-100' },
          { icon: '❌', label: 'Rejected', value: rejected, color: 'bg-red-100' }
        ].map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-gray-500 text-xs">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <Link to="/vehicles/new" className="btn-primary flex items-center gap-2">
          ➕ New Registration
        </Link>
        <Link to="/staff/registrations" className="btn-outline flex items-center gap-2">
          📋 View All Mine
        </Link>
      </div>

      {rejected > 0 && (
        <div className="card border-l-4 border-red-400 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">❌ Rejected Registrations</h3>
          <p className="text-gray-600 text-sm">You have {rejected} rejected registration(s). Go to My Registrations to view reasons.</p>
        </div>
      )}
      {pending > 0 && (
        <div className="card border-l-4 border-yellow-400">
          <h3 className="font-semibold text-gray-900 mb-1">⏳ Awaiting Review</h3>
          <p className="text-gray-600 text-sm">You have {pending} registration(s) pending admin review.</p>
        </div>
      )}
      {total === 0 && (
        <div className="card text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">🚗</div>
          <p className="font-medium">No registrations yet.</p>
          <Link to="/vehicles/new" className="text-primary-700 underline text-sm mt-2 inline-block">Submit your first one!</Link>
        </div>
      )}
    </div>
  );
}

function MyRegistrations({ vehicles, onLoad }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Registrations ({vehicles.length})</h2>
        <Link to="/vehicles/new" className="btn-primary">+ New Registration</Link>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Owner', 'Vehicle', 'Plate', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-400">No registrations yet. <Link to="/vehicles/new" className="text-primary-700 underline">Submit your first one!</Link></td></tr>
              ) : vehicles.map(v => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{v.owner_name}</p>
                    <p className="text-gray-400 text-xs">{v.national_id}</p>
                  </td>
                  <td className="py-3 px-4">{v.make} {v.model} ({v.year})</td>
                  <td className="py-3 px-4">
                    {v.plate_number
                      ? <span className="font-mono text-xs bg-primary-50 text-primary-800 px-2 py-1 rounded font-bold">{v.plate_number}</span>
                      : <span className="text-gray-300 text-xs">Not assigned</span>}
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(v.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {v.status === 'pending' && (
                      <button
                        onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                        className="text-xs bg-secondary-50 text-secondary-700 hover:bg-secondary-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {v.status === 'rejected' && v.rejection_reason && (
                      <span className="text-xs text-red-500 italic" title={v.rejection_reason}>See reason</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVehicles = () => {
    api.get('/vehicles').then(r => setVehicles(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(loadVehicles, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-700 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={staffNav} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route index element={<StaffOverview vehicles={vehicles} />} />
            <Route path="registrations" element={<MyRegistrations vehicles={vehicles} onLoad={loadVehicles} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
