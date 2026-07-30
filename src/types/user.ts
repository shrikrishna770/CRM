export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'support' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
