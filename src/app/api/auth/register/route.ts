import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required.' },
        { status: 400 }
      );
    }

    const users = await UserService.getUsers();
    const exists = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { message: 'This email is already registered in the CRM.' },
        { status: 400 }
      );
    }

    // Register user with a default 'pending' role
    // The admin will see them in the Users dashboard and can upgrade or modify their role
    const newUser = await UserService.createUser({
      name,
      email,
      role: 'pending',
    });


    return NextResponse.json({
      message: 'Access request submitted! Please ask a CRM Administrator to approve your email and assign your role.',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Failed to submit registration.' },
      { status: 500 }
    );
  }
}
