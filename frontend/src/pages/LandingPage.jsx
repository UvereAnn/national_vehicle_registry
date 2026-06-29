// frontend/src/pages/LandingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="flex justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" width={80} height={80}>
            <circle cx="50" cy="50" r="48" fill="#166534"/>
            <circle cx="50" cy="50" r="44" fill="none" stroke="#15803d" strokeWidth="1.5"/>
            <path d="M50 18 L72 28 L72 52 C72 64 62 74 50 78 C38 74 28 64 28 52 L28 28 Z" fill="#15803d" stroke="#22c55e" strokeWidth="1.5"/>
            <path d="M34 55 L36 49 L40 46 L60 46 L64 49 L66 55 L66 60 L34 60 Z" fill="#22c55e"/>
            <path d="M38 46 L41 40 L59 40 L62 46" fill="#22c55e"/>
            <circle cx="40" cy="60" r="4" fill="#166534" stroke="#22c55e" strokeWidth="1.5"/>
            <circle cx="60" cy="60" r="4" fill="#166534" stroke="#22c55e" strokeWidth="1.5"/>
            <text x="50" y="75" textAnchor="middle" fontFamily="Arial" fontSize="8" fontWeight="bold" fill="#bbf7d0" letterSpacing="2">NVR</text>
          </svg>
        </div>
        <h1 className="text-white text-4xl font-bold mb-3">National Vehicle Registry</h1>
        <p className="text-primary-200 text-lg mb-8">Official vehicle registration and plate number verification portal</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="bg-white text-primary-800 px-8 py-3 rounded-xl font-bold hover:bg-primary-50 transition-colors">
            Staff Login
          </Link>
          <Link to="/verify" className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
            Verify a Plate
          </Link>
        </div>
      </div>
    </div>
  )
}