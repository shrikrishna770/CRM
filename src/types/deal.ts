export type DealStage = 
  | 'qualification'
  | 'needs_analysis'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  companyName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  leadId?: string;
  contactId?: string;
  companyId?: string;
  ownerId: string;
  expectedCloseDate?: string;
  probability: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
}
