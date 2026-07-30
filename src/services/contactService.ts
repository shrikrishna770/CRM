import { Contact } from '@/types';
import { readJsonData, writeJsonData } from '@/lib/json-db';

export class ContactService {
  private static FILENAME = 'contacts.json';

  static async getContacts(): Promise<Contact[]> {
    return await readJsonData<Contact[]>(this.FILENAME);
  }

  static async createContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const contacts = await this.getContacts();
    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    contacts.push(newContact);
    await writeJsonData(this.FILENAME, contacts);
    return newContact;
  }

  static async updateContact(id: string, updateData: Partial<Contact>): Promise<Contact | null> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index < 0) return null;

    const updated = {
      ...contacts[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    contacts[index] = updated;
    await writeJsonData(this.FILENAME, contacts);
    return updated;
  }

  static async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length !== contacts.length) {
      await writeJsonData(this.FILENAME, filtered);
      return true;
    }
    return false;
  }
}
