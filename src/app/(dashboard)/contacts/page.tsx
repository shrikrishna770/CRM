import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { ContactService } from '@/services/contactService';
import { SupportWarningBanner } from '@/components/layout/SupportWarningBanner';
import { HideForRole } from '@/components/layout/HideForRole';

export const revalidate = 0;

export default async function ContactsPage() {
  const contacts = await ContactService.getContacts();

  return (
    <div className="space-y-8">
      <SupportWarningBanner />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Contacts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage customer contacts, leads, and client accounts.</p>
        </div>
        <HideForRole roles={['support']}>
          <Button variant="primary">+ Add Contact</Button>
        </HideForRole>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800/80 text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-medium">Name</th>
                <th className="px-6 py-3.5 font-medium">Title & Company</th>
                <th className="px-6 py-3.5 font-medium">Email</th>
                <th className="px-6 py-3.5 font-medium">Phone</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-200">{contact.firstName} {contact.lastName}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-200">{contact.jobTitle}</div>
                    <div className="text-xs text-slate-400">{contact.companyName}</div>
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-mono text-xs">{contact.email}</td>
                  <td className="px-6 py-4 text-slate-400">{contact.phone}</td>
                  <td className="px-6 py-4">
                    <Badge variant={contact.status === 'customer' ? 'success' : contact.status === 'prospect' ? 'info' : 'warning'}>
                      {contact.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
