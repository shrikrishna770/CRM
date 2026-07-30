'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface HideForRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function HideForRole({ roles, children }: HideForRoleProps) {
  const { user } = useAuth();
  if (user && roles.includes(user.role)) {
    return null;
  }
  return <>{children}</>;
}
