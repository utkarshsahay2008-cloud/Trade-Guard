import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore, saveDatabaseStore } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'LOGIN', email, password, fullName } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid Login ID / Email is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const store = getDatabaseStore();
    const cleanEmail = email.trim().toLowerCase();
    const formattedName = fullName && fullName.trim().length > 0 
      ? fullName.trim() 
      : cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');

    if (action === 'REGISTER') {
      const newUser = {
        id: `user_${Date.now()}`,
        email: cleanEmail,
        fullName: formattedName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.user = newUser;
      store.profile.userId = newUser.id;
      store.portfolio.userId = newUser.id;
      store.portfolio.name = `${formattedName}'s Portfolio`;
      saveDatabaseStore(store);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: newUser,
        portfolio: store.portfolio,
      });
    }

    // Default LOGIN
    store.user.email = cleanEmail;
    store.user.fullName = formattedName || store.user.fullName;
    store.user.updatedAt = new Date().toISOString();
    store.portfolio.name = `${store.user.fullName}'s Portfolio`;
    saveDatabaseStore(store);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: store.user,
      portfolio: store.portfolio,
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
