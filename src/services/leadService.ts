import { Lead } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';
import { connectToDatabase, MongoLead } from '@/lib/mongodb';

export class LeadService {
  private static FILENAME = 'leads.json';

  static async getLeads(): Promise<Lead[]> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const mongoLeads = await MongoLead.find().sort({ createdAt: -1 }).lean();
        return mongoLeads.map((l: any) => ({
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
        }));
      } catch (err) {
        console.warn('MongoDB failed in getLeads. Falling back to JSON database:', err);
      }
    }

    return await readJsonData<Lead[]>(this.FILENAME);
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const lead: any = await MongoLead.findOne({ id }).lean();
        if (lead) {
          return {
            id: lead.id,
            companyName: lead.companyName,
            userName: lead.userName,
            email: lead.email,
            phoneNumber: lead.phoneNumber || '',
            services: lead.services || [],
            leadStatus: lead.leadStatus,
            leadAssignDate: lead.leadAssignDate || '',
            lastFollowDate: lead.lastFollowDate || '',
            followUpStatus: lead.followUpStatus,
            remark: lead.remark || '',
            createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: lead.updatedAt ? new Date(lead.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB failed in getLeadById. Falling back to JSON database:', err);
      }
    }

    const leads = await this.getLeads();
    return leads.find((l) => l.id === id) || null;
  }

  static async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const id = `ld_${Date.now()}`;
        const newLead = new MongoLead({
          ...leadData,
          id,
        });
        const saved = await newLead.save();
        return {
          ...leadData,
          id,
          createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: saved.updatedAt ? new Date(saved.updatedAt).toISOString() : new Date().toISOString(),
        };
      } catch (err) {
        console.warn('MongoDB failed in createLead. Falling back to JSON database:', err);
      }
    }

    const leads = await this.getLeads();
    const newLead: Lead = {
      ...leadData,
      id: `ld_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leads.push(newLead);
    await writeJsonData(this.FILENAME, leads);
    return newLead;
  }

  static async updateLead(id: string, updateData: Partial<Lead>): Promise<Lead | null> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const updated: any = await MongoLead.findOneAndUpdate(
          { id },
          { $set: updateData },
          { new: true }
        ).lean();
        if (updated) {
          return {
            id: updated.id,
            companyName: updated.companyName,
            userName: updated.userName,
            email: updated.email,
            phoneNumber: updated.phoneNumber || '',
            services: updated.services || [],
            leadStatus: updated.leadStatus,
            leadAssignDate: updated.leadAssignDate || '',
            lastFollowDate: updated.lastFollowDate || '',
            followUpStatus: updated.followUpStatus,
            remark: updated.remark || '',
            createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB failed in updateLead. Falling back to JSON database:', err);
      }
    }

    const leads = await this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index < 0) return null;

    const updatedLead: Lead = {
      ...leads[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    leads[index] = updatedLead;
    await writeJsonData(this.FILENAME, leads);
    return updatedLead;
  }
}
