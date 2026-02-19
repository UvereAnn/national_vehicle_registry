import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmClass = 'btn-primary', children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        {message && <p className="text-gray-600 mb-4">{message}</p>}
        {children}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-outline">Cancel</button>
          <button onClick={onConfirm} className={confirmClass}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
