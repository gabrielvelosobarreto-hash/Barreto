import fs from 'fs';
import path from 'path';

interface ServerStore {
  authConfig?: {
    name: string;
    pin: string;
    hint?: string;
    rememberMe: boolean;
  };
  basicProfile?: {
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
  lastUpdated?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'barreto-store.json');

// Ensure directory exists
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
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading server store:', err);
  }

  // Fallback /tmp location if needed
  const tmpFile = '/tmp/barreto-store.json';
  try {
    if (fs.existsSync(tmpFile)) {
      const raw = fs.readFileSync(tmpFile, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {}

  return {};
}

export function writeServerStore(data: Partial<ServerStore>): ServerStore {
  ensureDirectory();
  const current = readServerStore();
  const updated: ServerStore = {
    ...current,
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to primary store file:', err);
    // Fallback to /tmp
    try {
      fs.writeFileSync('/tmp/barreto-store.json', JSON.stringify(updated, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.error('Error writing to fallback store file:', tmpErr);
    }
  }

  return updated;
}
