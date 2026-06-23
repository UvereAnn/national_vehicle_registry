// frontend/src/components/common/ConfirmModal.jsx
import React from 'react'

export default function ConfirmModal({
  open, title, message, children,
  onConfirm, onCancel,
  confirmText = 'Confirm', confirmClass = 'btn-primary'
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        {message && <p className="text-gray-600 mb-4">{message}</p>}
        {children}
        <div className="flex gap-3 mt-4">
          <button onClick={onConfirm} className={confirmClass}>{confirmText}</button>
          <button onClick={onCancel} className="btn-outline">Cancel</button>
        </div>
      </div>
    </div>
  )
}