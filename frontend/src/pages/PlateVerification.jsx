import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function PlateVerification() {
  const [plate, setPlate] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!plate.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get(`/public/verify/${plate.trim().toUpperCase()}`);
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setResult({ found: false });
      } else {
        setResult({ error: true });
      }
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-800 text-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <span className="font-bold">National Vehicle Registry</span>
          </Link>
          <Link to="/login" className="text-primary-200 hover:text-white text-sm">Staff Login →</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plate Number Verification</h1>
          <p className="text-gray-500 text-lg">Enter a plate number to check vehicle registration status</p>
        </div>

        {/* Search form */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              className="input-field flex-1 text-lg font-mono uppercase tracking-widest"
              placeholder="e.g. NVR-AB-1234"
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
            />
            <button type="submit" disabled={loading || !plate.trim()} className="btn-primary px-6 py-2 text-base whitespace-nowrap">
              {loading ? '...' : 'Verify'}
            </button>
          </form>
          <p className="text-gray-400 text-xs mt-2">Format: NVR-XX-NNNN (e.g. NVR-AB-1234)</p>
        </div>

        {/* Result */}
        {searched && result && (
          <div className="card">
            {result.error ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-600 font-medium">Service unavailable. Please try again.</p>
              </div>
            ) : result.found ? (
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Plate Found</h3>
                    <div className="font-mono text-primary-700 font-bold text-xl bg-primary-50 px-3 py-1 rounded mt-1 inline-block">{result.vehicle.plate_number}</div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ['Owner Name', result.vehicle.owner_name],
                    ['Vehicle', `${result.vehicle.make} ${result.vehicle.model}`],
                    ['Year', result.vehicle.year],
                    ['Color', result.vehicle.color],
                    ['Registration Status', result.vehicle.status?.toUpperCase()]
                  ].map(([label, value]) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                  ✅ This vehicle is officially registered with the National Vehicle Registry.
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">🚫</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Plate Number Not Found</h3>
                <p className="text-gray-500">The plate <span className="font-mono font-bold text-gray-800">{plate}</span> is not registered in our system.</p>
                <p className="text-gray-400 text-sm mt-2">Please verify the plate number and try again, or contact NVR.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/" className="text-primary-700 hover:text-primary-900 text-sm font-medium">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
