// frontend/src/pages/VehicleForm.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function VehicleForm() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    owner_name: '', national_id: '', phone: '', address: '',
    make: '', model: '', year: '', color: '',
    engine_number: '', chassis_number: '',
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/vehicles', { ...form, year: parseInt(form.year) })
      toast.success('✅ Registration submitted successfully!')
      navigate('/staff')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        toast.error(errors[0]?.msg || 'Validation failed')
      } else {
        toast.error(err.response?.data?.error || 'Submission failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    { name: 'owner_name', label: "Owner's Full Name", type: 'text', placeholder: 'John Doe' },
    { name: 'national_id', label: 'National ID Number', type: 'text', placeholder: '12345678901' },
    { name: 'phone', label: 'Phone Number', type: 'text', placeholder: '08012345678' },
    { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main Street, Lagos' },
    { name: 'make', label: 'Vehicle Make', type: 'text', placeholder: 'Toyota' },
    { name: 'model', label: 'Vehicle Model', type: 'text', placeholder: 'Camry' },
    { name: 'year', label: 'Year', type: 'number', placeholder: '2022' },
    { name: 'color', label: 'Color', type: 'text', placeholder: 'Blue' },
    { name: 'engine_number', label: 'Engine Number', type: 'text', placeholder: 'ENG-001' },
    { name: 'chassis_number', label: 'Chassis Number', type: 'text', placeholder: 'CHS-001' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Vehicle Registration</h1>
          <p className="text-gray-500 text-sm mt-1">Submit a new vehicle for registration and plate assignment</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.name} className={f.name === 'address' ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label} *</label>
                <input
                  type={f.type}
                  name={f.name}
                  className="input-field"
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting...' : '✅ Submit Registration'}
              </button>
              <button type="button" onClick={() => navigate('/staff')} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}