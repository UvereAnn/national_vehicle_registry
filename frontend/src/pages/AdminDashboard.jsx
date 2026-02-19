import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/admin', icon: '📊', label: 'Dashboard' },
  { to: '/admin/vehicles', icon: '🚗', label: 'All Vehicles' },
  { to: '/admin/pending', icon: '⏳', label: 'Pending Approvals' },
  { to: '/admin/staff', icon: '👥', label: 'Staff Management' },
];

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value !== undefined && value !== null ? value : <span className="text-gray-300 text-2xl">Loading...</span>}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => { setStats(r.data); setError(null); })
      .catch(err => {
        console.error('Stats error:', err);
        setError(err.response?.data?.error || 'Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
      <div className="card border-l-4 border-red-400 text-red-700">⚠️ {error}</div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🚗" label="Total Registered" value={stats?.total} color="bg-primary-100" />
        <StatCard icon="⏳" label="Pending Approvals" value={stats?.pending} color="bg-yellow-100" />
        <StatCard icon="✅" label="Approved Today" value={stats?.approvedToday} color="bg-green-100" sub={`${stats?.approved ?? '—'} total approved`} />
        <StatCard icon="👥" label="Active Staff" value={stats?.activeStaff} color="bg-blue-100" />
      </div>
      {stats && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">Registration Status Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
                { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Total Vehicles</span>
                <span className="font-bold">{stats.total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Approval Rate</span>
                <span className="font-bold text-green-600">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Rejection Rate</span>
                <span className="font-bold text-red-600">
                  {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Pending Review</span>
                <span className="font-bold text-yellow-600">{stats.pending}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleTable({ vehicles, onApprove, onReject, showActions = false }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Plate</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reviewed By</th>
              {showActions && <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vehicles.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-gray-400">No records found</td></tr>
            ) : vehicles.map(v => (
              <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <p className="font-medium text-gray-900">{v.owner_name}</p>
                  <p className="text-gray-400 text-xs">{v.national_id}</p>
                </td>
                <td className="py-3 px-4">{v.make} {v.model}</td>
                <td className="py-3 px-4">{v.year}</td>
                <td className="py-3 px-4">
                  {v.plate_number
                    ? <span className="font-mono text-xs bg-primary-50 text-primary-800 px-2 py-1 rounded font-bold">{v.plate_number}</span>
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 px-4"><StatusBadge status={v.status} /></td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  <div>{new Date(v.created_at).toLocaleDateString()}</div>
                  <div className="text-gray-300">{v.staff_name || '—'}</div>
                </td>
                <td className="py-3 px-4 text-xs">
                  {v.reviewed_by_name ? (
                    <div>
                      <p className="font-medium text-gray-700">{v.reviewed_by_name}</p>
                      <p className="text-gray-400">{new Date(v.updated_at).toLocaleDateString()}</p>
                      {v.status === 'rejected' && v.rejection_reason && (
                        <p className="text-red-400 italic mt-0.5 max-w-32 truncate" title={v.rejection_reason}>
                          "{v.rejection_reason}"
                        </p>
                      )}
                    </div>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                {showActions && (
                  <td className="py-3 px-4">
                    {v.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => onApprove(v)} className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">✅ Approve</button>
                        <button onClick={() => onReject(v)} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">❌ Reject</button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AllVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vehicles')
      .then(r => setVehicles(r.data))
      .catch(err => toast.error(err.response?.data?.error || 'Failed to load vehicles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">All Vehicles ({vehicles.length})</h2>
      <VehicleTable vehicles={vehicles} />
    </div>
  );
}

function PendingApprovals() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', vehicle: null, reason: '' });

  const load = () => {
    setLoading(true);
    api.get('/vehicles')
      .then(r => setVehicles(r.data.filter(v => v.status === 'pending')))
      .catch(err => toast.error(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async () => {
    try {
      const res = await api.put(`/vehicles/${modal.vehicle.id}/approve`);
      toast.success(`✅ Approved! Plate: ${res.data.plate_number}`);
      setModal({ open: false });
      load();
    } catch (err) {
      console.error('Approve error:', err.response);
      toast.error(err.response?.data?.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/vehicles/${modal.vehicle.id}/reject`, { reason: modal.reason });
      toast.success('Registration rejected');
      setModal({ open: false });
      load();
    } catch (err) {
      console.error('Reject error:', err.response);
      toast.error(err.response?.data?.error || 'Failed to reject');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals ({vehicles.length})</h2>
      {vehicles.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-medium">All caught up! No pending registrations.</p>
        </div>
      )}
      {vehicles.length > 0 && (
        <VehicleTable
          vehicles={vehicles}
          showActions
          onApprove={v => setModal({ open: true, type: 'approve', vehicle: v })}
          onReject={v => setModal({ open: true, type: 'reject', vehicle: v, reason: '' })}
        />
      )}

      <ConfirmModal
        open={modal.open && modal.type === 'approve'}
        title="Approve Registration"
        message={`Approve registration for ${modal.vehicle?.owner_name}'s ${modal.vehicle?.make} ${modal.vehicle?.model}? A unique plate number will be auto-generated.`}
        onConfirm={handleApprove}
        onCancel={() => setModal({ open: false })}
        confirmText="✅ Approve & Generate Plate"
        confirmClass="btn-primary"
      />

      <ConfirmModal
        open={modal.open && modal.type === 'reject'}
        title="Reject Registration"
        onConfirm={handleReject}
        onCancel={() => setModal({ open: false })}
        confirmText="❌ Reject Registration"
        confirmClass="btn-danger"
      >
        <p className="text-gray-600 mb-3">
          Rejecting: <strong>{modal.vehicle?.owner_name}'s {modal.vehicle?.make} {modal.vehicle?.model}</strong>
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for rejection</label>
        <textarea
          className="input-field"
          rows={3}
          placeholder="Enter reason for rejection (optional)"
          value={modal.reason}
          onChange={e => setModal(m => ({ ...m, reason: e.target.value }))}
        />
      </ConfirmModal>
    </div>
  );
}

function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'registration_staff' });
  const { user: currentUser } = useAuth();

  const load = () => {
    setLoading(true);
    setError(null);
    api.get('/admin/users')
      .then(r => { setUsers(r.data); setError(null); })
      .catch(err => {
        console.error('Load users error:', err.response);
        setError(err.response?.data?.error || 'Failed to load users');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Use the /admin route which goes through the gateway with x-user headers already set
      await api.post('/auth/register', form);
      toast.success(`✅ Account created for ${form.name}`);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'registration_staff' });
      load();
    } catch (err) {
      console.error('Create user error:', err.response);
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (userId, currentStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      toast.success(res.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    admin_officer: 'Admin Officer',
    registration_staff: 'Staff'
  };

  const roleBadgeColor = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin_officer: 'bg-blue-100 text-blue-800',
    registration_staff: 'bg-primary-100 text-primary-800'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '✕ Cancel' : '+ Add Account'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-l-4 border-primary-500">
          <h3 className="text-lg font-bold mb-4">Create New Account</h3>
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input-field" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input type="email" className="input-field" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@nvr.gov" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password * (min 8 chars)</label>
              <input type="password" className="input-field" required minLength={8} value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="registration_staff">Registration Staff</option>
                {currentUser?.role === 'super_admin' && (
                  <option value="admin_officer">Admin Officer</option>
                )}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Creating...' : '✅ Create Account'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
        </div>
      )}

      {error && (
        <div className="card border-l-4 border-red-400 text-red-700 mb-4">
          ⚠️ {error}
          <button onClick={load} className="ml-4 text-sm underline">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-gray-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleToggle(u.id, u.is_active)}
                        className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                          u.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {u.id === currentUser?.id && (
                      <span className="text-xs text-gray-300 italic">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar navItems={adminNav} />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="vehicles" element={<AllVehicles />} />
            <Route path="pending" element={<PendingApprovals />} />
            <Route path="staff" element={<StaffManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
