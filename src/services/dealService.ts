import { Deal } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';
import { connectToDatabase, MongoDeal } from '@/lib/mongodb';

export class DealService {
  private static FILENAME = 'deals.json';

  static async getDeals(): Promise<Deal[]> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const mongoDeals = await MongoDeal.find().sort({ createdAt: -1 }).lean();
        return mongoDeals.map((d: any) => ({
          id: d.id,
          leadId: d.leadId,
          title: d.title,
          value: d.value,
          currency: d.currency,
          stage: d.stage,
          companyName: d.companyName,
          userName: d.userName,
          email: d.email,
          phoneNumber: d.phoneNumber || '',
          ownerId: d.ownerId,
          probability: d.probability,
          expectedCloseDate: d.expectedCloseDate || '',
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
        }));
      } catch (err) {
        console.warn('MongoDB failed in getDeals. Falling back to JSON database:', err);
      }
    }

    return await readJsonData<Deal[]>(this.FILENAME);
  }

  static async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const id = `dl_${Date.now()}`;
        const newDeal = new MongoDeal({
          ...dealData,
          id,
        });
        const saved = await newDeal.save();
        return {
          ...dealData,
          id,
          createdAt: saved.createdAt ? new Date(saved.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: saved.updatedAt ? new Date(saved.updatedAt).toISOString() : new Date().toISOString(),
        };
      } catch (err) {
        console.warn('MongoDB failed in createDeal. Falling back to JSON database:', err);
      }
    }

    const deals = await this.getDeals();
    const newDeal: Deal = {
      ...dealData,
      id: `dl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deals.push(newDeal);
    await writeJsonData(this.FILENAME, deals);
    return newDeal;
  }

  static async updateDeal(id: string, updateData: Partial<Deal>): Promise<Deal | null> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const updated: any = await MongoDeal.findOneAndUpdate(
          { id },
          { $set: updateData },
          { new: true }
        ).lean();
        if (updated) {
          return {
            id: updated.id,
            leadId: updated.leadId,
            title: updated.title,
            value: updated.value,
            currency: updated.currency,
            stage: updated.stage,
            companyName: updated.companyName,
            userName: updated.userName,
            email: updated.email,
            phoneNumber: updated.phoneNumber || '',
            ownerId: updated.ownerId,
            probability: updated.probability,
            expectedCloseDate: updated.expectedCloseDate || '',
            createdAt: updated.createdAt ? new Date(updated.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: updated.updatedAt ? new Date(updated.updatedAt).toISOString() : new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB failed in updateDeal. Falling back to JSON database:', err);
      }
    }

    const deals = await this.getDeals();
    const index = deals.findIndex((d) => d.id === id);
    if (index < 0) return null;

    const updated = {
      ...deals[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    deals[index] = updated;
    await writeJsonData(this.FILENAME, deals);
    return updated;
  }

  static async deleteDeal(id: string): Promise<boolean> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const res = await MongoDeal.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (err) {
        console.warn('MongoDB failed in deleteDeal. Falling back to JSON database:', err);
      }
    }

    const deals = await this.getDeals();
    const filtered = deals.filter((d) => d.id !== id);
    if (filtered.length !== deals.length) {
      await writeJsonData(this.FILENAME, filtered);
      return true;
    }
    return false;
  }
}
