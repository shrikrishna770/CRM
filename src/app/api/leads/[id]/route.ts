import { NextResponse } from 'next/server';
import { LeadService } from '@/services/leadService';
import { LeadLogService } from '@/services/leadLogService';
import { UserRole, Lead } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await LeadService.getLeadById(id);
  if (!lead) {
    return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, data } = body as { role: UserRole; data: Partial<Lead> };

    if (role === 'support' || role === 'pending') {
      return NextResponse.json(
        { message: 'Access Denied: Support and Pending roles have read-only access.' },
        { status: 403 }
      );
    }

    const existingLead = await LeadService.getLeadById(id);
    if (!existingLead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    let allowedUpdates: Partial<Lead> = {};

    if (role === 'admin') {
      // Admin can update all fields
      allowedUpdates = { ...data };
    } else {
      // Regular users can ONLY update leadStatus, followUpStatus, and remark
      allowedUpdates = {
        leadStatus: data.leadStatus ?? existingLead.leadStatus,
        followUpStatus: data.followUpStatus ?? existingLead.followUpStatus,
        remark: data.remark ?? existingLead.remark,
      };
    }

    const updatedLead = await LeadService.updateLead(id, allowedUpdates);

    if (updatedLead) {
      const creatorName = role === 'admin' ? 'Admin User' : 'John Doe';

      // 1. Status Change Log
      if (allowedUpdates.leadStatus && allowedUpdates.leadStatus !== existingLead.leadStatus) {
        await LeadLogService.createLog({
          leadId: id,
          type: 'status_change',
          creatorRole: role,
          creatorName,
          description: `Lead status updated to ${allowedUpdates.leadStatus}`,
          details: `${existingLead.leadStatus} → ${allowedUpdates.leadStatus}`,
        });
      }

      // 2. Follow-Up Status Change Log
      if (allowedUpdates.followUpStatus && allowedUpdates.followUpStatus !== existingLead.followUpStatus) {
        await LeadLogService.createLog({
          leadId: id,
          type: 'followup_change',
          creatorRole: role,
          creatorName,
          description: `Follow-up status updated to ${allowedUpdates.followUpStatus}`,
          details: `${existingLead.followUpStatus} → ${allowedUpdates.followUpStatus}`,
        });
      }

      // 3. Remark Change Log
      if (allowedUpdates.remark !== undefined && allowedUpdates.remark !== existingLead.remark) {
        await LeadLogService.createLog({
          leadId: id,
          type: 'remark_change',
          creatorRole: role,
          creatorName,
          description: allowedUpdates.remark ? 'Activity notes / remarks updated' : 'Cleared activity notes',
          details: allowedUpdates.remark || undefined,
        });
      }

      // 4. Admin field updates
      if (role === 'admin') {
        const fieldsToCheck: (keyof Lead)[] = [
          'companyName',
          'userName',
          'email',
          'phoneNumber',
          'services',
          'leadAssignDate',
          'lastFollowDate',
        ];
        const changedFields: string[] = [];
        for (const field of fieldsToCheck) {
          if (allowedUpdates[field] !== undefined) {
            const oldVal = JSON.stringify(existingLead[field]);
            const newVal = JSON.stringify(allowedUpdates[field]);
            if (oldVal !== newVal) {
              changedFields.push(field);
            }
          }
        }
        if (changedFields.length > 0) {
          const readableFields = changedFields.map((f) => {
            return f.replace(/([A-Z])/g, ' $1').toLowerCase();
          });
          await LeadLogService.createLog({
            leadId: id,
            type: 'field_update',
            creatorRole: role,
            creatorName,
            description: `Updated lead contact information`,
            details: `Changed fields: ${readableFields.join(', ')}`,
          });
        }
      }
    }

    return NextResponse.json({
      message: role === 'admin' ? 'Lead updated successfully by Admin' : 'Lead status & remarks updated successfully',
      lead: updatedLead,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

