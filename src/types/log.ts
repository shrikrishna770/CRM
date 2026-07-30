import { UserRole } from './user';

export interface LeadLog {
  id: string;
  leadId: string;
  type: 'status_change' | 'followup_change' | 'remark_change' | 'field_update' | 'manual_note' | 'creation' | 'deal_converted';
  creatorRole: UserRole;
  creatorName: string;
  description: string;
  details?: string;
  timestamp: string;
}

