import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NVRLogo = ({ size = 36 }) => (
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

const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
    }`}
  >
    <span className="text-lg">{icon}</span>
    {label}
  </Link>
);

export default function Sidebar({ navItems }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const roleLabel = {
    super_admin: 'Super Admin',
    admin_officer: 'Admin Officer',
    registration_staff: 'Registration Staff'
  };

  return (
    <aside className="w-64 bg-primary-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-primary-700">
        <NVRLogo size={40} />
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight">National Vehicle</p>
          <p className="text-white font-bold text-sm leading-tight">Registry</p>
          <p className="text-primary-300 text-xs mt-0.5">Official Portal</p>
        </div>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={
              location.pathname === item.to ||
              (item.to !== '/admin' && item.to !== '/staff' && location.pathname.startsWith(item.to))
            }
          />
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-primary-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-primary-400">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs truncate">{roleLabel[user?.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-primary-200 hover:text-white hover:bg-primary-700 py-2 px-3 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
