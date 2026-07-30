export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'inactive';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyId?: string;
  companyName?: string;
  jobTitle?: string;
  status: ContactStatus;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}
