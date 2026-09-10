import { NextRequest, NextResponse } from 'next/server';
import { readServerStore, writeServerStore, getUserAccount, saveUserAccount, UserAccount } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const store = readServerStore();
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username') || 'barreto';
    const user = getUserAccount(username) || store.users['barreto'];

    const availableUsers = Object.keys(store.users).map((key) => ({
      username: store.users[key].username,
      name: store.users[key].name,
      residenceName: store.users[key].basicProfile?.residenceName || '',
    }));

    return NextResponse.json({
      success: true,
      user: user || null,
      availableUsers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha ao consultar autenticação no servidor' },
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
      const inputUsername = (body.username || 'barreto').trim().toLowerCase();
      const inputPin = (body.pin || '').trim();

      const user = getUserAccount(inputUsername);

      if (!user) {
        return NextResponse.json({
          success: false,
          authenticated: false,
          notFound: true,
          error: `Usuário "${body.username}" não encontrado. Verifique o usuário digitado ou crie um novo perfil.`,
        });
      }

      // Check if password matches
      if (user.pin === inputPin) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user,
        });
      }

      // Also allow '1234' fallback if user has default '1234'
      if (user.pin === '1234' && inputPin === '1234') {
        return NextResponse.json({
          success: true,
          authenticated: true,
          user,
        });
      }

      return NextResponse.json({
        success: false,
        authenticated: false,
        error: `Senha incorreta para o usuário "${user.name || user.username}".`,
      });
    }

    if (action === 'register-user' || action === 'set-password' || action === 'reset-password') {
      const username = (body.username || 'barreto').trim().toLowerCase();
      const newPin = (body.newPin || body.pin || '').trim();
      const fullName = (body.name || body.fullName || '').trim();
      const residenceName = (body.residenceName || 'Arniqueiras').trim();
      const residenceType = (body.residenceType || 'Casa').trim();
      const newHint = body.newHint || body.hint || '';

      if (!newPin || newPin.length < 4) {
        return NextResponse.json(
          { success: false, error: 'A senha deve conter no mínimo 4 dígitos/caracteres.' },
          { status: 400 }
        );
      }

      const existingUser = getUserAccount(username);
      const userToSave: UserAccount = {
        username,
        name: fullName || existingUser?.name || 'Gabriel Veloso Barreto',
        pin: newPin,
        hint: newHint,
        rememberMe: true,
        basicProfile: {
          fullName: fullName || existingUser?.basicProfile?.fullName || 'Gabriel Veloso Barreto',
          residenceName: residenceName || existingUser?.basicProfile?.residenceName || 'Arniqueiras',
          residenceType: residenceType || existingUser?.basicProfile?.residenceType || 'Casa',
          phone: existingUser?.basicProfile?.phone || '',
          cityState: existingUser?.basicProfile?.cityState || 'Brasília - DF',
          address: existingUser?.basicProfile?.address || '',
          notes: existingUser?.basicProfile?.notes || '',
          isCompleted: true,
          completedAt: new Date().toISOString(),
        },
        sectors: existingUser?.sectors || [],
        sectorItemsMap: existingUser?.sectorItemsMap || {},
        shoppingItems: existingUser?.shoppingItems || [],
        priorityItems: existingUser?.priorityItems || [],
        maintenances: existingUser?.maintenances || [],
        shoppingCategories: existingUser?.shoppingCategories || [],
      };

      const saved = saveUserAccount(userToSave);

      return NextResponse.json({
        success: true,
        user: saved,
      });
    }

    if (action === 'sync-user') {
      const { username, authConfig, basicProfile, data } = body;
      const targetUser = (username || authConfig?.username || 'barreto').trim().toLowerCase();
      const existing = getUserAccount(targetUser);

      if (existing) {
        if (authConfig?.pin) existing.pin = authConfig.pin;
        if (authConfig?.name) existing.name = authConfig.name;
        if (authConfig?.hint !== undefined) existing.hint = authConfig.hint;
        if (basicProfile) existing.basicProfile = { ...existing.basicProfile, ...basicProfile };
        if (data?.sectors) existing.sectors = data.sectors;
        if (data?.sectorItemsMap) existing.sectorItemsMap = data.sectorItemsMap;
        if (data?.shoppingItems) existing.shoppingItems = data.shoppingItems;
        if (data?.priorityItems) existing.priorityItems = data.priorityItems;
        if (data?.maintenances) existing.maintenances = data.maintenances;
        if (data?.shoppingCategories) existing.shoppingCategories = data.shoppingCategories;

        const saved = saveUserAccount(existing);
        return NextResponse.json({ success: true, user: saved });
      } else {
        const newUser: UserAccount = {
          username: targetUser,
          name: authConfig?.name || basicProfile?.fullName || 'Gabriel Veloso Barreto',
          pin: authConfig?.pin || '1234',
          hint: authConfig?.hint || '',
          rememberMe: true,
          basicProfile: basicProfile || {
            fullName: 'Gabriel Veloso Barreto',
            residenceName: 'Arniqueiras',
            residenceType: 'Casa',
            isCompleted: true,
            completedAt: new Date().toISOString(),
          },
          sectors: data?.sectors || [],
          sectorItemsMap: data?.sectorItemsMap || {},
          shoppingItems: data?.shoppingItems || [],
          priorityItems: data?.priorityItems || [],
          maintenances: data?.maintenances || [],
          shoppingCategories: data?.shoppingCategories || [],
        };
        const saved = saveUserAccount(newUser);
        return NextResponse.json({ success: true, user: saved });
      }
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha no processamento de autenticação' },
      { status: 500 }
    );
  }
}
