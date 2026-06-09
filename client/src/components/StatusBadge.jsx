import React from 'react';
export default function StatusBadge({ status }) {
  const key = status?.toLowerCase().replaceAll(' ', '-') || 'unknown';
  return <span className={`badge badge-${key}`}>{status}</span>;
}
