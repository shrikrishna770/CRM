import { NextResponse } from 'next/server';
import { LeadService } from '@/services/leadService';

export const dynamic = 'force-dynamic';

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

    const now = new Date().toISOString();
    const createdLeads = [];

    for (const item of newLeads) {
      const services = Array.isArray(item.services)
        ? item.services
        : (item.services || item['Services'] || '')
            .split(/[,;]/)
            .map((s: string) => s.trim())
            .filter(Boolean);

      const lead = await LeadService.createLead({
        companyName: item.companyName || item['Company Name'] || 'Unknown Company',
        userName: item.userName || item['User Name'] || 'Unknown User',
        email: item.email || item['Email'] || 'no-email@crm.com',
        phoneNumber: item.phoneNumber || item['Phone Number'] || '',
        leadStatus: item.leadStatus || item['Lead Status'] || 'New',
        services,
        leadAssignDate: item.leadAssignDate || item['Lead Assign Date'] || now.split('T')[0],
        lastFollowDate: item.lastFollowDate || item['Last Follow Date'] || now.split('T')[0],
        followUpStatus: item.followUpStatus || item['Follow Up Status'] || 'Pending',
        remark: item.remark || item['Remark'] || item['Remarks'] || 'Imported via CRM',
      });

      createdLeads.push(lead);
    }

    return NextResponse.json({
      message: `Successfully imported ${createdLeads.length} lead(s)`,
      importedCount: createdLeads.length,
      leads: createdLeads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to import leads' },
      { status: 500 }
    );
  }
}
