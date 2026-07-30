export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
export type FollowUpStatus = 'Pending' | 'Scheduled' | 'Completed' | 'No Answer' | 'Needs Reschedule';

export interface Lead {
  id: string;
  companyName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  leadStatus: LeadStatus;
  services: string[];
  leadAssignDate: string;
  lastFollowDate: string;
  followUpStatus: FollowUpStatus;
  remark: string;
  createdAt: string;
  updatedAt: string;
}
