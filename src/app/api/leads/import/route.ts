import { NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '@/lib/json-db';
import { Lead } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role } = body;

    if (role === 'support' || role === 'pending') {
      return NextResponse.json(
        { message: 'Access Denied: Support and Pending roles have read-only access.' },
        { status: 403 }
      );
    }

    const newLeads = body.leads;

    if (!Array.isArray(newLeads) || newLeads.length === 0) {
      return NextResponse.json(
        { message: 'Invalid or empty leads array provided' },
        { status: 400 }
      );
    }

    const existingLeads = await readJsonData<Lead[]>('leads.json');
    const now = new Date().toISOString();

    const createdLeads: Lead[] = newLeads.map((item: any, index: number) => {
      const id = `ld_${Date.now()}_${index}`;
      return {
        id,
        companyName: item.companyName || item['Company Name'] || 'Unknown Company',
        userName: item.userName || item['User Name'] || 'Unknown User',
        email: item.email || item['Email'] || 'no-email@crm.com',
        phoneNumber: item.phoneNumber || item['Phone Number'] || '',
        leadStatus: item.leadStatus || item['Lead Status'] || 'New',
        services: Array.isArray(item.services)
          ? item.services
          : (item.services || item['Services'] || '')
              .split(/[,;]/)
              .map((s: string) => s.trim())
              .filter(Boolean),
        leadAssignDate: item.leadAssignDate || item['Lead Assign Date'] || now.split('T')[0],
        lastFollowDate: item.lastFollowDate || item['Last Follow Date'] || now.split('T')[0],
        followUpStatus: item.followUpStatus || item['Follow Up Status'] || 'Pending',
        remark: item.remark || item['Remark'] || item['Remarks'] || 'Imported via CSV/Excel',
        createdAt: now,
        updatedAt: now,
      };
    });

    const updatedLeads = [...createdLeads, ...existingLeads];
    await writeJsonData('leads.json', updatedLeads);

    return NextResponse.json({
      message: `Successfully imported ${createdLeads.length} lead(s)`,
      importedCount: createdLeads.length,
      leads: createdLeads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to import CSV/Excel leads' },
      { status: 500 }
    );
  }
}
