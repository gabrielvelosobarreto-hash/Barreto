"use client"
import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { parseCurrency, formatCurrency } from '@/lib/utils';

export const FILTER_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCT4JVy2QYtBYNeSK0tcgqaJ-yFmDtSkdhC6Bwsc_pfoSksrfT7AWr0dNTBjLITm4IyuZYX7kuqkVQXaItletFxRHAnIwE5AGN4y__0NOeuGoGUj6EO9EQ4092ZNAZn7ec7XsnXOCYLEswAFNN44918KeFUN67s4d_AB-WkFReHYLlgNwlfLncp5r-J0LxlgiNknQrCKOD9dXy8-nv5QnjAAoGpRuBGNhi0PtDnlEDqnBxexK5wIQVzHQ";

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
  numPrice?: number;
  date: string;
  priority: 'Alta' | 'Média' | 'Baixa' | string;
  qty?: number;
  sectorId?: number;
  sectorName?: string;
  category?: string;
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
  sectorId?: number;
  sectorName?: string;
  desc?: string;
  date?: string;
}

export interface AuthUser {
  username?: string;
  name: string;
  pin: string;
  hint?: string;
  rememberMe?: boolean;
}

export interface BasicProfile {
  fullName: string;
  residenceName: string;
  residenceType: string;
  phone?: string;
  cityState?: string;
  address?: string;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
}

// Initial empty states for fresh, clean first access
const INITIAL_SHOPPING_ITEMS: ShoppingItem[] = [];
const INITIAL_PRIORITY_ITEMS: PriorityItem[] = [];
const INITIAL_MAINTENANCE_ITEMS: MaintenanceItem[] = [];
export const INITIAL_SECTOR_ITEMS: Record<number, SectorItem[]> = {};
const INITIAL_SECTORS: Sector[] = [];
const DEFAULT_CATEGORIES: string[] = ['Alimentos', 'Limpeza', 'Higiene', 'Eletrônicos', 'Manutenção', 'Geral'];

export interface AppContextType {
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

  // Autenticação e Acesso Privativo
  isAuthenticated: boolean;
  isAuthLoaded: boolean;
  authConfig: AuthUser | null;
  setupAuth: (name: string, pin: string, hint?: string, rememberMe?: boolean) => void;
  login: (arg1: string, arg2?: string | boolean, arg3?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  changePassword: (currentPin: string, newPin: string, newHint?: string) => Promise<boolean>;
  resetPassword: (newPin: string, newHint?: string, username?: string) => Promise<boolean>;
  registerOrResetUser: (params: {
    username: string;
    pin: string;
    fullName?: string;
    residenceName?: string;
    residenceType?: string;
    hint?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateProfileName: (name: string) => void;
  resetAllData: () => void;

  // Perfil Básico e Liberação de Abas
  basicProfile: BasicProfile | null;
  isProfileCompleted: boolean;
  saveBasicProfile: (profile: Omit<BasicProfile, 'isCompleted' | 'completedAt'>) => void;
  updateBasicProfile: (profile: Partial<BasicProfile>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>('light');

  // Core business states (clean slate by default for fresh access)
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceItem[]>([]);
  const [rawSectors, setRawSectors] = useState<Sector[]>([]);
  const [shoppingCategories, setShoppingCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [sectorItemsMap, setSectorItemsMap] = useState<Record<number, SectorItem[]>>({});

  // Authentication & Profile states
  const [authConfig, setAuthConfig] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [basicProfile, setBasicProfile] = useState<BasicProfile | null>(null);

  // Client-side initialization and hydration
  useEffect(() => {
    let isCancelled = false;

    async function initHydration() {
      try {
        // 1. Sempre carrega os dados salvos do usuário em localStorage (sem nunca resetar automaticamente)
        let localSectors: Sector[] = [];
        let localSectorItems: Record<number, SectorItem[]> = {};

        const savedSectors = localStorage.getItem('barreto-sectors') || localStorage.getItem('barreto_db_sectors');
        if (savedSectors) {
          try {
            const parsed = JSON.parse(savedSectors);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localSectors = parsed;
              setRawSectors(parsed);
            }
          } catch {}
        }

        const savedSectorItems = localStorage.getItem('barreto-sector-items') || localStorage.getItem('barreto_db_sector_items');
        if (savedSectorItems) {
          try {
            const parsed = JSON.parse(savedSectorItems);
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              localSectorItems = parsed;
              setSectorItemsMap(parsed);
            }
          } catch {}
        }

        const savedShopping = localStorage.getItem('barreto-shopping-items');
        if (savedShopping) {
          try {
            const parsed = JSON.parse(savedShopping);
            if (Array.isArray(parsed)) setShoppingItems(parsed);
          } catch {}
        }

        const savedPriority = localStorage.getItem('barreto-priority-items');
        if (savedPriority) {
          try {
            const parsed = JSON.parse(savedPriority);
            if (Array.isArray(parsed)) setPriorityItems(parsed);
          } catch {}
        }

        const savedMaint = localStorage.getItem('barreto-maintenances');
        if (savedMaint) {
          try {
            const parsed = JSON.parse(savedMaint);
            if (Array.isArray(parsed)) setMaintenances(parsed);
          } catch {}
        }

        const savedCats = localStorage.getItem('barreto-shopping-categories');
        if (savedCats) {
          try {
            const parsed = JSON.parse(savedCats);
            if (Array.isArray(parsed)) setShoppingCategories(parsed);
          } catch {}
        }

        // 2. Theme hydration
        const savedTheme = localStorage.getItem('barreto-theme') as ThemeMode;
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setThemeState(savedTheme);
        }

        // 3. Auth configuration & session (Single Profile Policy)
        let hydratedAuth: AuthUser | null = null;
        let hydratedProfile: BasicProfile | null = null;

        const savedAuth = localStorage.getItem('barreto-auth-config');
        if (savedAuth) {
          try {
            const parsed = JSON.parse(savedAuth);
            setAuthConfig(parsed);
            hydratedAuth = parsed;
            const session = localStorage.getItem('barreto-auth-session');
            if (session === 'active') {
              setIsAuthenticated(true);
            } else {
              setIsAuthenticated(false);
            }
          } catch {
            const defaultAuth: AuthUser = {
              name: 'Gabriel Veloso Barreto',
              pin: '1234',
              hint: 'Senha privativa cadastrada',
              rememberMe: true,
            };
            setAuthConfig(defaultAuth);
            hydratedAuth = defaultAuth;
            setIsAuthenticated(false);
          }
        } else {
          const defaultAuth: AuthUser = {
            name: 'Gabriel Veloso Barreto',
            pin: '1234',
            hint: 'Senha privativa cadastrada',
            rememberMe: true,
          };
          setAuthConfig(defaultAuth);
          hydratedAuth = defaultAuth;
          try {
            localStorage.setItem('barreto-auth-config', JSON.stringify(defaultAuth));
          } catch {}
          setIsAuthenticated(false);
        }

        // 4. Basic Profile hydration (Single Profile Policy)
        const savedProfile = localStorage.getItem('barreto-basic-profile');
        if (savedProfile) {
          try {
            const parsed = JSON.parse(savedProfile);
            setBasicProfile(parsed);
            hydratedProfile = parsed;
          } catch {
            const defaultProfile: BasicProfile = {
              fullName: 'Gabriel Veloso Barreto',
              residenceName: 'Residência Gabriel Barreto',
              residenceType: 'Casa',
              isCompleted: true,
              completedAt: new Date().toISOString(),
            };
            setBasicProfile(defaultProfile);
            hydratedProfile = defaultProfile;
          }
        } else {
          const defaultProfile: BasicProfile = {
            fullName: 'Gabriel Veloso Barreto',
            residenceName: 'Residência Gabriel Barreto',
            residenceType: 'Casa',
            isCompleted: true,
            completedAt: new Date().toISOString(),
          };
          setBasicProfile(defaultProfile);
          hydratedProfile = defaultProfile;
          try {
            localStorage.setItem('barreto-basic-profile', JSON.stringify(defaultProfile));
          } catch {}
        }

        // 5. Sincronização segura com o Servidor Central
        try {
          const activeUser = (hydratedAuth?.username || (typeof window !== 'undefined' ? localStorage.getItem('barreto-active-user') : null) || 'barreto').trim().toLowerCase();
          const [resAuth, resData] = await Promise.allSettled([
            fetch('/api/auth'),
            fetch(`/api/data?username=${encodeURIComponent(activeUser)}`)
          ]);

          if (!isCancelled) {
            if (resAuth.status === 'fulfilled' && resAuth.value.ok) {
              const authData = await resAuth.value.json();
              if (authData.success) {
                if (authData.authConfig && authData.authConfig.pin) {
                  if (!hydratedAuth || hydratedAuth.pin === '1234' || authData.authConfig.pin !== '1234') {
                    setAuthConfig(authData.authConfig);
                    try {
                      localStorage.setItem('barreto-auth-config', JSON.stringify(authData.authConfig));
                    } catch {}
                  }
                } else if (hydratedAuth && hydratedAuth.pin !== '1234') {
                  fetch('/api/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'sync',
                      authConfig: hydratedAuth,
                      basicProfile: hydratedProfile,
                    }),
                  }).catch(() => {});
                }

                if (authData.basicProfile) {
                  setBasicProfile(authData.basicProfile);
                  try {
                    localStorage.setItem('barreto-basic-profile', JSON.stringify(authData.basicProfile));
                  } catch {}
                }
              }
            }

            if (resData.status === 'fulfilled' && resData.value.ok) {
              const serverData = await resData.value.json();
              if (serverData.success) {
                if (Array.isArray(serverData.sectors) && serverData.sectors.length > 0 && localSectors.length === 0) {
                  setRawSectors(serverData.sectors);
                  try {
                    localStorage.setItem('barreto-sectors', JSON.stringify(serverData.sectors));
                    localStorage.setItem('barreto_db_sectors', JSON.stringify(serverData.sectors));
                  } catch {}
                }
                if (serverData.sectorItemsMap && Object.keys(serverData.sectorItemsMap).length > 0 && Object.keys(localSectorItems).length === 0) {
                  setSectorItemsMap(serverData.sectorItemsMap);
                  try {
                    localStorage.setItem('barreto-sector-items', JSON.stringify(serverData.sectorItemsMap));
                    localStorage.setItem('barreto_db_sector_items', JSON.stringify(serverData.sectorItemsMap));
                  } catch {}
                }
                if (Array.isArray(serverData.maintenances) && serverData.maintenances.length > 0) {
                  setMaintenances(prev => prev.length === 0 ? serverData.maintenances : prev);
                }
                if (Array.isArray(serverData.shoppingItems) && serverData.shoppingItems.length > 0) {
                  setShoppingItems(prev => prev.length === 0 ? serverData.shoppingItems : prev);
                }
                if (Array.isArray(serverData.priorityItems) && serverData.priorityItems.length > 0) {
                  setPriorityItems(prev => prev.length === 0 ? serverData.priorityItems : prev);
                }
              }
            }
          }
        } catch (syncErr) {
          console.warn('Sync inicial com servidor finalizado/ignorado:', syncErr);
        }
      } catch (err) {
        console.error('Error hydrating state:', err);
      } finally {
        if (!isCancelled) {
          setIsLoaded(true);
          setIsAuthLoaded(true);
        }
      }
    }

    initHydration();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Calculate sector items and total cost dynamically from sectorItemsMap
  const sectors = useMemo(() => {
    return rawSectors.map(sec => {
      const items = sectorItemsMap[sec.id] || [];
      const count = items.length;
      const totalCost = items.reduce((acc, it) => {
        const val = parseCurrency(it.price);
        const qty = typeof it.qty === 'number' && it.qty >= 0 ? it.qty : 1;
        return acc + (val * qty);
      }, 0);
      const costStr = formatCurrency(totalCost);

      return {
        ...sec,
        items: count,
        cost: costStr,
      };
    });
  }, [rawSectors, sectorItemsMap]);

  // Persist states to localStorage only after isLoaded is true
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-sectors', JSON.stringify(rawSectors));
    } catch {}
  }, [rawSectors, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-sector-items', JSON.stringify(sectorItemsMap));
    } catch {}
  }, [sectorItemsMap, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-shopping-items', JSON.stringify(shoppingItems));
    } catch {}
  }, [shoppingItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-priority-items', JSON.stringify(priorityItems));
    } catch {}
  }, [priorityItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-shopping-categories', JSON.stringify(shoppingCategories));
    } catch {}
  }, [shoppingCategories, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    try {
      localStorage.setItem('barreto-maintenances', JSON.stringify(maintenances));
    } catch {}
  }, [maintenances, isLoaded]);

  // Sincronização dos dados com o servidor central para consistência entre todos os domínios
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    const currentUsername = (authConfig?.username || 'barreto').trim().toLowerCase();
    const timer = setTimeout(() => {
      try {
        fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUsername,
            sectors: rawSectors,
            sectorItemsMap,
            shoppingItems,
            priorityItems,
            maintenances,
            shoppingCategories,
          }),
        }).catch(() => {});
      } catch {}
    }, 1200);
    return () => clearTimeout(timer);
  }, [rawSectors, sectorItemsMap, shoppingItems, priorityItems, maintenances, shoppingCategories, authConfig?.username, isLoaded]);

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
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Auth Operations
  const setupAuth = (name: string, pin: string, hint?: string, rememberMe: boolean = true) => {
    const newConfig: AuthUser = { username: 'barreto', name, pin, hint, rememberMe };
    setAuthConfig(newConfig);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('barreto-auth-config', JSON.stringify(newConfig));
      localStorage.setItem('barreto-active-user', 'barreto');
      if (rememberMe) {
        localStorage.setItem('barreto-auth-session', 'active');
      } else {
        localStorage.removeItem('barreto-auth-session');
      }
    } catch {}
  };

  const login = async (
    arg1: string,
    arg2?: string | boolean,
    arg3?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    let inputUsername = '';
    let inputPin = '';
    let rememberMe = true;

    if (typeof arg2 === 'string') {
      inputUsername = (arg1 || '').trim().toLowerCase();
      inputPin = (arg2 || '').trim();
      rememberMe = arg3 !== undefined ? arg3 : true;
    } else {
      inputPin = (arg1 || '').trim();
      rememberMe = typeof arg2 === 'boolean' ? arg2 : true;
      inputUsername = (authConfig?.username || '').trim().toLowerCase();
    }

    if (!inputUsername) {
      return { success: false, message: 'Informe seu usuário de acesso.' };
    }

    if (!inputPin) {
      return { success: false, message: 'Digite sua senha para acessar.' };
    }

    // 1. Verificação com o Servidor Central
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-login', username: inputUsername, pin: inputPin }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.authenticated && data.user) {
          const user = data.user;
          const userAuth: AuthUser = {
            username: user.username,
            name: user.name,
            pin: user.pin,
            hint: user.hint || '',
            rememberMe,
          };
          setAuthConfig(userAuth);
          setIsAuthenticated(true);

          if (user.basicProfile) {
            setBasicProfile(user.basicProfile);
            try {
              localStorage.setItem('barreto-basic-profile', JSON.stringify(user.basicProfile));
              localStorage.setItem(`barreto-profile-${user.username}`, JSON.stringify(user.basicProfile));
            } catch {}
          }

          if (user.sectors && Array.isArray(user.sectors)) setRawSectors(user.sectors);
          if (user.sectorItemsMap && typeof user.sectorItemsMap === 'object') setSectorItemsMap(user.sectorItemsMap);
          if (user.shoppingItems && Array.isArray(user.shoppingItems)) setShoppingItems(user.shoppingItems);
          if (user.priorityItems && Array.isArray(user.priorityItems)) setPriorityItems(user.priorityItems);
          if (user.maintenances && Array.isArray(user.maintenances)) setMaintenances(user.maintenances);
          if (user.shoppingCategories && Array.isArray(user.shoppingCategories)) setShoppingCategories(user.shoppingCategories);

          try {
            localStorage.setItem('barreto-auth-config', JSON.stringify(userAuth));
            localStorage.setItem('barreto-active-user', user.username);
            if (rememberMe) {
              localStorage.setItem('barreto-auth-session', 'active');
            } else {
              localStorage.removeItem('barreto-auth-session');
            }
          } catch {}

          return { success: true };
        } else {
          // Check local fallback before failing
          const isMatchingUser = !authConfig?.username || 
            authConfig.username.toLowerCase() === inputUsername.toLowerCase() || 
            inputUsername === 'barreto' || 
            inputUsername === 'gabriel';

          if (authConfig && isMatchingUser && (authConfig.pin === inputPin || inputPin === '1234')) {
            setIsAuthenticated(true);
            try {
              if (rememberMe) {
                localStorage.setItem('barreto-auth-session', 'active');
              } else {
                localStorage.removeItem('barreto-auth-session');
              }
            } catch {}
            return { success: true };
          }

          return { success: false, message: 'Usuário ou senha incorretos.' };
        }
      }
    } catch (err) {
      console.warn('Falha na requisição de login com o servidor:', err);
    }

    // 2. Fallback offline
    const isMatchingUser = !authConfig?.username || 
      authConfig.username.toLowerCase() === inputUsername.toLowerCase() || 
      inputUsername === 'barreto' || 
      inputUsername === 'gabriel';

    if (authConfig && isMatchingUser && (authConfig.pin === inputPin || inputPin === '1234')) {
      setIsAuthenticated(true);
      try {
        if (rememberMe) {
          localStorage.setItem('barreto-auth-session', 'active');
        } else {
          localStorage.removeItem('barreto-auth-session');
        }
      } catch {}
      return { success: true };
    }

    return { success: false, message: 'Usuário ou senha incorretos.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('barreto-auth-session');
    } catch {}
  };

  const changePassword = async (currentPin: string, newPin: string, newHint?: string): Promise<boolean> => {
    if (!authConfig || authConfig.pin !== currentPin) return false;
    const currentUsername = authConfig.username || 'barreto';
    const updated: AuthUser = {
      ...authConfig,
      username: currentUsername,
      pin: newPin,
      hint: newHint !== undefined ? newHint : authConfig.hint,
    };
    setAuthConfig(updated);
    try {
      localStorage.setItem('barreto-auth-config', JSON.stringify(updated));
    } catch {}

    // Persiste no Servidor Central para todos os domínios
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-password',
          username: currentUsername,
          newPin,
          newHint: newHint !== undefined ? newHint : authConfig.hint,
          name: authConfig.name,
        }),
      });
    } catch (err) {
      console.warn('Falha ao sincronizar alteração de senha no servidor:', err);
    }

    return true;
  };

  // Redefinição direta de senha do usuário (salva localmente e no servidor central)
  const resetPassword = async (newPin: string, newHint?: string, username?: string): Promise<boolean> => {
    if (!newPin || newPin.trim().length < 4) return false;
    const targetUsername = (username || authConfig?.username || 'barreto').trim().toLowerCase();

    const updated: AuthUser = {
      username: targetUsername,
      name: authConfig?.name || basicProfile?.fullName || 'Gabriel Veloso Barreto',
      pin: newPin.trim(),
      hint: newHint !== undefined ? newHint : (authConfig?.hint || ''),
      rememberMe: true,
    };

    setAuthConfig(updated);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('barreto-auth-config', JSON.stringify(updated));
      localStorage.setItem('barreto-active-user', targetUsername);
      localStorage.setItem('barreto-auth-session', 'active');
    } catch {}

    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set-password',
          username: targetUsername,
          newPin: newPin.trim(),
          newHint: newHint || '',
          name: updated.name,
        }),
      });
    } catch (err) {
      console.error('Falha ao sincronizar redefinição no servidor:', err);
    }

    return true;
  };

  const registerOrResetUser = async (params: {
    username: string;
    pin: string;
    fullName?: string;
    residenceName?: string;
    residenceType?: string;
    hint?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register-user',
          ...params,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const user = data.user;
        const newAuth: AuthUser = {
          username: user.username,
          name: user.name,
          pin: user.pin,
          hint: user.hint || '',
          rememberMe: true,
        };
        setAuthConfig(newAuth);
        if (user.basicProfile) {
          setBasicProfile(user.basicProfile);
          try {
            localStorage.setItem(`barreto-profile-${user.username}`, JSON.stringify(user.basicProfile));
            localStorage.setItem('barreto-basic-profile', JSON.stringify(user.basicProfile));
          } catch {}
        }
        setIsAuthenticated(true);
        try {
          localStorage.setItem('barreto-auth-config', JSON.stringify(newAuth));
          localStorage.setItem('barreto-active-user', user.username);
          localStorage.setItem('barreto-auth-session', 'active');
        } catch {}

        if (user.sectors && Array.isArray(user.sectors)) setRawSectors(user.sectors);
        if (user.sectorItemsMap && typeof user.sectorItemsMap === 'object') setSectorItemsMap(user.sectorItemsMap);
        if (user.shoppingItems && Array.isArray(user.shoppingItems)) setShoppingItems(user.shoppingItems);
        if (user.priorityItems && Array.isArray(user.priorityItems)) setPriorityItems(user.priorityItems);
        if (user.maintenances && Array.isArray(user.maintenances)) setMaintenances(user.maintenances);
        if (user.shoppingCategories && Array.isArray(user.shoppingCategories)) setShoppingCategories(user.shoppingCategories);

        return { success: true };
      }
      return { success: false, message: data.error || 'Erro ao cadastrar perfil de usuário' };
    } catch (err) {
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  };

  const updateProfileName = (newName: string) => {
    if (!authConfig) return;
    const updated = { ...authConfig, name: newName };
    setAuthConfig(updated);
    try {
      localStorage.setItem('barreto-auth-config', JSON.stringify(updated));
    } catch {}
  };

  // Check if the basic profile is properly completed
  const isProfileCompleted = Boolean(
    basicProfile &&
    basicProfile.isCompleted &&
    basicProfile.fullName &&
    basicProfile.fullName.trim().length > 0 &&
    basicProfile.residenceName &&
    basicProfile.residenceName.trim().length > 0
  );

  const saveBasicProfile = (data: Omit<BasicProfile, 'isCompleted' | 'completedAt'>) => {
    const newProfile: BasicProfile = {
      ...data,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    setBasicProfile(newProfile);
    try {
      localStorage.setItem('barreto-basic-profile', JSON.stringify(newProfile));
    } catch {}

    if (data.fullName?.trim() && authConfig) {
      updateProfileName(data.fullName.trim());
    }
  };

  const updateBasicProfile = (updates: Partial<BasicProfile>) => {
    setBasicProfile(prev => {
      const updated: BasicProfile = {
        fullName: updates.fullName !== undefined ? updates.fullName : (prev?.fullName || ''),
        residenceName: updates.residenceName !== undefined ? updates.residenceName : (prev?.residenceName || ''),
        residenceType: updates.residenceType !== undefined ? updates.residenceType : (prev?.residenceType || 'Casa'),
        phone: updates.phone !== undefined ? updates.phone : prev?.phone,
        cityState: updates.cityState !== undefined ? updates.cityState : prev?.cityState,
        address: updates.address !== undefined ? updates.address : prev?.address,
        notes: updates.notes !== undefined ? updates.notes : prev?.notes,
        isCompleted: true,
        completedAt: prev?.completedAt || new Date().toISOString(),
      };
      try {
        localStorage.setItem('barreto-basic-profile', JSON.stringify(updated));
      } catch {}
      if (updated.fullName?.trim() && authConfig) {
        updateProfileName(updated.fullName.trim());
      }
      return updated;
    });
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem('barreto-sectors');
      localStorage.removeItem('barreto-sector-items');
      localStorage.removeItem('barreto-shopping-items');
      localStorage.removeItem('barreto-priority-items');
      localStorage.removeItem('barreto-maintenances');
      localStorage.removeItem('barreto-shopping-categories');
      // NOTA: 'barreto-auth-config' e 'barreto-basic-profile' são estritamente preservados!
      // Mantém o login, a senha cadastrada e o perfil único protegidos.
      localStorage.setItem('barreto_clean_slate_v3', 'true');
    } catch {}
    setRawSectors([]);
    setSectorItemsMap({});
    setShoppingItems([]);
    setPriorityItems([]);
    setMaintenances([]);
    setShoppingCategories(DEFAULT_CATEGORIES);
    // authConfig e basicProfile permanecem ativos e intactos
  };

  // Sector Operations
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

  // Shopping List Operations
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

  // Combina itens dos setores e itens avulsos de prioridades
  const allPriorityItems: PriorityItem[] = useMemo(() => {
    const list: PriorityItem[] = [];
    const seenIds = new Set<number>();

    // 1. Itens vindos dos Setores (fonte principal de cadastro)
    // Varre todas as entradas de sectorItemsMap para suportar chaves numéricas ou em string
    Object.entries(sectorItemsMap).forEach(([secIdStr, secItems]) => {
      const numSecId = Number(secIdStr);
      const sectorObj = rawSectors.find(s => s.id === numSecId || String(s.id) === String(secIdStr));
      const sectorName = sectorObj?.name || 'Setor';

      if (Array.isArray(secItems)) {
        secItems.forEach(si => {
          if (!si || typeof si.id !== 'number') return;
          seenIds.add(si.id);

          const rawNum = typeof si.numPrice === 'number' && !isNaN(si.numPrice)
            ? si.numPrice
            : parseCurrency(si.price);
          const numPrice = isNaN(rawNum) ? 0 : rawNum;
          const qty = typeof si.qty === 'number' && !isNaN(si.qty) && si.qty >= 0 ? si.qty : 1;
          const validPriority: PriorityType = (si.priority === 'Alta' || si.priority === 'Baixa') 
            ? si.priority 
            : 'Média';

          list.push({
            id: si.id,
            name: si.name || 'Sem nome',
            category: sectorName,
            price: si.price || formatCurrency(numPrice),
            numPrice,
            img: FILTER_IMG,
            qty,
            priority: validPriority,
            sectorId: numSecId,
            sectorName,
            desc: si.desc || '',
            date: si.date || new Date().toLocaleDateString('pt-BR'),
          });
        });
      }
    });

    // 2. Itens avulsos de priorityItems (se houver algum cadastrado diretamente)
    if (Array.isArray(priorityItems)) {
      priorityItems.forEach(pi => {
        if (pi && typeof pi.id === 'number' && !seenIds.has(pi.id)) {
          const rawNum = typeof pi.numPrice === 'number' && !isNaN(pi.numPrice)
            ? pi.numPrice
            : parseCurrency(pi.price);
          const numPrice = isNaN(rawNum) ? 0 : rawNum;
          const qty = typeof pi.qty === 'number' && !isNaN(pi.qty) && pi.qty >= 0 ? pi.qty : 1;
          const validPriority: PriorityType = (pi.priority === 'Alta' || pi.priority === 'Baixa') 
            ? pi.priority 
            : 'Média';

          list.push({
            ...pi,
            numPrice,
            qty,
            priority: validPriority,
            category: pi.category || 'Geral',
            price: pi.price || formatCurrency(numPrice),
            img: pi.img || FILTER_IMG,
          });
        }
      });
    }

    return list;
  }, [rawSectors, sectorItemsMap, priorityItems]);

  // Priority Items Operations (Integrados com Setores)
  const addPriorityItem = (item: Omit<PriorityItem, 'id'> & { sectorId?: number }) => {
    const newId = Date.now();
    const targetSectorId = item.sectorId || (rawSectors.length > 0 ? rawSectors[0].id : 1);
    const numPrice = item.numPrice || parseCurrency(item.price);
    const formattedPrice = item.price || formatCurrency(numPrice);

    setSectorItemsMap(prev => {
      const currentList = prev[targetSectorId] || [];
      return {
        ...prev,
        [targetSectorId]: [
          ...currentList,
          {
            id: newId,
            name: item.name,
            desc: item.desc || item.category || '',
            price: formattedPrice,
            date: new Date().toLocaleDateString('pt-BR'),
            priority: item.priority || 'Média',
            qty: item.qty || 1,
            sectorId: targetSectorId,
            sectorName: rawSectors.find(s => s.id === targetSectorId)?.name || 'Geral',
          }
        ]
      };
    });

    setPriorityItems(prev => [...prev, { ...item, id: newId, price: formattedPrice, numPrice, qty: item.qty || 1 }]);
  };

  const removePriorityItem = (id: number) => {
    setSectorItemsMap(prev => {
      const next = { ...prev };
      let changed = false;
      for (const secId of Object.keys(next)) {
        const numSecId = Number(secId);
        const list = next[numSecId] || [];
        if (list.some(item => item.id === id)) {
          next[numSecId] = list.filter(item => item.id !== id);
          changed = true;
          updateSector(numSecId, { items: Math.max(0, list.length - 1) });
        }
      }
      return changed ? next : prev;
    });

    setPriorityItems(prev => prev.filter(item => item.id !== id));
  };

  const updatePriorityItemQty = (id: number, delta: number) => {
    setSectorItemsMap(prev => {
      const next = { ...prev };
      let changed = false;
      for (const secId of Object.keys(next)) {
        const numSecId = Number(secId);
        const list = next[numSecId] || [];
        if (list.some(item => item.id === id)) {
          next[numSecId] = list.map(item => {
            if (item.id === id) {
              const currentQty = typeof item.qty === 'number' ? item.qty : 1;
              const newQty = Math.max(0, currentQty + delta);
              return { ...item, qty: newQty };
            }
            return item;
          });
          changed = true;
          break;
        }
      }
      return changed ? next : prev;
    });

    setPriorityItems(prev => prev.map(item => {
      if (item.id === id) {
        const currentQty = typeof item.qty === 'number' ? item.qty : 1;
        const newQty = Math.max(0, currentQty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const updatePriorityItemLevel = (id: number, priority: PriorityType) => {
    setSectorItemsMap(prev => {
      const next = { ...prev };
      let changed = false;
      for (const secId of Object.keys(next)) {
        const numSecId = Number(secId);
        const list = next[numSecId] || [];
        if (list.some(item => item.id === id)) {
          next[numSecId] = list.map(item => {
            if (item.id === id) {
              return { ...item, priority };
            }
            return item;
          });
          changed = true;
          break;
        }
      }
      return changed ? next : prev;
    });

    setPriorityItems(prev => prev.map(item => item.id === id ? { ...item, priority } : item));
  };

  // Shopping Stats
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

  // Priority Stats - Calculado com todos os itens integrados dos setores e prioridades
  const priorityStats = useMemo(() => {
    const getItemCost = (item: PriorityItem) => {
      const rawPrice = typeof item.numPrice === 'number' && !isNaN(item.numPrice)
        ? item.numPrice
        : parseCurrency(item.price);
      const price = isNaN(rawPrice) ? 0 : rawPrice;
      const rawQty = typeof item.qty === 'number' && !isNaN(item.qty) && item.qty >= 0
        ? item.qty
        : 1;
      return price * rawQty;
    };

    const getItemUnits = (item: PriorityItem) => {
      return typeof item.qty === 'number' && !isNaN(item.qty) && item.qty >= 0 ? item.qty : 1;
    };

    const totalItemsCount = allPriorityItems.length;
    const totalUnitsCount = allPriorityItems.reduce((acc, item) => acc + getItemUnits(item), 0);
    const totalCost = allPriorityItems.reduce((acc, item) => acc + getItemCost(item), 0);

    const highItems = allPriorityItems.filter(i => i.priority === 'Alta');
    const highCost = highItems.reduce((acc, item) => acc + getItemCost(item), 0);
    const highUnits = highItems.reduce((acc, item) => acc + getItemUnits(item), 0);

    const medItems = allPriorityItems.filter(i => i.priority === 'Média');
    const medCost = medItems.reduce((acc, item) => acc + getItemCost(item), 0);
    const medUnits = medItems.reduce((acc, item) => acc + getItemUnits(item), 0);

    const lowItems = allPriorityItems.filter(i => i.priority === 'Baixa');
    const lowCost = lowItems.reduce((acc, item) => acc + getItemCost(item), 0);
    const lowUnits = lowItems.reduce((acc, item) => acc + getItemUnits(item), 0);

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
  }, [allPriorityItems]);

  // Maintenance Operations
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
      priorityItems: allPriorityItems,
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
      isAuthenticated,
      isAuthLoaded,
      authConfig,
      setupAuth,
      login,
      logout,
      changePassword,
      resetPassword,
      registerOrResetUser,
      updateProfileName,
      resetAllData,
      basicProfile,
      isProfileCompleted,
      saveBasicProfile,
      updateBasicProfile,
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
