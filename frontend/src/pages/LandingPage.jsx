// frontend/src/pages/LandingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* 🧭 NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Left side: Logo */}
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" width={40} height={40}>
                <circle cx="50" cy="50" r="48" fill="#166534"/>
                <path d="M50 18 L72 28 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 28 Z" fill="#15803d" stroke="#22c55e" strokeWidth="1.5"/>
                <text x="50" y="58" textAnchor="middle" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#bbf7d0">NVR</text>
              </svg>
              <span className="text-gray-900 font-bold text-lg tracking-tight">National Vehicle Registry</span>
            </div>
            
            {/* Right side: Navigation Links */}
            <div className="flex items-center gap-6">
              <a href="#about" className="text-gray-600 hover:text-primary-700 font-medium text-sm transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-700 font-medium text-sm transition-colors">Contact</a>
              <Link to="/verify" className="border border-primary-600 text-primary-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors">
                Verify Plate
              </Link>
              <Link to="/login" className="bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-800 transition-colors shadow-sm">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <header className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Secure, Synchronized Vehicle Verification
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            The official national portal for law enforcement, licensing authorities, and citizens to register assets and instantly audit plate statuses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/verify" className="bg-white text-primary-900 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-all shadow-md w-full sm:w-auto">
              Verify a Plate Number
            </Link>
            <Link to="/login" className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 transition-all w-full sm:w-auto">
              Authorized Staff Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* ℹ️ ABOUT SECTION */}
      <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Platform Responsibilities</h2>
          <p className="text-gray-500 mt-2">Engineered for security, accuracy, and instant coordination.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-primary-100 text-primary-800 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4">🛡️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Centralized Registry</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Maintains an immutable ledger of vehicle chassis identities, engine ownership profiles, and structural histories across all state commands.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-primary-100 text-primary-800 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4">⚡</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Verification</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Provides roadside field officers and security check-posts a single-second lookup interface to evaluate plate distributions and flagging status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-primary-100 text-primary-800 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl mb-4">🤖</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Automated Plate Generation</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Leverages the internal isolated `plate-service` to assign systematic alphanumeric tokens immediately upon administrative application approval.
            </p>
          </div>
        </div>
      </section>

      {/* 📞 CONTACT US SECTION */}
      <section id="contact" className="bg-white border-t border-b border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Support & Coordination</h2>
          <p className="text-gray-600 mb-8">
            Are you an agency official running into sync anomalies, or an citizen requiring profile revisions? Reach our registry operations desk.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Operations Email</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">support@nvr.gov</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Headquarters</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">Registry Complex.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🏢 FOOTER */}
      <footer className="mt-auto bg-gray-900 text-gray-400 py-8 text-center text-xs border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} National Vehicle Registry Portal. All Rights Reserved.</p>
        <p className="mt-2 text-gray-600">Authorized administrative infrastructure. Access tracking protocols active.</p>
      </footer>

    </div>
  )
}