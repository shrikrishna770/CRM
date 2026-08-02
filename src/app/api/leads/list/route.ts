import { NextResponse } from 'next/server';
import { LeadService } from '@/services/leadService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await LeadService.getLeads();
    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
