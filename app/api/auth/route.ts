import { NextRequest, NextResponse } from 'next/server';
import { readServerStore, writeServerStore } from '@/lib/serverStorage';

export async function GET() {
  try {
    const store = readServerStore();
    return NextResponse.json({
      success: true,
      authConfig: store.authConfig || null,
      basicProfile: store.basicProfile || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to read server auth store' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const store = readServerStore();

    if (action === 'verify-login') {
      const { pin } = body;
      const serverPin = store.authConfig?.pin;
      
      // If server has a pin configured:
      if (serverPin && serverPin === pin) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          authConfig: store.authConfig,
          basicProfile: store.basicProfile,
        });
      }

      // If server has default placeholder '1234' or no pin yet, and client entered something:
      // Also check if pin matches '1234'
      if (!serverPin && pin === '1234') {
        return NextResponse.json({
          success: true,
          authenticated: true,
          authConfig: store.authConfig || { name: 'Gabriel Veloso Barreto', pin: '1234', rememberMe: true },
          basicProfile: store.basicProfile,
        });
      }

      return NextResponse.json({
        success: false,
        authenticated: false,
        serverHasPin: Boolean(serverPin && serverPin !== '1234'),
        error: 'Senha incorreta',
      });
    }

    if (action === 'set-password' || action === 'reset-password') {
      const { newPin, newHint, name } = body;
      if (!newPin || typeof newPin !== 'string' || newPin.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Senha inválida' },
          { status: 400 }
        );
      }

      const updatedAuth = {
        name: name || store.authConfig?.name || 'Gabriel Veloso Barreto',
        pin: newPin.trim(),
        hint: newHint !== undefined ? newHint : store.authConfig?.hint || '',
        rememberMe: true,
      };

      writeServerStore({
        authConfig: updatedAuth,
      });

      return NextResponse.json({
        success: true,
        authConfig: updatedAuth,
      });
    }

    if (action === 'sync') {
      const { authConfig, basicProfile } = body;
      const updates: any = {};
      if (authConfig) updates.authConfig = authConfig;
      if (basicProfile) updates.basicProfile = basicProfile;

      const updated = writeServerStore(updates);
      return NextResponse.json({
        success: true,
        authConfig: updated.authConfig,
        basicProfile: updated.basicProfile,
      });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha no processamento de autenticação' },
      { status: 500 }
    );
  }
}
