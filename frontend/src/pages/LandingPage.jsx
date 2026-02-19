import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NVRLogo = ({ size = 48 }) => (
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

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NVRLogo size={42} />
            <div>
              <h1 className="font-bold text-lg leading-tight">National Vehicle Registry</h1>
              <p className="text-primary-200 text-xs">Official Government Portal</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/verify" className="text-primary-100 hover:text-white text-sm font-medium transition-colors">Verify Plate</Link>
            {isAuthenticated ? (
              {/*<Link to="/dashboard" className="bg-white text-primary-800 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-50 transition-colors">Dashboard</Link>*/}
            ) : (
              <Link to="/login" className="bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary-700 transition-colors">Staff Login</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <NVRLogo size={80} />
          </div>
          <div className="inline-flex items-center gap-2 bg-primary-900/30 rounded-full px-4 py-2 text-primary-200 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            System Operational
          </div>
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Official Vehicle<br />Registration Portal
          </h2>
          <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
            The National Vehicle Registry provides secure, efficient management of all vehicle registrations, plate number assignments, and ownership records.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/verify" className="bg-white text-primary-800 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-lg">
              🔍 Verify Plate Number
            </Link>
            <Link to="/login" className="bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary-700 transition-colors text-lg">
              🔐 Staff Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          {[['1M+', 'Vehicles Registered'], ['99.9%', 'System Uptime'], ['24/7', 'Support Available']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold">{val}</div>
              <div className="text-secondary-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Services We Provide</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🚗', title: 'Vehicle Registration', desc: 'Submit and track vehicle registration applications with full status visibility.' },
              { icon: '🪪', title: 'Plate Assignment', desc: 'Automated unique plate number generation upon approval of registrations.' },
              { icon: '🔍', title: 'Public Verification', desc: 'Instantly verify any registered vehicle using its plate number.' }
            ].map(f => (
              <div key={f.title} className="card hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-800 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Need to verify a vehicle?</h3>
        <p className="text-primary-200 mb-8 text-lg">Use our free public plate verification tool</p>
        <Link to="/verify" className="bg-white text-primary-800 px-10 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition-colors inline-block">
          Verify Now — It's Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <NVRLogo size={28} />
            <span className="font-semibold text-white">National Vehicle Registry</span>
          </div>
          <div className="text-sm">© {new Date().getFullYear()} NVR. Official Government Portal. All rights reserved.</div>
          <div className="flex gap-4 text-sm">
            <Link to="/verify" className="hover:text-white">Verify Plate</Link>
            <Link to="/login" className="hover:text-white">Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
