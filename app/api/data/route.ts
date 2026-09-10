import { NextRequest, NextResponse } from 'next/server';
import { readServerStore, writeServerStore } from '@/lib/serverStorage';

export async function GET() {
  try {
    const store = readServerStore();
    return NextResponse.json({
      success: true,
      sectors: store.sectors || null,
      sectorItemsMap: store.sectorItemsMap || null,
      shoppingItems: store.shoppingItems || null,
      priorityItems: store.priorityItems || null,
      maintenances: store.maintenances || null,
      shoppingCategories: store.shoppingCategories || null,
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
      sectors,
      sectorItemsMap,
      shoppingItems,
      priorityItems,
      maintenances,
      shoppingCategories,
    } = body;

    const updates: any = {};
    if (sectors !== undefined) updates.sectors = sectors;
    if (sectorItemsMap !== undefined) updates.sectorItemsMap = sectorItemsMap;
    if (shoppingItems !== undefined) updates.shoppingItems = shoppingItems;
    if (priorityItems !== undefined) updates.priorityItems = priorityItems;
    if (maintenances !== undefined) updates.maintenances = maintenances;
    if (shoppingCategories !== undefined) updates.shoppingCategories = shoppingCategories;

    const updated = writeServerStore(updates);
    return NextResponse.json({
      success: true,
      store: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Falha ao salvar dados no servidor' },
      { status: 500 }
    );
  }
}
