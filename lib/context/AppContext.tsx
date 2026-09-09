"use client"
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export type PriorityType = 'Alta' | 'Média' | 'Baixa';
export type ThemeMode = 'light' | 'dark';

export type MaintenancePriority = 'Crítica' | 'Alta' | 'Média' | 'Baixa';
export type MaintenanceType = 'Preventiva' | 'Corretiva' | 'Melhoria';
export type MaintenanceStatus = 'Pendente' | 'Em Andamento' | 'Concluída';
export type MaintenancePeriodicity = 'Única' | 'Mensal' | 'Bimestral' | 'Semestral' | 'Anual';

export interface MaintenanceSubitem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  purchased: boolean;
  sentToShoppingList?: boolean;
}

export interface MaintenanceSubgroup {
  id: string;
  title: string;
  items: MaintenanceSubitem[];
}

export interface MaintenanceChecklistStep {
  id: string;
  text: string;
  completed: boolean;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  sector: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  dueDate: string;
  periodicity: MaintenancePeriodicity;
  responsible: string;
  description: string;
  hasBudget: boolean;
  laborCost: number;
  otherCosts: number;
  isPaid?: boolean;
  hasItemsToBuy: boolean;
  itemSubgroups: MaintenanceSubgroup[];
  checklist: MaintenanceChecklistStep[];
}

export interface SectorItem {
  id: number;
  name: string;
  desc: string;
  price: string;
  date: string;
  priority: 'Alta' | 'Média' | 'Baixa' | string;
}

export interface Sector {
  id: number;
  name: string;
  desc: string;
  items: number;
  cost: string;
  iconId: string;
  colorId: string;
}

export interface ShoppingItem {
  id: number;
  name: string;
  price: string;
  numPrice: number;
  priority: PriorityType;
  category: string;
  iconId: string;
  checked: boolean;
}

export interface PriorityItem {
  id: number;
  name: string;
  category?: string;
  price: string;
  numPrice: number;
  img: string;
  qty: number;
  priority: PriorityType;
}

const FILTER_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCT4JVy2QYtBYNeSK0tcgqaJ-yFmDtSkdhC6Bwsc_pfoSksrfT7AWr0dNTBjLITm4IyuZYX7kuqkVQXaItletFxRHAnIwE5AGN4y__0NOeuGoGUj6EO9EQ4092ZNAZn7ec7XsnXOCYLEswAFNN44918KeFUN67s4d_AB-WkFReHYLlgNwlfLncp5r-J0LxlgiNknQrCKOD9dXy8-nv5QnjAAoGpRuBGNhi0PtDnlEDqnBxexK5wIQVzHQ";
const BULBS_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuDmTJ2k9FgnN_jhmN5Mt8P_0lICG7mfFM9uA0dKhCPiwOS4w5ta0mo2qdibDWDtEzINVUWPk3l0XTImrUJC4RIxRUAySkUM0U_84tMt6-gY1isd_QqC3SwQrfjrnpo0sgqAX3sopEEUbszAkLpfHCEDPi_bDstEZz2YCLSnxcdexiYk4M2b9CDnRMjZ6G3CMQYSXBqQ60S3NQlPrfSTyh6sNuRGMp2oJiFFHZPO2FjuN2uix-HgaJ5m-Q";
const PANTRY_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuA-GUXgWc3tNkch6YUrviX2JODDCSiDlPAARxtSK1D51JG1IoY1OE4-LrdGI0d35srb4Bh8ezAfVeKk-wMeTr_So2cUnmeeUFq0EsOUqrFIq5WWJfGRW9FRD-7ozObysfvms5B_usfkVfpuKyvpLYmh5OwXWVRJI1bQiRnmPxwzpTG8Zssi8yNRxaH-EAqTtmJrXDD3_bIHW_b_r6ccpdCfEKVzt2LBgPKzW2uIBnqZAWuswbXfk6gVhg";

const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 1, name: 'Leite Integral 1L', price: 'R$ 4,50', numPrice: 4.5, priority: 'Alta', category: 'Alimentos', iconId: 'Droplets', checked: false },
  { id: 2, name: 'Café Especial em Grãos 500g', price: 'R$ 22,00', numPrice: 22, priority: 'Alta', category: 'Alimentos', iconId: 'Apple', checked: false },
  { id: 3, name: 'Arroz Parboilizado 5kg', price: 'R$ 26,50', numPrice: 26.5, priority: 'Alta', category: 'Alimentos', iconId: 'Package', checked: false },
  { id: 4, name: 'Azeite de Oliva Extra Virgem', price: 'R$ 34,90', numPrice: 34.9, priority: 'Média', category: 'Alimentos', iconId: 'Droplets', checked: false },
  { id: 5, name: 'Detergente Líquido Neutro', price: 'R$ 2,80', numPrice: 2.8, priority: 'Média', category: 'Limpeza', iconId: 'SprayCan', checked: false },
  { id: 6, name: 'Sabão em Pó Concentrado 1kg', price: 'R$ 16,90', numPrice: 16.9, priority: 'Alta', category: 'Limpeza', iconId: 'SprayCan', checked: false },
  { id: 7, name: 'Desinfetante Multiuso Lavanda', price: 'R$ 7,50', numPrice: 7.5, priority: 'Baixa', category: 'Limpeza', iconId: 'SprayCan', checked: false },
  { id: 8, name: 'Sabonete Hidratante em Barra', price: 'R$ 2,50', numPrice: 2.5, priority: 'Baixa', category: 'Higiene', iconId: 'Hand', checked: true },
  { id: 9, name: 'Pasta de Dente Proteção Total', price: 'R$ 6,20', numPrice: 6.2, priority: 'Média', category: 'Higiene', iconId: 'Droplets', checked: true },
  { id: 10, name: 'Papel Higiênico Folha Dupla 12un', price: 'R$ 24,00', numPrice: 24, priority: 'Alta', category: 'Higiene', iconId: 'Package', checked: false },
  { id: 11, name: 'Cabo USB-C Trançado 2m', price: 'R$ 38,00', numPrice: 38, priority: 'Baixa', category: 'Eletrônicos', iconId: 'Plug', checked: false },
  { id: 12, name: 'Pilhas Alcalinas AA (4un)', price: 'R$ 14,00', numPrice: 14, priority: 'Baixa', category: 'Eletrônicos', iconId: 'Plug', checked: false },
];

const INITIAL_PRIORITY_ITEMS: PriorityItem[] = [
  { id: 1, name: 'Filtros de Ar HEPA', category: 'Climatização', price: 'R$ 45,00', numPrice: 45, img: FILTER_IMG, qty: 2, priority: 'Alta' },
  { id: 2, name: 'Lâmpadas LED Inteligentes', category: 'Iluminação', price: 'R$ 120,00', numPrice: 120, img: BULBS_IMG, qty: 4, priority: 'Alta' },
  { id: 3, name: 'Reposição de Despensa Básica', category: 'Alimentação', price: 'R$ 85,50', numPrice: 85.5, img: PANTRY_IMG, qty: 1, priority: 'Média' },
  { id: 4, name: 'Organizador de Armário', category: 'Organização', price: 'R$ 55,00', numPrice: 55, img: PANTRY_IMG, qty: 2, priority: 'Média' },
  { id: 5, name: 'Acessórios para Pet', category: 'Animais', price: 'R$ 30,00', numPrice: 30, img: PANTRY_IMG, qty: 1, priority: 'Baixa' },
  { id: 6, name: 'Cabos e Conectores Extras', category: 'Eletrônicos', price: 'R$ 22,00', numPrice: 22, img: FILTER_IMG, qty: 3, priority: 'Baixa' },
];

const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [
  {
    id: 'm-0',
    title: 'Limpeza e Desengorduramento da Coifa & Exaustor',
    sector: 'Cozinha',
    type: 'Preventiva',
    priority: 'Alta',
    status: 'Pendente',
    dueDate: '2026-08-28',
    periodicity: 'Mensal',
    responsible: 'Faça Você Mesmo (DIY)',
    description: 'Imersão dos filtros metálicos em água quente e desengordurante para evitar acúmulo de óleo e risco de fogo.',
    hasBudget: false,
    laborCost: 0,
    otherCosts: 0,
    hasItemsToBuy: true,
    itemSubgroups: [
      {
        id: 'sg-0',
        title: 'Produtos de Limpeza Pesada',
        items: [
          { id: 'sub-01', name: 'Desengordurante Concentrado Alcalino', qty: 1, unitPrice: 28.5, purchased: false }
        ]
      }
    ],
    checklist: [
      { id: 'chk-01', text: 'Remover filtros metálicos com cuidado', completed: true },
      { id: 'chk-02', text: 'Mergulhar em solução de água quente com desengordurante por 30min', completed: false },
      { id: 'chk-03', text: 'Enxaguar, secar completamente e reinstalar na coifa', completed: false }
    ]
  },
  {
    id: 'm-1',
    title: 'Higienização dos Ar-Condicionados (Split)',
    sector: 'Climatização',
    type: 'Preventiva',
    priority: 'Alta',
    status: 'Pendente',
    dueDate: '2026-09-18',
    periodicity: 'Semestral',
    responsible: 'Técnico Especializado',
    description: 'Limpeza profunda das serpentinas, turbinas e aplicação de bactericida nos 3 aparelhos da casa.',
    hasBudget: true,
    laborCost: 350,
    otherCosts: 0,
    hasItemsToBuy: true,
    itemSubgroups: [
      {
        id: 'sg-1',
        title: 'Filtros & Higienização',
        items: [
          { id: 'sub-1', name: 'Spray Bactericida para Ar-Condicionado', qty: 1, unitPrice: 42.0, purchased: false },
          { id: 'sub-2', name: 'Par de Filtros Antibacterianos', qty: 2, unitPrice: 35.0, purchased: false },
        ]
      }
    ],
    checklist: [
      { id: 'chk-1', text: 'Desligar disjuntor do ar-condicionado', completed: true },
      { id: 'chk-2', text: 'Remover carenagens e filtros', completed: false },
      { id: 'chk-3', text: 'Higienizar evaporadora e turbina', completed: false },
      { id: 'chk-4', text: 'Testar dreno e fluxo de ar frio', completed: false },
    ]
  },
  {
    id: 'm-2',
    title: 'Revisão e Reaperto do Quadro de Disjuntores',
    sector: 'Elétrica',
    type: 'Preventiva',
    priority: 'Crítica',
    status: 'Pendente',
    dueDate: '2026-09-12',
    periodicity: 'Anual',
    responsible: 'Eletricista Certificado',
    description: 'Inspeção de aquecimento nos barramentos, reaperto de bornes e teste de disparo do IDR/DPS.',
    hasBudget: true,
    laborCost: 280,
    otherCosts: 0,
    hasItemsToBuy: true,
    itemSubgroups: [
      {
        id: 'sg-2',
        title: 'Componentes Elétricos',
        items: [
          { id: 'sub-3', name: 'Disjuntor Bipolar 32A Curva C', qty: 1, unitPrice: 48.0, purchased: false },
          { id: 'sub-4', name: 'Kit Terminais Tubulares Ilhós 4mm/6mm', qty: 1, unitPrice: 22.0, purchased: true },
        ]
      }
    ],
    checklist: [
      { id: 'chk-5', text: 'Desligar disjuntor geral do relógio de entrada', completed: false },
      { id: 'chk-6', text: 'Inspecionar barramentos com chave dinamométrica', completed: false },
      { id: 'chk-7', text: 'Testar botão de teste mensal do IDR', completed: false },
    ]
  },
  {
    id: 'm-3',
    title: 'Troca de Refil e Higienização do Purificador',
    sector: 'Cozinha',
    type: 'Preventiva',
    priority: 'Alta',
    status: 'Em Andamento',
    dueDate: '2026-09-08',
    periodicity: 'Semestral',
    responsible: 'Faça Você Mesmo (DIY)',
    description: 'Substituição semestral do elemento filtrante para retenção de cloro, odores e partículas.',
    hasBudget: true,
    laborCost: 0,
    otherCosts: 0,
    hasItemsToBuy: true,
    itemSubgroups: [
      {
        id: 'sg-3',
        title: 'Peças e Conexões',
        items: [
          { id: 'sub-5', name: 'Refil Original Carbon Block', qty: 1, unitPrice: 89.9, purchased: true },
          { id: 'sub-6', name: 'Mangueira Atóxica 1/4 (2 metros)', qty: 1, unitPrice: 18.0, purchased: false },
        ]
      }
    ],
    checklist: [
      { id: 'chk-8', text: 'Fechar registro de alimentação de água', completed: true },
      { id: 'chk-9', text: 'Esvaziar reservatório interno', completed: true },
      { id: 'chk-10', text: 'Instalar novo refil e sangrar primeiros 5 litros', completed: false },
    ]
  },
  {
    id: 'm-4',
    title: 'Inspeção e Desobstrução das Calhas e Ralos',
    sector: 'Área Externa',
    type: 'Preventiva',
    priority: 'Média',
    status: 'Pendente',
    dueDate: '2026-09-25',
    periodicity: 'Semestral',
    responsible: 'Faça Você Mesmo (DIY)',
    description: 'Remoção de folhas secas, detritos acumulados e teste de vazão com mangueira antes das chuvas.',
    hasBudget: false,
    laborCost: 0,
    otherCosts: 0,
    hasItemsToBuy: false,
    itemSubgroups: [],
    checklist: [
      { id: 'chk-11', text: 'Posicionar escada com calçado antiderrapante', completed: false },
      { id: 'chk-12', text: 'Retirar detritos manualmente com luvas', completed: false },
      { id: 'chk-13', text: 'Testar vazão do bocal de descida com jato', completed: false },
    ]
  },
  {
    id: 'm-5',
    title: 'Vedação do Box e Rejunte do Ralo Oculto',
    sector: 'Banheiros',
    type: 'Corretiva',
    priority: 'Média',
    status: 'Concluída',
    dueDate: '2026-08-28',
    periodicity: 'Única',
    responsible: 'Faça Você Mesmo (DIY)',
    description: 'Raspagem do silicone antigo ressecado e vedação completa com silicone antimofo no box.',
    hasBudget: true,
    laborCost: 0,
    otherCosts: 0,
    isPaid: true,
    hasItemsToBuy: true,
    itemSubgroups: [
      {
        id: 'sg-4',
        title: 'Materiais de Vedação',
        items: [
          { id: 'sub-7', name: 'Tubo de Silicone Acético Branco com Fungicida', qty: 1, unitPrice: 24.5, purchased: true },
          { id: 'sub-8', name: 'Espátula de acabamento e fita crepe', qty: 1, unitPrice: 12.0, purchased: true },
        ]
      }
    ],
    checklist: [
      { id: 'chk-14', text: 'Raspar silicone velho e limpar com álcool', completed: true },
      { id: 'chk-15', text: 'Aplicar fita de proteção nas laterais', completed: true },
      { id: 'chk-16', text: 'Passar cordão de silicone uniforme', completed: true },
      { id: 'chk-17', text: 'Aguardar 24h para secagem total', completed: true },
    ]
  },
  {
    id: 'm-6',
    title: 'Lubrificação de Fechaduras e Dobradiças',
    sector: 'Geral',
    type: 'Preventiva',
    priority: 'Baixa',
    status: 'Pendente',
    dueDate: '2026-10-05',
    periodicity: 'Semestral',
    responsible: 'Faça Você Mesmo (DIY)',
    description: 'Aplicação de pó de grafite nos tambores das portas e lubrificante nas dobradiças com ruído.',
    hasBudget: false,
    laborCost: 0,
    otherCosts: 0,
    hasItemsToBuy: false,
    itemSubgroups: [],
    checklist: [
      { id: 'chk-18', text: 'Aplicar grafite no tambor de todas as fechaduras externas', completed: false },
      { id: 'chk-19', text: 'Lubrificar pinos de portas com rangido', completed: false },
    ]
  }
];

interface AppContextType {
  sectors: Sector[];
  sectorItemsMap: Record<number, SectorItem[]>;
  setSectorItemsMap: React.Dispatch<React.SetStateAction<Record<number, SectorItem[]>>>;
  addSector: (sector: Omit<Sector, 'id' | 'items' | 'cost'> & { id?: number }) => number;
  updateSector: (id: number, sector: Partial<Sector>) => void;
  deleteSector: (id: number) => void;

  shoppingItems: ShoppingItem[];
  toggleShoppingItem: (id: number) => void;
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  removeShoppingItem: (id: number) => void;
  editShoppingItem: (id: number, data: Partial<ShoppingItem>) => void;
  updateShoppingItemPriority: (id: number, priority: PriorityType) => void;
  bulkToggleShoppingItems: (ids: number[], checked: boolean) => void;
  bulkRemoveShoppingItems: (ids: number[]) => void;
  bulkUpdateShoppingItemPriority: (ids: number[], priority: PriorityType) => void;
  shoppingCategories: string[];
  addShoppingCategory: (cat: string) => void;
  updateShoppingCategory: (oldCat: string, newCat: string) => void;
  deleteShoppingCategory: (cat: string) => void;
  
  priorityItems: PriorityItem[];
  addPriorityItem: (item: Omit<PriorityItem, 'id'>) => void;
  removePriorityItem: (id: number) => void;
  updatePriorityItemQty: (id: number, delta: number) => void;
  updatePriorityItemLevel: (id: number, priority: PriorityType) => void;

  maintenances: MaintenanceItem[];
  addMaintenance: (item: Omit<MaintenanceItem, 'id'>) => void;
  updateMaintenance: (id: string, updates: Partial<MaintenanceItem>) => void;
  deleteMaintenance: (id: string) => void;
  toggleMaintenanceStatus: (id: string) => void;
  toggleMaintenanceSubitemPurchased: (maintenanceId: string, subgroupId: string, itemId: string) => void;
  toggleMaintenanceChecklistStep: (maintenanceId: string, stepId: string) => void;
  sendSubitemToShoppingList: (maintenanceId: string, subgroupId: string, itemId: string) => void;

  shoppingStats: {
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    highPriorityPendingCount: number;
    totalEstimatedCost: number;
    pendingEstimatedCost: number;
    completionPercentage: number;
  };

  priorityStats: {
    totalItemsCount: number;
    totalUnitsCount: number;
    totalCost: number;
    highCount: number;
    highUnits: number;
    highCost: number;
    highPercent: number;
    medCount: number;
    medUnits: number;
    medCost: number;
    medPercent: number;
    lowCount: number;
    lowUnits: number;
    lowCost: number;
    lowPercent: number;
  };

  maintenanceStats: {
    totalCount: number;
    pendingCount: number;
    inProgressCount: number;
    completedCount: number;
    criticalCount: number;
    highCount: number;
    overdueCount: number;
    overdueMaintenances: MaintenanceItem[];
    upcomingCount: number;
    upcomingMaintenances: MaintenanceItem[];
    completedMaintenances: MaintenanceItem[];
    todayCount: number;
    preventiveCount: number;
    correctiveCount: number;
    withBudgetCount: number;
    withoutBudgetCount: number;
    totalBudget: number;
    laborCost: number;
    materialsCost: number;
    completedBudget: number;
    pendingBudget: number;
    itemsToBuyTotal: number;
    itemsToBuyPending: number;
    itemsToBuyPurchased: number;
    healthRate: number;
  };

  rescheduleMaintenance: (id: string, newDueDate: string) => void;

  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const INITIAL_SECTOR_ITEMS: Record<number, SectorItem[]> = {
  1: [
    { id: 101, name: 'Arroz Branco', desc: 'Pacote 5kg', price: 'R$ 25,90', date: '28/08/2026', priority: 'Média' },
    { id: 102, name: 'Azeite Extra Virgem', desc: 'Garrafa 500ml', price: 'R$ 35,00', date: '25/08/2026', priority: 'Alta' },
    { id: 103, name: 'Café Torrado', desc: 'Pacote 500g', price: 'R$ 18,50', date: '30/08/2026', priority: 'Alta' },
    { id: 104, name: 'Leite Desnatado', desc: 'Caixa com 12L', price: 'R$ 58,00', date: '29/08/2026', priority: 'Média' },
    { id: 105, name: 'Feijão Carioca', desc: 'Pacote 1kg', price: 'R$ 8,90', date: '30/08/2026', priority: 'Baixa' },
  ],
  2: [
    { id: 201, name: 'Detergente Neutro', desc: 'Frasco 500ml', price: 'R$ 2,50', date: '20/08/2026', priority: 'Baixa' },
    { id: 202, name: 'Sabão em Pó', desc: 'Caixa 1kg', price: 'R$ 14,90', date: '22/08/2026', priority: 'Média' },
    { id: 203, name: 'Desinfetante Floral', desc: 'Frasco 2L', price: 'R$ 11,50', date: '27/08/2026', priority: 'Alta' },
  ],
  3: [
    { id: 301, name: 'Cabo USB-C', desc: '2 metros, trançado', price: 'R$ 45,00', date: '15/08/2026', priority: 'Baixa' },
    { id: 302, name: 'Pilhas AA', desc: 'Pacote com 4', price: 'R$ 12,00', date: '29/08/2026', priority: 'Alta' },
    { id: 303, name: 'Filtro de Linha', desc: '6 tomadas bivolt', price: 'R$ 69,90', date: '30/08/2026', priority: 'Média' },
  ]
};

const INITIAL_SECTORS: Sector[] = [
  { id: 1, name: 'Alimentos', desc: 'Despensa e Geladeira', items: 5, cost: 'R$ 146,30', iconId: 'Utensils', colorId: 'emerald' },
  { id: 2, name: 'Limpeza', desc: 'Produtos de Limpeza', items: 3, cost: 'R$ 28,90', iconId: 'SprayCan', colorId: 'blue' },
  { id: 3, name: 'Eletrônicos', desc: 'Dispositivos e Cabos', items: 3, cost: 'R$ 126,90', iconId: 'Laptop', colorId: 'purple' }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('barreto-theme') as ThemeMode | null;
        if (savedTheme === 'light' || savedTheme === 'dark') {
          return savedTheme;
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch {
        // fallback to default
      }
    }
    return 'light';
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedShopping = localStorage.getItem('barreto-shopping-items');
        if (savedShopping) {
          const parsed = JSON.parse(savedShopping);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_SHOPPING_ITEMS;
  });

  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPriority = localStorage.getItem('barreto-priority-items');
        if (savedPriority) {
          const parsed = JSON.parse(savedPriority);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_PRIORITY_ITEMS;
  });

  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMaintenances = localStorage.getItem('barreto-maintenances');
        if (savedMaintenances) {
          const parsed = JSON.parse(savedMaintenances);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_MAINTENANCE_ITEMS;
  });

  const [rawSectors, setRawSectors] = useState<Sector[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSectors = localStorage.getItem('barreto-sectors');
        if (savedSectors) {
          const parsed = JSON.parse(savedSectors);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return INITIAL_SECTORS;
  });

  const [shoppingCategories, setShoppingCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCategories = localStorage.getItem('barreto-shopping-categories');
        if (savedCategories) {
          const parsed = JSON.parse(savedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return ['Alimentos', 'Limpeza', 'Higiene', 'Eletrônicos', 'Sem categoria'];
  });


  const [sectorItemsMap, setSectorItemsMap] = useState<Record<number, SectorItem[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedItemsMap = localStorage.getItem('barreto-sector-items');
        if (savedItemsMap) {
          const parsed = JSON.parse(savedItemsMap);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch {}
    }
    return INITIAL_SECTOR_ITEMS;
  });

  // Calculate sector items and total cost dynamically from sectorItemsMap
  const sectors = useMemo(() => {
    return rawSectors.map(sec => {
      const items = sectorItemsMap[sec.id] || [];
      const count = items.length;
      const totalCost = items.reduce((acc, it) => {
        const val = parseFloat(String(it.price).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return acc + val;
      }, 0);
      const costStr = `R$ ${totalCost.toFixed(2).replace('.', ',')}`;

      return {
        ...sec,
        items: count,
        cost: costStr,
      };
    });
  }, [rawSectors, sectorItemsMap]);

  // Persist states to localStorage when modified
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-sectors', JSON.stringify(rawSectors));
    } catch {}
  }, [rawSectors]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-sector-items', JSON.stringify(sectorItemsMap));
    } catch {}
  }, [sectorItemsMap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-shopping-items', JSON.stringify(shoppingItems));
    } catch {}
  }, [shoppingItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-priority-items', JSON.stringify(priorityItems));
    } catch {}
  }, [priorityItems]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-shopping-categories', JSON.stringify(shoppingCategories));
    } catch {}
  }, [shoppingCategories]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-maintenances', JSON.stringify(maintenances));
    } catch {}
  }, [maintenances]);

  const addSector = (sector: Omit<Sector, 'id' | 'items' | 'cost'> & { id?: number }): number => {
    const newId = sector.id || Date.now();
    const newSector: Sector = {
      ...sector,
      id: newId,
      items: 0,
      cost: 'R$ 0,00'
    };
    setRawSectors(prev => [...prev, newSector]);
    setSectorItemsMap(prev => ({ ...prev, [newId]: [] }));
    return newId;
  };

  const updateSector = (id: number, sector: Partial<Sector>) => {
    setRawSectors(prev => prev.map(s => s.id === id ? { ...s, ...sector } : s));
  };

  const deleteSector = (id: number) => {
    setRawSectors(prev => prev.filter(s => s.id !== id));
    setSectorItemsMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Synchronize document dark class with current theme state
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('barreto-theme', newTheme);
    } catch {
      // ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleShoppingItem = (id: number) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const addShoppingItem = (item: Omit<ShoppingItem, 'id'>) => {
    setShoppingItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const removeShoppingItem = (id: number) => {
    setShoppingItems(prev => prev.filter(item => item.id !== id));
  };

  const editShoppingItem = (id: number, data: Partial<ShoppingItem>) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const updateShoppingItemPriority = (id: number, priority: PriorityType) => {
    setShoppingItems(prev => prev.map(item => item.id === id ? { ...item, priority } : item));
  };

  const bulkToggleShoppingItems = (ids: number[], checked: boolean) => {
    const idSet = new Set(ids);
    setShoppingItems(prev => prev.map(item => idSet.has(item.id) ? { ...item, checked } : item));
  };

  const bulkRemoveShoppingItems = (ids: number[]) => {
    const idSet = new Set(ids);
    setShoppingItems(prev => prev.filter(item => !idSet.has(item.id)));
  };

  const bulkUpdateShoppingItemPriority = (ids: number[], priority: PriorityType) => {
    const idSet = new Set(ids);
    setShoppingItems(prev => prev.map(item => idSet.has(item.id) ? { ...item, priority } : item));
  };


  const addShoppingCategory = (cat: string) => {
    if (!shoppingCategories.includes(cat)) {
      setShoppingCategories(prev => [...prev, cat]);
    }
  };

  const updateShoppingCategory = (oldCat: string, newCat: string) => {
    setShoppingCategories(prev => prev.map(c => c === oldCat ? newCat : c));
  };

  const deleteShoppingCategory = (cat: string) => {
    setShoppingCategories(prev => prev.filter(c => c !== cat));
  };

  const addPriorityItem = (item: Omit<PriorityItem, 'id'>) => {
    setPriorityItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const removePriorityItem = (id: number) => {
    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  const updatePriorityItemQty = (id: number, delta: number) => {
    setPriorityItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const updatePriorityItemLevel = (id: number, priority: PriorityType) => {
    setPriorityItems(prev => prev.map(item => item.id === id ? { ...item, priority } : item));
  };

  const shoppingStats = useMemo(() => {
    const totalCount = shoppingItems.length;
    const pendingItems = shoppingItems.filter(i => !i.checked);
    const pendingCount = pendingItems.length;
    const completedCount = shoppingItems.filter(i => i.checked).length;
    const highPriorityPendingCount = pendingItems.filter(i => i.priority === 'Alta').length;
    
    const totalEstimatedCost = shoppingItems.reduce((acc, i) => acc + i.numPrice, 0);
    const pendingEstimatedCost = pendingItems.reduce((acc, i) => acc + i.numPrice, 0);
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      pendingCount,
      completedCount,
      highPriorityPendingCount,
      totalEstimatedCost,
      pendingEstimatedCost,
      completionPercentage
    };
  }, [shoppingItems]);

  const priorityStats = useMemo(() => {
    const totalItemsCount = priorityItems.length;
    const totalUnitsCount = priorityItems.reduce((acc, item) => acc + item.qty, 0);
    const totalCost = priorityItems.reduce((acc, item) => acc + (item.numPrice * item.qty), 0);

    const highItems = priorityItems.filter(i => i.priority === 'Alta');
    const highCost = highItems.reduce((acc, item) => acc + (item.numPrice * item.qty), 0);
    const highUnits = highItems.reduce((acc, item) => acc + item.qty, 0);

    const medItems = priorityItems.filter(i => i.priority === 'Média');
    const medCost = medItems.reduce((acc, item) => acc + (item.numPrice * item.qty), 0);
    const medUnits = medItems.reduce((acc, item) => acc + item.qty, 0);

    const lowItems = priorityItems.filter(i => i.priority === 'Baixa');
    const lowCost = lowItems.reduce((acc, item) => acc + (item.numPrice * item.qty), 0);
    const lowUnits = lowItems.reduce((acc, item) => acc + item.qty, 0);

    return {
      totalItemsCount,
      totalUnitsCount,
      totalCost,
      highCount: highItems.length,
      highUnits,
      highCost,
      highPercent: totalCost > 0 ? Math.round((highCost / totalCost) * 100) : 0,
      medCount: medItems.length,
      medUnits,
      medCost,
      medPercent: totalCost > 0 ? Math.round((medCost / totalCost) * 100) : 0,
      lowCount: lowItems.length,
      lowUnits,
      lowCost,
      lowPercent: totalCost > 0 ? Math.round((lowCost / totalCost) * 100) : 0,
    };
  }, [priorityItems]);

  const addMaintenance = (item: Omit<MaintenanceItem, 'id'>) => {
    const newId = `m-${Date.now()}`;
    setMaintenances(prev => [
      {
        ...item,
        id: newId,
      },
      ...prev
    ]);
  };

  const updateMaintenance = (id: string, updates: Partial<MaintenanceItem>) => {
    setMaintenances(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMaintenance = (id: string) => {
    setMaintenances(prev => prev.filter(m => m.id !== id));
  };

  const toggleMaintenanceStatus = (id: string) => {
    setMaintenances(prev => prev.map(m => {
      if (m.id !== id) return m;
      const nextStatus: MaintenanceStatus = 
        m.status === 'Pendente' ? 'Em Andamento' :
        m.status === 'Em Andamento' ? 'Concluída' : 'Pendente';
      return { ...m, status: nextStatus };
    }));
  };

  const toggleMaintenanceSubitemPurchased = (maintenanceId: string, subgroupId: string, itemId: string) => {
    setMaintenances(prev => prev.map(m => {
      if (m.id !== maintenanceId) return m;
      return {
        ...m,
        itemSubgroups: m.itemSubgroups.map(sg => {
          if (sg.id !== subgroupId) return sg;
          return {
            ...sg,
            items: sg.items.map(item => {
              if (item.id !== itemId) return item;
              return { ...item, purchased: !item.purchased };
            })
          };
        })
      };
    }));
  };

  const toggleMaintenanceChecklistStep = (maintenanceId: string, stepId: string) => {
    setMaintenances(prev => prev.map(m => {
      if (m.id !== maintenanceId) return m;
      return {
        ...m,
        checklist: (m.checklist || []).map(step => {
          if (step.id !== stepId) return step;
          return { ...step, completed: !step.completed };
        })
      };
    }));
  };

  const sendSubitemToShoppingList = (maintenanceId: string, subgroupId: string, itemId: string) => {
    let itemToAdd: MaintenanceSubitem | null = null;
    let maintTitle = '';

    setMaintenances(prev => prev.map(m => {
      if (m.id !== maintenanceId) return m;
      maintTitle = m.title;
      return {
        ...m,
        itemSubgroups: m.itemSubgroups.map(sg => {
          if (sg.id !== subgroupId) return sg;
          return {
            ...sg,
            items: sg.items.map(item => {
              if (item.id !== itemId) return item;
              itemToAdd = item;
              return { ...item, sentToShoppingList: true };
            })
          };
        })
      };
    }));

    if (itemToAdd) {
      const typedItem = itemToAdd as MaintenanceSubitem;
      const formattedPrice = `R$ ${(typedItem.unitPrice * typedItem.qty).toFixed(2).replace('.', ',')}`;
      addShoppingItem({
        name: `${typedItem.name} (${typedItem.qty}x) - ${maintTitle}`,
        price: formattedPrice,
        numPrice: typedItem.unitPrice * typedItem.qty,
        priority: 'Alta',
        category: 'Manutenção',
        iconId: 'Package',
        checked: typedItem.purchased,
      });
    }
  };

  const maintenanceStats = useMemo(() => {
    const totalCount = maintenances.length;
    const pendingCount = maintenances.filter(m => m.status === 'Pendente').length;
    const inProgressCount = maintenances.filter(m => m.status === 'Em Andamento').length;
    const completedCount = maintenances.filter(m => m.status === 'Concluída').length;
    const criticalCount = maintenances.filter(m => m.priority === 'Crítica' && m.status !== 'Concluída').length;
    const highCount = maintenances.filter(m => m.priority === 'Alta' && m.status !== 'Concluída').length;
    const preventiveCount = maintenances.filter(m => m.type === 'Preventiva').length;
    const correctiveCount = maintenances.filter(m => m.type === 'Corretiva').length;
    const withBudgetCount = maintenances.filter(m => m.hasBudget).length;
    const withoutBudgetCount = maintenances.filter(m => !m.hasBudget).length;

    let totalBudget = 0;
    let laborCost = 0;
    let materialsCost = 0;
    let completedBudget = 0;
    let pendingBudget = 0;
    let itemsToBuyTotal = 0;
    let itemsToBuyPending = 0;
    let itemsToBuyPurchased = 0;

    maintenances.forEach(m => {
      let maintenanceMaterialCost = 0;
      if (m.hasItemsToBuy && m.itemSubgroups) {
        m.itemSubgroups.forEach(sg => {
          sg.items.forEach(item => {
            const cost = item.unitPrice * item.qty;
            maintenanceMaterialCost += cost;
            itemsToBuyTotal += item.qty;
            if (item.purchased) {
              itemsToBuyPurchased += item.qty;
            } else {
              itemsToBuyPending += item.qty;
            }
          });
        });
      }

      if (m.hasBudget) {
        const maintLabor = m.laborCost || 0;
        const maintOther = m.otherCosts || 0;
        const maintTotal = maintLabor + maintOther + maintenanceMaterialCost;

        totalBudget += maintTotal;
        laborCost += maintLabor;
        materialsCost += maintenanceMaterialCost;

        if (m.status === 'Concluída') {
          completedBudget += maintTotal;
        } else {
          pendingBudget += maintTotal;
        }
      }
    });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const overdueMaintenances = maintenances
      .filter(m => m.status !== 'Concluída' && m.dueDate && m.dueDate < todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const upcomingMaintenances = maintenances
      .filter(m => m.status !== 'Concluída' && m.dueDate && m.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const completedMaintenances = maintenances
      .filter(m => m.status === 'Concluída')
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateB - dateA;
      });

    const overdueCount = overdueMaintenances.length;
    const upcomingCount = upcomingMaintenances.length;
    const todayCount = maintenances.filter(m => m.status !== 'Concluída' && m.dueDate === todayStr).length;

    const healthRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    return {
      totalCount,
      pendingCount,
      inProgressCount,
      completedCount,
      criticalCount,
      highCount,
      overdueCount,
      overdueMaintenances,
      upcomingCount,
      upcomingMaintenances,
      completedMaintenances,
      todayCount,
      preventiveCount,
      correctiveCount,
      withBudgetCount,
      withoutBudgetCount,
      totalBudget,
      laborCost,
      materialsCost,
      completedBudget,
      pendingBudget,
      itemsToBuyTotal,
      itemsToBuyPending,
      itemsToBuyPurchased,
      healthRate,
    };
  }, [maintenances]);

  const rescheduleMaintenance = (id: string, newDueDate: string) => {
    setMaintenances(prev => prev.map(m => m.id === id ? { ...m, dueDate: newDueDate } : m));
  };

  return (
    <AppContext.Provider value={{
      sectors,
      sectorItemsMap,
      setSectorItemsMap,
      addSector,
      updateSector,
      deleteSector,
      shoppingItems,
      toggleShoppingItem,
      addShoppingItem,
      removeShoppingItem,
      editShoppingItem,
      updateShoppingItemPriority,
      bulkToggleShoppingItems,
      bulkRemoveShoppingItems,
      bulkUpdateShoppingItemPriority,
      shoppingCategories,
      addShoppingCategory,
      updateShoppingCategory,
      deleteShoppingCategory,
      priorityItems,
      addPriorityItem,
      removePriorityItem,
      updatePriorityItemQty,
      updatePriorityItemLevel,
      maintenances,
      addMaintenance,
      updateMaintenance,
      deleteMaintenance,
      toggleMaintenanceStatus,
      toggleMaintenanceSubitemPurchased,
      toggleMaintenanceChecklistStep,
      sendSubitemToShoppingList,
      rescheduleMaintenance,
      shoppingStats,
      priorityStats,
      maintenanceStats,
      theme,
      toggleTheme,
      setTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
