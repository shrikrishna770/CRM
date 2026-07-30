import { Company } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';

export class CompanyService {
  private static FILENAME = 'companies.json';

  static async getCompanies(): Promise<Company[]> {
    return await readJsonData<Company[]>(this.FILENAME);
  }

  static async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const companies = await this.getCompanies();
    const newCompany: Company = {
      ...companyData,
      id: `cmp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    await writeJsonData(this.FILENAME, companies);
    return newCompany;
  }
}
