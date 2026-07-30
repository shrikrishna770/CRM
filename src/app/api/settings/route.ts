import { NextResponse } from 'next/server';
import { SettingsService } from '@/services/settingsService';

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { role, ...settingsData } = body;

    if (role === 'support' || role === 'pending') {
      return NextResponse.json(
        { message: 'Access Denied: Support and Pending roles have read-only access.' },
        { status: 403 }
      );
    }

    const updated = await SettingsService.updateSettings(settingsData);
    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
