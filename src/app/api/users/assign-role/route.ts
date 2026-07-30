import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';
import { UserRole } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, role } = body as { email: string; role: UserRole };

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email and role are required' },
        { status: 400 }
      );
    }

    const updatedUser = await UserService.assignRole(email, role);

    return NextResponse.json({
      message: `Role '${role}' assigned to ${email} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to assign role' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const users = await UserService.getUsers();
  return NextResponse.json({ users });
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Safety check: protect super admin
    const users = await UserService.getUsers();
    const targetUser = users.find(u => u.id === id);
    if (targetUser && targetUser.email.toLowerCase() === 'shrikrishna24@navgurukul.org') {
      return NextResponse.json(
        { message: 'Cannot delete the super administrator' },
        { status: 400 }
      );
    }

    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return NextResponse.json(
        { message: 'User not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User removed from CRM successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
