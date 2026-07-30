import { NextResponse } from 'next/server';
import { SettingsService } from '@/services/settingsService';
import { LeadService } from '@/services/leadService';
import { LeadLogService } from '@/services/leadLogService';

// GET verification for Meta Webhook
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode && token) {
      if (mode === 'subscribe') {
        const settings = await SettingsService.getSettings();
        if (token === settings.metaVerifyToken) {
          console.log('WEBHOOK_VERIFIED');
          // Respond with the challenge token as a plain text string
          return new Response(challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      }
    }
    return new Response('Forbidden', { status: 403 });
  } catch (error) {
    return new Response('Internal Server Error', { status: 500 });
  }
}

// POST endpoint for Meta Webhook events
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle simulation from our custom UI
    if (body.is_simulator && body.mock_lead_data) {
      const mockData = body.mock_lead_data;
      const createdLead = await LeadService.createLead({
        companyName: mockData.company || 'Simulated Meta Company',
        userName: mockData.name || 'Simulated Meta User',
        email: mockData.email || 'meta_simulated@example.com',
        phoneNumber: mockData.phone || '+1 (555) 000-0000',
        leadStatus: 'New',
        services: mockData.services || ['Meta Ads Campaign'],
        leadAssignDate: new Date().toISOString().split('T')[0],
        lastFollowDate: new Date().toISOString().split('T')[0],
        followUpStatus: 'Pending',
        remark: `Imported via Simulated Meta Ads webhook (Form ID: ${body.form_id || 'mock_form_123'})`,
      });

      // Create creation log
      await LeadLogService.createLog({
        leadId: createdLead.id,
        type: 'creation',
        creatorRole: 'admin',
        creatorName: 'Meta Webhook Simulator',
        description: `Lead generated from Meta Lead Ad Form`,
        details: `Email: ${createdLead.email}\nPhone: ${createdLead.phoneNumber}\nForm: Simulated Instant Form`,
      });

      return NextResponse.json({
        message: 'Simulated lead created successfully via webhook',
        lead: createdLead,
      });
    }

    // Process actual Meta Lead Ads payload
    const settings = await SettingsService.getSettings();
    const entry = body.entry || [];

    let leadsProcessed = 0;

    for (const e of entry) {
      const changes = e.changes || [];
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id;
          const formId = change.value.form_id;

          // Fetch fields from Meta Graph API
          const graphRes = await fetch(
            `https://graph.facebook.com/v20.0/${leadgenId}?access_token=${settings.metaAccessToken}`
          );

          if (graphRes.ok) {
            const leadData = await graphRes.json();
            
            // Extract standard fields
            let email = '';
            let name = '';
            let phone = '';
            let company = '';

            const fieldData = leadData.field_data || [];
            for (const field of fieldData) {
              const fieldName = field.name;
              const values = field.values || [];
              const value = values[0] || '';

              if (fieldName === 'email') email = value;
              else if (fieldName === 'full_name' || fieldName === 'name') name = value;
              else if (fieldName === 'phone_number' || fieldName === 'phone') phone = value;
              else if (fieldName === 'company_name' || fieldName === 'company') company = value;
            }

            // Save lead in CRM
            const createdLead = await LeadService.createLead({
              companyName: company || 'Meta Lead',
              userName: name || 'Meta Ads User',
              email: email || 'no-email-meta@crm.com',
              phoneNumber: phone || '',
              leadStatus: 'New',
              services: ['Meta Lead Gen'],
              leadAssignDate: new Date().toISOString().split('T')[0],
              lastFollowDate: new Date().toISOString().split('T')[0],
              followUpStatus: 'Pending',
              remark: `Imported via Meta Webhook (Leadgen ID: ${leadgenId}, Form ID: ${formId})`,
            });

            // Create log
            await LeadLogService.createLog({
              leadId: createdLead.id,
              type: 'creation',
              creatorRole: 'admin',
              creatorName: 'Meta Ads Webhook',
              description: `Lead created from Facebook Lead Ad`,
              details: `Lead ID: ${leadgenId}\nEmail: ${createdLead.email}\nPhone: ${createdLead.phoneNumber}`,
            });

            leadsProcessed++;
          }
        }
      }
    }

    return NextResponse.json({
      message: `Processed ${leadsProcessed} lead(s)`,
      processedCount: leadsProcessed,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
