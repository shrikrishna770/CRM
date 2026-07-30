import { NextResponse } from 'next/server';
import { DealService } from '@/services/dealService';
import { LeadLogService } from '@/services/leadLogService';
import { Deal } from '@/types';

export async function GET() {
  try {
    const deals = await DealService.getDeals();
    return NextResponse.json({ deals });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, ...dealData } = body;

    if (role === 'support' || role === 'pending') {
      return NextResponse.json(
        { message: 'Access Denied: Support and Pending roles have read-only access.' },
        { status: 403 }
      );
    }

    if (!dealData.title || !dealData.value) {
      return NextResponse.json(
        { message: 'Deal title and value are required' },
        { status: 400 }
      );
    }

    const newDeal = await DealService.createDeal({
      title: dealData.title,
      value: Number(dealData.value) || 0,
      currency: dealData.currency || 'USD',
      stage: dealData.stage || 'closed_won',
      companyName: dealData.companyName || '',
      userName: dealData.userName || '',
      email: dealData.email || '',
      phoneNumber: dealData.phoneNumber || '',
      leadId: dealData.leadId,
      ownerId: dealData.ownerId || 'usr_1',
      probability: dealData.probability ?? 100,
      expectedCloseDate: dealData.expectedCloseDate || new Date().toISOString(),
    });

    if (dealData.leadId) {
      await LeadLogService.createLog({
        leadId: dealData.leadId,
        type: 'deal_converted',
        creatorRole: 'admin',
        creatorName: 'Admin User',
        description: `Converted lead into sales deal: ${dealData.title}`,
        details: `Value: $${dealData.value}`,
      });
    }

    return NextResponse.json({
      message: 'Deal created successfully',
      deal: newDeal,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to create deal' },
      { status: 500 }
    );
  }
}
