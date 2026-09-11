import fs from 'fs';
import path from 'path';

export interface UserAccount {
  username: string;
  name: string;
  pin: string;
  hint?: string;
  rememberMe?: boolean;
  basicProfile: {
    fullName: string;
    residenceName: string;
    residenceType: string;
    phone?: string;
    cityState?: string;
    address?: string;
    notes?: string;
    isCompleted: boolean;
    completedAt: string;
  };
  sectors?: any[];
  sectorItemsMap?: Record<number, any[]>;
  shoppingItems?: any[];
  priorityItems?: any[];
  maintenances?: any[];
  shoppingCategories?: string[];
  updatedAt?: string;
}

export interface ServerStore {
  users: Record<string, UserAccount>;
  lastUpdated?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'barreto-store.json');
const TMP_FILE = '/tmp/barreto-store.json';

// Default initial user for Barreto
const DEFAULT_BARRETO_USER: UserAccount = {
  username: 'barreto',
  name: 'Gabriel Veloso Barreto',
  pin: '1234',
  hint: '',
  rememberMe: true,
  basicProfile: {
    fullName: 'Gabriel Veloso Barreto',
    residenceName: 'Arniqueiras',
    residenceType: 'Casa',
    phone: '',
    cityState: 'Brasília - DF',
    address: 'Arniqueiras',
    notes: '',
    isCompleted: true,
    completedAt: new Date().toISOString(),
  },
  sectors: [],
  sectorItemsMap: {},
  shoppingItems: [],
  priorityItems: [],
  maintenances: [],
  shoppingCategories: [],
  updatedAt: new Date().toISOString(),
};

function ensureDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

export function readServerStore(): ServerStore {
  ensureDirectory();
  let rawData: any = null;

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      rawData = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading server store from primary path:', err);
  }

  if (!rawData) {
    try {
      if (fs.existsSync(TMP_FILE)) {
        const raw = fs.readFileSync(TMP_FILE, 'utf-8');
        rawData = JSON.parse(raw);
      }
    } catch {}
  }

  // Ensure structure with users dictionary
  const store: ServerStore = {
    users: {},
    lastUpdated: new Date().toISOString(),
  };

  if (rawData && typeof rawData === 'object') {
    if (rawData.users && typeof rawData.users === 'object') {
      store.users = rawData.users;
    }

    // Migrate legacy single authConfig/basicProfile if users dictionary is empty
    if (Object.keys(store.users).length === 0 && rawData.authConfig) {
      const legacyUserKey = 'barreto';
      store.users[legacyUserKey] = {
        username: legacyUserKey,
        name: rawData.authConfig.name || 'Gabriel Veloso Barreto',
        pin: rawData.authConfig.pin || '1234',
        hint: rawData.authConfig.hint || '',
        rememberMe: true,
        basicProfile: rawData.basicProfile || DEFAULT_BARRETO_USER.basicProfile,
        sectors: rawData.sectors || [],
        sectorItemsMap: rawData.sectorItemsMap || {},
        shoppingItems: rawData.shoppingItems || [],
        priorityItems: rawData.priorityItems || [],
        maintenances: rawData.maintenances || [],
        shoppingCategories: rawData.shoppingCategories || [],
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Always make sure default 'barreto' account exists
  if (!store.users['barreto']) {
    store.users['barreto'] = { ...DEFAULT_BARRETO_USER };
  }

  return store;
}

export function writeServerStore(store: ServerStore): ServerStore {
  ensureDirectory();
  store.lastUpdated = new Date().toISOString();

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to primary store file:', err);
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing to fallback store file:', tmpErr);
    }
  }

  return store;
}

export function getUserAccount(username: string): UserAccount | null {
  const store = readServerStore();
  const normalized = (username || '').trim().toLowerCase();
  
  if (!normalized) return null;

  if (store.users[normalized]) {
    return store.users[normalized];
  }

  // Check aliases that map to barreto
  if (store.users['barreto']) {
    if (
      normalized === 'gabriel' ||
      normalized === 'gabriel barreto' ||
      normalized === 'gabriel veloso barreto' ||
      normalized === 'gabrielvelosobarreto@gmail.com' ||
      normalized === 'casa' ||
      normalized === 'arniqueiras'
    ) {
      return store.users['barreto'];
    }
  }

  // Check matching by user full name
  for (const key of Object.keys(store.users)) {
    const u = store.users[key];
    if (u.name && u.name.trim().toLowerCase() === normalized) {
      return u;
    }
    if (u.username && u.username.trim().toLowerCase() === normalized) {
      return u;
    }
  }

  // If there is only one user configured and the query matches part of their name or email
  const userKeys = Object.keys(store.users);
  if (userKeys.length === 1) {
    const singleUser = store.users[userKeys[0]];
    if (
      normalized.includes('barreto') ||
      normalized.includes('gabriel') ||
      (singleUser.name && singleUser.name.toLowerCase().includes(normalized))
    ) {
      return singleUser;
    }
  }

  return null;
}

export function saveUserAccount(account: UserAccount): UserAccount {
  const store = readServerStore();
  const normalized = account.username.trim().toLowerCase();

  const existing = store.users[normalized] || {};
  const updated: UserAccount = {
    ...existing,
    ...account,
    username: normalized,
    updatedAt: new Date().toISOString(),
  };

  store.users[normalized] = updated;
  writeServerStore(store);
  return updated;
}
