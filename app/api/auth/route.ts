import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseStore, saveDatabaseStore } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = 'LOGIN', email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Login ID / Email and Password are required' },
        { status: 400 }
      );
    }

    const store = getDatabaseStore();

    if (action === 'REGISTER') {
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.user = newUser;
      store.portfolio.userId = newUser.id;
      saveDatabaseStore(store);

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: newUser,
        portfolio: store.portfolio,
      });
    }

    // Default LOGIN
    // For demo convenience, accept password or match default user
    if (email.toLowerCase() === store.user.email.toLowerCase() || email.length > 3) {
      // Update user details if new login ID provided
      if (email.toLowerCase() !== store.user.email.toLowerCase()) {
        store.user.email = email;
        store.user.fullName = fullName || email.split('@')[0];
        saveDatabaseStore(store);
      }

      return NextResponse.json({
        success: true,
        message: 'Logged in successfully',
        user: store.user,
        portfolio: store.portfolio,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid login ID or password' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
