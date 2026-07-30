import { LeadLog } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';
import { connectToDatabase, MongoLeadLog } from '@/lib/mongodb';

export class LeadLogService {
  private static FILENAME = 'lead_logs.json';

  static async getLogs(): Promise<LeadLog[]> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const mongoLogs = await MongoLeadLog.find().sort({ timestamp: -1 }).lean();
        return mongoLogs.map((l: any) => ({
          id: l.id,
          leadId: l.leadId,
          type: l.type as any,
          creatorRole: l.creatorRole as any,
          creatorName: l.creatorName,
          description: l.description,
          details: l.details || '',
          timestamp: l.timestamp,
        }));
      } catch (err) {
        console.warn('MongoDB failed in getLogs. Falling back to JSON database:', err);
      }
    }

    return await readJsonData<LeadLog[]>(this.FILENAME);
  }

  static async getLogsByLeadId(leadId: string): Promise<LeadLog[]> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const mongoLogs = await MongoLeadLog.find({ leadId }).sort({ timestamp: -1 }).lean();
        return mongoLogs.map((l: any) => ({
          id: l.id,
          leadId: l.leadId,
          type: l.type as any,
          creatorRole: l.creatorRole as any,
          creatorName: l.creatorName,
          description: l.description,
          details: l.details || '',
          timestamp: l.timestamp,
        }));
      } catch (err) {
        console.warn('MongoDB failed in getLogsByLeadId. Falling back to JSON database:', err);
      }
    }

    const logs = await this.getLogs();
    return logs
      .filter((l) => l.leadId === leadId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async createLog(logData: Omit<LeadLog, 'id' | 'timestamp'>): Promise<LeadLog> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const id = `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const timestamp = new Date().toISOString();
        const newLog = new MongoLeadLog({
          ...logData,
          id,
          timestamp,
        });
        await newLog.save();
        return {
          ...logData,
          id,
          timestamp,
        };
      } catch (err) {
        console.warn('MongoDB failed in createLog. Falling back to JSON database:', err);
      }
    }

    const logs = await this.getLogs();
    const newLog: LeadLog = {
      ...logData,
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    logs.push(newLog);
    await writeJsonData(this.FILENAME, logs);
    return newLog;
  }
}
