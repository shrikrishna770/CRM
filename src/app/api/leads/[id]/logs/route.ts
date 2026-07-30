import { NextResponse } from 'next/server';
import { LeadLogService } from '@/services/leadLogService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const logs = await LeadLogService.getLogsByLeadId(id);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, creatorRole, creatorName, description, details } = body;

    if (creatorRole === 'support' || creatorRole === 'pending') {
      return NextResponse.json(
        { message: 'Access Denied: Support and Pending roles have read-only access.' },
        { status: 403 }
      );
    }


    if (!description) {
      return NextResponse.json(
        { message: 'Description is required' },
        { status: 400 }
      );
    }

    const log = await LeadLogService.createLog({
      leadId: id,
      type: type || 'manual_note',
      creatorRole: creatorRole || 'sales_rep',
      creatorName: creatorName || 'John Doe',
      description,
      details,
    });

    return NextResponse.json({
      message: 'Log added successfully',
      log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to create log' },
      { status: 500 }
    );
  }
}
