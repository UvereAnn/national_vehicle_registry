import React from 'react';

export default function StatusBadge({ status }) {
  const map = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected'
  };
  const icons = { pending: '⏳', approved: '✅', rejected: '❌' };
  return (
    <span className={map[status] || 'badge-pending'}>
      {icons[status]} {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
