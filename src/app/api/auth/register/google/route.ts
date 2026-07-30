import { NextResponse } from 'next/server';
import { UserService } from '@/services/userService';

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { message: 'Google credential token is required.' },
        { status: 400 }
      );
    }

    let email: string;
    let name: string | undefined;
    let picture: string | undefined;

    if (process.env.NODE_ENV !== 'production' && credential.startsWith('mock_google_token_')) {
      const mockEmail = credential.replace('mock_google_token_', '');
      email = mockEmail;
      name = mockEmail.split('@')[0].replace(/[\._\-]/g, ' ');
      picture = '';
    } else {
      // Call Google's tokeninfo API to securely verify the signature & expiry of the ID Token
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );

      if (!verifyRes.ok) {
        return NextResponse.json(
          { message: 'Invalid or expired Google Authentication token.' },
          { status: 401 }
        );
      }

      const payload = await verifyRes.json();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    if (!email) {
      return NextResponse.json(
        { message: 'Failed to retrieve email from Google Account.' },
        { status: 400 }
      );
    }

    // Check if the user already exists in the system
    const users = await UserService.getUsers();
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      if (existingUser.role === 'pending') {
        return NextResponse.json(
          { message: `Your access request for '${email}' is already pending administrator approval. Please wait for an Admin to assign your role.` },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { message: `This email is already registered and active in the CRM. Please go to the Login page to sign in.` },
          { status: 400 }
        );
      }
    }

    // Create a new user with pending status
    const newUser = await UserService.createUser({
      name: name || email.split('@')[0].replace(/[\._\-]/g, ' '),
      email,
      role: 'pending',
    });

    // Update their profile avatar dynamically if provided by Google
    if (picture) {
      await UserService.updateUserProfile(
        email,
        name || newUser.name,
        picture
      );
    }

    return NextResponse.json({
      message: 'Access request submitted successfully! Please ask a CRM Administrator to approve your email and assign your role.',
      user: {
        ...newUser,
        avatarUrl: picture || '',
      },
    });
  } catch (error: any) {
    console.error('Google Register API Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal server error during Google registration.' },
      { status: 500 }
    );
  }
}
