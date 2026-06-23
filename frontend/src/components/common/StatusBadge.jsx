// frontend/src/components/common/StatusBadge.jsx
import React from 'react'

const config = {
  pending:  { label: 'Pending',  classes: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', classes: 'bg-green-100 text-green-800'  },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-800'     },
}

export default function StatusBadge({ status }) {
  const { label, classes } = config[status] || { label: status, classes: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${classes}`}>
      {label}
    </span>
  )
}