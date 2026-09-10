import { NextRequest, NextResponse } from 'next/server';
import { readServerStore, getUserAccount, saveUserAccount } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get('username') || 'barreto').trim().toLowerCase();
    const user = getUserAccount(username);

    if (user) {
      return NextResponse.json({
        success: true,
        sectors: user.sectors || null,
        sectorItemsMap: user.sectorItemsMap || null,
        shoppingItems: user.shoppingItems || null,
        priorityItems: user.priorityItems || null,
        maintenances: user.maintenances || null,
        shoppingCategories: user.shoppingCategories || null,
      });
    }

    const store = readServerStore();
    const defaultUser = store.users['barreto'];
    return NextResponse.json({
      success: true,
      sectors: defaultUser?.sectors || null,
      sectorItemsMap: defaultUser?.sectorItemsMap || null,
      shoppingItems: defaultUser?.shoppingItems || null,
      priorityItems: defaultUser?.priorityItems || null,
      maintenances: defaultUser?.maintenances || null,
      shoppingCategories: defaultUser?.shoppingCategories || null,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha ao ler dados do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      username,
      sectors,
      sectorItemsMap,
      shoppingItems,
      priorityItems,
      maintenances,
      shoppingCategories,
    } = body;

    const targetUsername = (username || 'barreto').trim().toLowerCase();
    const user = getUserAccount(targetUsername);

    if (user) {
      if (sectors !== undefined) user.sectors = sectors;
      if (sectorItemsMap !== undefined) user.sectorItemsMap = sectorItemsMap;
      if (shoppingItems !== undefined) user.shoppingItems = shoppingItems;
      if (priorityItems !== undefined) user.priorityItems = priorityItems;
      if (maintenances !== undefined) user.maintenances = maintenances;
      if (shoppingCategories !== undefined) user.shoppingCategories = shoppingCategories;

      const saved = saveUserAccount(user);
      return NextResponse.json({
        success: true,
        store: saved,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Usuário não localizado para salvar dados',
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar dados no servidor' },
      { status: 500 }
    );
  }
}
