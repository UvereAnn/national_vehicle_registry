import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();

const initialForm = {
  owner_name: '', national_id: '', phone: '', address: '',
  make: '', model: '', year: CURRENT_YEAR, color: '',
  engine_number: '', chassis_number: ''
};

const Field = ({ label, name, type = 'text', form, setForm, required = true, min, max, as }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {as === 'textarea' ? (
      <textarea
        className="input-field"
        rows={3}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        required={required}
      />
    ) : (
      <input
        type={type}
        className="input-field"
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        required={required}
        min={min}
        max={max}
      />
    )}
  </div>
);

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (id) {
      api.get(`/vehicles/${id}`).then(r => {
        const v = r.data;
        setForm({
          owner_name: v.owner_name, national_id: v.national_id, phone: v.phone,
          address: v.address, make: v.make, model: v.model, year: v.year,
          color: v.color, engine_number: v.engine_number, chassis_number: v.chassis_number
        });
      }).catch(() => toast.error('Failed to load registration')).finally(() => setFetching(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/vehicles/${id}`, form);
        toast.success('Registration updated successfully');
      } else {
        await api.post('/vehicles', form);
        toast.success('Registration submitted for approval!');
      }
      navigate('/staff/registrations');
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-700 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-primary-800 text-white px-6 py-4 flex items-center gap-4">
        <Link to="/staff" className="text-primary-200 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="font-bold text-lg">{id ? 'Edit Registration' : 'New Vehicle Registration'}</h1>
          <p className="text-primary-200 text-sm">National Vehicle Registry — Staff Portal</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="card">
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{id ? 'Update Vehicle Information' : 'Submit New Vehicle Registration'}</h2>
            <p className="text-gray-500 text-sm mt-1">All fields marked with * are required. Submitted registrations require admin approval.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-primary-700">Owner Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Owner Full Name" name="owner_name" form={form} setForm={setForm} />
                <Field label="National ID" name="national_id" form={form} setForm={setForm} />
                <Field label="Phone Number" name="phone" type="tel" form={form} setForm={setForm} />
                <div className="md:col-span-1">
                  <Field label="Address" name="address" form={form} setForm={setForm} as="textarea" />
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-primary-700">Vehicle Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Vehicle Make" name="make" form={form} setForm={setForm} />
                <Field label="Vehicle Model" name="model" form={form} setForm={setForm} />
                <Field label="Year" name="year" type="number" form={form} setForm={setForm} min={1900} max={CURRENT_YEAR + 1} />
                <Field label="Color" name="color" form={form} setForm={setForm} />
                <Field label="Engine Number" name="engine_number" form={form} setForm={setForm} />
                <Field label="Chassis Number" name="chassis_number" form={form} setForm={setForm} />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button type="submit" disabled={loading} className="btn-primary px-8 py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : id ? '💾 Update Registration' : '📤 Submit for Approval'}
              </button>
              <Link to="/staff" className="btn-outline px-8 py-3">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
