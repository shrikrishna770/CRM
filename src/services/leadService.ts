import { Lead } from '@/types';
import { connectToDatabase, MongoLead } from '@/lib/mongodb';

const mapLead = (l: any): Lead => ({
  id: l.id,
  companyName: l.companyName,
  userName: l.userName,
  email: l.email,
  phoneNumber: l.phoneNumber || '',
  services: l.services || [],
  leadStatus: l.leadStatus,
  leadAssignDate: l.leadAssignDate || '',
  lastFollowDate: l.lastFollowDate || '',
  followUpStatus: l.followUpStatus,
  remark: l.remark || '',
  createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
  updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
});

export class LeadService {
  static async getLeads(): Promise<Lead[]> {
    await connectToDatabase();
    const leads = await MongoLead.find().sort({ createdAt: -1 }).lean();
    return leads.map(mapLead);
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    await connectToDatabase();
    const lead = await MongoLead.findOne({ id }).lean();
    return lead ? mapLead(lead) : null;
  }

  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    await connectToDatabase();
    const id = `ld_${Date.now()}`;
    const newLead = new MongoLead({ ...leadData, id });
    const saved = await newLead.save();
    return mapLead({ ...leadData, id, createdAt: saved.createdAt, updatedAt: saved.updatedAt });
  }

  static async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    await connectToDatabase();
    const updated = await MongoLead.findOneAndUpdate(
      { id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? mapLead(updated) : null;
  }

  static async deleteLead(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await MongoLead.deleteOne({ id });
    return result.deletedCount > 0;
  }
}
