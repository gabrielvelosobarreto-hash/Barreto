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
      forceEmpty,
    } = body;

    const targetUsername = (username || 'barreto').trim().toLowerCase();
    let user = getUserAccount(targetUsername);

    if (!user) {
      const store = readServerStore();
      user = store.users['barreto'] || Object.values(store.users)[0] || null;
    }

    if (user) {
      // Proteção de Integridade: Só permite zerar dados se o usuário tiver confirmado explicitamente com forceEmpty: true
      if (sectors !== undefined) {
        if (Array.isArray(sectors) && sectors.length === 0 && Array.isArray(user.sectors) && user.sectors.length > 0 && !forceEmpty) {
          // Mantém os setores existentes no servidor para evitar perda por race condition
        } else {
          user.sectors = sectors;
        }
      }

      if (sectorItemsMap !== undefined) {
        const hasExistingItems = user.sectorItemsMap && Object.keys(user.sectorItemsMap).some(k => (user.sectorItemsMap as any)[k]?.length > 0);
        const incomingEmpty = !sectorItemsMap || Object.keys(sectorItemsMap).length === 0 || Object.values(sectorItemsMap).every((arr: any) => !arr || arr.length === 0);
        if (incomingEmpty && hasExistingItems && !forceEmpty) {
          // Mantém os itens existentes no servidor
        } else {
          user.sectorItemsMap = sectorItemsMap;
        }
      }

      if (shoppingItems !== undefined) {
        if (Array.isArray(shoppingItems) && shoppingItems.length === 0 && Array.isArray(user.shoppingItems) && user.shoppingItems.length > 0 && !forceEmpty) {
          // Mantém
        } else {
          user.shoppingItems = shoppingItems;
        }
      }

      if (priorityItems !== undefined) {
        if (Array.isArray(priorityItems) && priorityItems.length === 0 && Array.isArray(user.priorityItems) && user.priorityItems.length > 0 && !forceEmpty) {
          // Mantém
        } else {
          user.priorityItems = priorityItems;
        }
      }

      if (maintenances !== undefined) {
        if (Array.isArray(maintenances) && maintenances.length === 0 && Array.isArray(user.maintenances) && user.maintenances.length > 0 && !forceEmpty) {
          // Mantém
        } else {
          user.maintenances = maintenances;
        }
      }

      if (shoppingCategories !== undefined && Array.isArray(shoppingCategories) && shoppingCategories.length > 0) {
        user.shoppingCategories = shoppingCategories;
      }

      const saved = saveUserAccount(user);
      return NextResponse.json({
        success: true,
        store: saved,
        currentSectors: user.sectors,
        currentSectorItemsMap: user.sectorItemsMap,
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
