import { readJsonData, writeJsonData } from '@/lib/json-db';
import { connectToDatabase, MongoSettings } from '@/lib/mongodb';

export interface CrmSettings {
  companyName: string;
  supportEmail: string;
  defaultCurrency: string;
  metaAccessToken: string;
  metaVerifyToken: string;
  metaPageId: string;
}

export class SettingsService {
  private static FILENAME = 'settings.json';

  static async getSettings(): Promise<CrmSettings> {
    const defaultSettings: CrmSettings = {
      companyName: 'Acme Enterprise Workspace',
      supportEmail: 'support@acme.com',
      defaultCurrency: 'USD',
      metaAccessToken: 'mock_meta_access_token_abc123',
      metaVerifyToken: 'meta_verify_token_xyz789',
      metaPageId: '123456789012345',
    };

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const settings = await MongoSettings.findOne().lean();
        if (!settings) {
          // Seed default settings to MongoDB
          const seeded = new MongoSettings(defaultSettings);
          await seeded.save();
          return defaultSettings;
        }
        return {
          companyName: settings.companyName,
          supportEmail: settings.supportEmail,
          defaultCurrency: settings.defaultCurrency,
          metaAccessToken: settings.metaAccessToken || '',
          metaVerifyToken: settings.metaVerifyToken || '',
          metaPageId: settings.metaPageId || '',
        };
      } catch (err) {
        console.warn('MongoDB failed in getSettings. Falling back to JSON database:', err);
      }
    }

    try {
      const settings = await readJsonData<CrmSettings>(this.FILENAME);
      if (!settings || Object.keys(settings).length === 0) {
        await writeJsonData(this.FILENAME, defaultSettings);
        return defaultSettings;
      }
      return { ...defaultSettings, ...settings };
    } catch {
      await writeJsonData(this.FILENAME, defaultSettings);
      return defaultSettings;
    }
  }

  static async updateSettings(data: Partial<CrmSettings>): Promise<CrmSettings> {
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        let settings = await MongoSettings.findOne();
        if (!settings) {
          settings = new MongoSettings({
            companyName: 'Acme Enterprise Workspace',
            supportEmail: 'support@acme.com',
            defaultCurrency: 'USD',
            metaAccessToken: '',
            metaVerifyToken: '',
            metaPageId: '',
          });
        }
        Object.assign(settings, data);
        await settings.save();
        return {
          companyName: settings.companyName,
          supportEmail: settings.supportEmail,
          defaultCurrency: settings.defaultCurrency,
          metaAccessToken: settings.metaAccessToken || '',
          metaVerifyToken: settings.metaVerifyToken || '',
          metaPageId: settings.metaPageId || '',
        };
      } catch (err) {
        console.warn('MongoDB failed in updateSettings. Falling back to JSON database:', err);
      }
    }

    const current = await this.getSettings();
    const updated = { ...current, ...data };
    await writeJsonData(this.FILENAME, updated);
    return updated;
  }
}
