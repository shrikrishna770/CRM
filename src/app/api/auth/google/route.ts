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

    // Check if the user has been registered in the system
    const users = await UserService.getUsers();
    const registeredUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!registeredUser) {
      return NextResponse.json(
        { message: `Access Denied: The email '${email}' is not whitelisted by an Admin. Please contact your CRM administrator to request access.` },
        { status: 403 }
      );
    }

    // Check if the user's role is pending approval
    if (registeredUser.role === 'pending') {
      return NextResponse.json(
        { message: `Access Denied: Your registration request for '${email}' is pending administrator approval. Please wait for an Admin to assign your role.` },
        { status: 403 }
      );
    }

    // Update their profile name and profile avatar dynamically from Google
    const updatedUser = await UserService.updateUserProfile(
      email,
      name || registeredUser.name,
      picture || ''
    );

    return NextResponse.json({
      message: 'Login successful',
      user: updatedUser || registeredUser,
    });
  } catch (error: any) {
    console.error('Google OAuth API Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
