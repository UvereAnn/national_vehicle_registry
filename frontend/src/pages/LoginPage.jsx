import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NVRLogo = ({ size = 64 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" width={size} height={size}>
    <circle cx="50" cy="50" r="48" fill="#166534"/>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#15803d" strokeWidth="1.5"/>
    <path d="M50 18 L72 28 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 28 Z" fill="#15803d" stroke="#22c55e" strokeWidth="1.5"/>
    <path d="M34 55 L36 49 L40 46 L60 46 L64 49 L66 55 L66 60 L34 60 Z" fill="#22c55e"/>
    <path d="M38 46 L41 40 L59 40 L62 46" fill="#22c55e"/>
    <circle cx="40" cy="60" r="4" fill="#166534" stroke="#22c55e" strokeWidth="1.5"/>
    <circle cx="60" cy="60" r="4" fill="#166534" stroke="#22c55e" strokeWidth="1.5"/>
    <path d="M42 45 L43 41 L57 41 L58 45 Z" fill="#166534" opacity="0.6"/>
    <text x="50" y="75" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" fill="#bbf7d0" letterSpacing="2">NVR</text>
  </svg>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const user = await login(form.email, form.password);
    toast.success(`Welcome back, ${user.name}!`);
    if (['super_admin', 'admin_officer'].includes(user.role)) {
      navigate('/admin');
    } else {
      navigate('/staff');
    }
  } catch (err) {
    const message = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login failed';
    if (message === 'Invalid credentials') {
      toast.error('❌ Incorrect email or password. Please try again.');
    } else if (err.response?.status === 401) {
      toast.error('❌ Account not found or password incorrect.');
    } else if (err.response?.status === 403) {
      toast.error('🚫 Your account has been deactivated. Contact admin.');
    } else {
      toast.error(`Login failed: ${message}`);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <NVRLogo size={72} />
          </div>
          <h1 className="text-white text-2xl font-bold">National Vehicle Registry</h1>
          <p className="text-primary-200 text-sm mt-1">Staff Portal — Authorized Personnel Only</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-900 text-xl font-bold mb-6">Sign In to Your Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@nvr.gov"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-1 font-medium">Demo Credentials</p>
            <div className="text-xs text-gray-400 text-center space-y-0.5">
              <p>Staff: <span className="font-mono text-gray-600">staff@nvr.gov</span> / <span className="font-mono text-gray-600">Admin@1234</span></p>
              <p>Admin: <span className="font-mono text-gray-600">admin@nvr.gov</span> / <span className="font-mono text-gray-600">Admin@1234</span></p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 flex justify-center gap-4">
          <Link to="/" className="text-primary-200 hover:text-white text-sm transition-colors">← Back to Home</Link>
          <span className="text-primary-500">|</span>
          <Link to="/verify" className="text-primary-200 hover:text-white text-sm transition-colors">Verify a Plate</Link>
        </div>
      </div>
    </div>
  );
}
