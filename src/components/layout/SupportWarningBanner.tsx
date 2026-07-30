'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export function SupportWarningBanner() {
  const { user } = useAuth();
  if (user?.role !== 'support') {
    return null;
  }
  return (
    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm shadow-md mb-6">
      <strong>Read-Only Mode:</strong> You are logged in with the Support role. You can view all information across this page, but you are not allowed to make edits, create items, or import data.
    </div>
  );
}
