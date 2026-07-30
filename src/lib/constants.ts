export const APP_NAME = 'CRM Workspace';

export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Contacts', href: '/contacts', icon: 'Users' },
  { name: 'Companies', href: '/companies', icon: 'Building2' },
  { name: 'Deals', href: '/deals', icon: 'Kanban' },
  { name: 'Leads', href: '/leads', icon: 'UserPlus' },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { name: 'User Roles', href: '/admin/users', icon: 'ShieldCheck' },
  { name: 'Settings', href: '/settings', icon: 'Settings' },
];

export const USER_ROLES = [
  { id: 'admin', label: 'Admin', description: 'Full access to all CRM resources & settings' },
  { id: 'manager', label: 'Manager', description: 'Can manage pipeline, deals, and reports' },
  { id: 'sales_rep', label: 'Sales Rep', description: 'Can manage contacts, deals, and tasks' },
  { id: 'support', label: 'Support', description: 'Read-only view of customer accounts' },
  { id: 'pending', label: 'Pending Approval', description: 'Access requested, awaiting administrator review' },
] as const;



export const DEAL_STAGES = [
  { id: 'qualification', label: 'Qualification' },
  { id: 'needs_analysis', label: 'Needs Analysis' },
  { id: 'proposal', label: 'Proposal Sent' },
  { id: 'negotiation', label: 'In Negotiation' },
  { id: 'closed_won', label: 'Closed Won' },
  { id: 'closed_lost', label: 'Closed Lost' },
] as const;
