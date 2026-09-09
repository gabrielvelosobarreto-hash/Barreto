import {
  Utensils,
  Apple,
  Coffee,
  Refrigerator,
  Wine,
  Pizza,
  CookingPot,
  Home,
  Sofa,
  Bed,
  Bath,
  Building,
  DoorClosed,
  SprayCan,
  Sparkles,
  Brush,
  Droplets,
  Shirt,
  Laptop,
  Tv,
  Smartphone,
  Headphones,
  Briefcase,
  Car,
  Bike,
  Wrench,
  Hammer,
  Drill,
  Package,
  Dumbbell,
  HeartPulse,
  Flower2,
  TreePine,
  Gamepad2,
  Dog,
  Baby,
  ShoppingBag,
  type LucideIcon
} from 'lucide-react';

export interface SectorColorTheme {
  id: string;
  name: string;
  hex: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  barBg: string;
  lightBorder: string;
  ring: string;
  dotBg: string;
}

export const SECTOR_COLOR_THEMES: SectorColorTheme[] = [
  {
    id: 'emerald',
    name: 'Esmeralda / Verde',
    hex: '#10b981',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconBorder: 'border-emerald-200 dark:border-emerald-800',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    barBg: 'bg-emerald-500',
    lightBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    ring: 'ring-emerald-500',
    dotBg: 'bg-emerald-500'
  },
  {
    id: 'blue',
    name: 'Azul Real',
    hex: '#3b82f6',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconBorder: 'border-blue-200 dark:border-blue-800',
    iconText: 'text-blue-600 dark:text-blue-400',
    barBg: 'bg-blue-500',
    lightBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
    ring: 'ring-blue-500',
    dotBg: 'bg-blue-500'
  },
  {
    id: 'purple',
    name: 'Roxo Ametista',
    hex: '#a855f7',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconBorder: 'border-purple-200 dark:border-purple-800',
    iconText: 'text-purple-600 dark:text-purple-400',
    barBg: 'bg-purple-500',
    lightBorder: 'hover:border-purple-300 dark:hover:border-purple-700',
    ring: 'ring-purple-500',
    dotBg: 'bg-purple-500'
  },
  {
    id: 'amber',
    name: 'Âmbar Dourado',
    hex: '#f59e0b',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconBorder: 'border-amber-200 dark:border-amber-800',
    iconText: 'text-amber-600 dark:text-amber-400',
    barBg: 'bg-amber-500',
    lightBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    ring: 'ring-amber-500',
    dotBg: 'bg-amber-500'
  },
  {
    id: 'rose',
    name: 'Rosa Framboesa',
    hex: '#f43f5e',
    iconBg: 'bg-rose-50 dark:bg-rose-950/50',
    iconBorder: 'border-rose-200 dark:border-rose-800',
    iconText: 'text-rose-600 dark:text-rose-400',
    barBg: 'bg-rose-500',
    lightBorder: 'hover:border-rose-300 dark:hover:border-rose-700',
    ring: 'ring-rose-500',
    dotBg: 'bg-rose-500'
  },
  {
    id: 'orange',
    name: 'Laranja Solar',
    hex: '#f97316',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconBorder: 'border-orange-200 dark:border-orange-800',
    iconText: 'text-orange-600 dark:text-orange-400',
    barBg: 'bg-orange-500',
    lightBorder: 'hover:border-orange-300 dark:hover:border-orange-700',
    ring: 'ring-orange-500',
    dotBg: 'bg-orange-500'
  },
  {
    id: 'indigo',
    name: 'Índigo Noturno',
    hex: '#6366f1',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    iconBorder: 'border-indigo-200 dark:border-indigo-800',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    barBg: 'bg-indigo-500',
    lightBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
    ring: 'ring-indigo-500',
    dotBg: 'bg-indigo-500'
  },
  {
    id: 'cyan',
    name: 'Ciano Tech',
    hex: '#06b6d4',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/50',
    iconBorder: 'border-cyan-200 dark:border-cyan-800',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    barBg: 'bg-cyan-500',
    lightBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    ring: 'ring-cyan-500',
    dotBg: 'bg-cyan-500'
  },
  {
    id: 'teal',
    name: 'Verde Menta',
    hex: '#14b8a6',
    iconBg: 'bg-teal-50 dark:bg-teal-950/50',
    iconBorder: 'border-teal-200 dark:border-teal-800',
    iconText: 'text-teal-600 dark:text-teal-400',
    barBg: 'bg-teal-500',
    lightBorder: 'hover:border-teal-300 dark:hover:border-teal-700',
    ring: 'ring-teal-500',
    dotBg: 'bg-teal-500'
  },
  {
    id: 'red',
    name: 'Vermelho Rubi',
    hex: '#ef4444',
    iconBg: 'bg-red-50 dark:bg-red-950/50',
    iconBorder: 'border-red-200 dark:border-red-800',
    iconText: 'text-red-600 dark:text-red-400',
    barBg: 'bg-red-500',
    lightBorder: 'hover:border-red-300 dark:hover:border-red-700',
    ring: 'ring-red-500',
    dotBg: 'bg-red-500'
  },
  {
    id: 'fuchsia',
    name: 'Fúcsia / Magenta',
    hex: '#d946ef',
    iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-950/50',
    iconBorder: 'border-fuchsia-200 dark:border-fuchsia-800',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    barBg: 'bg-fuchsia-500',
    lightBorder: 'hover:border-fuchsia-300 dark:hover:border-fuchsia-700',
    ring: 'ring-fuchsia-500',
    dotBg: 'bg-fuchsia-500'
  },
  {
    id: 'slate',
    name: 'Ardósia / Grafite',
    hex: '#64748b',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconBorder: 'border-slate-300 dark:border-slate-700',
    iconText: 'text-slate-600 dark:text-slate-300',
    barBg: 'bg-slate-500',
    lightBorder: 'hover:border-slate-400 dark:hover:border-slate-600',
    ring: 'ring-slate-500',
    dotBg: 'bg-slate-500'
  }
];

export interface SectorIconItem {
  id: string;
  name: string;
  icon: LucideIcon;
  category: 'Cozinha' | 'Cômodos' | 'Limpeza' | 'Tecnologia' | 'Garagem' | 'Lazer & Saúde';
}

export const SECTOR_ICONS_LIST: SectorIconItem[] = [
  // Cozinha & Alimentos
  { id: 'Utensils', name: 'Talheres & Cozinha', icon: Utensils, category: 'Cozinha' },
  { id: 'Apple', name: 'Alimentos & Frutas', icon: Apple, category: 'Cozinha' },
  { id: 'Coffee', name: 'Café & Bebidas', icon: Coffee, category: 'Cozinha' },
  { id: 'Refrigerator', name: 'Geladeira & Frios', icon: Refrigerator, category: 'Cozinha' },
  { id: 'CookingPot', name: 'Panelas & Fogão', icon: CookingPot, category: 'Cozinha' },
  { id: 'Wine', name: 'Adega & Vinhos', icon: Wine, category: 'Cozinha' },
  { id: 'Pizza', name: 'Lanches & Padaria', icon: Pizza, category: 'Cozinha' },

  // Cômodos & Residência
  { id: 'Home', name: 'Casa & Geral', icon: Home, category: 'Cômodos' },
  { id: 'Sofa', name: 'Sala de Estar', icon: Sofa, category: 'Cômodos' },
  { id: 'Bed', name: 'Quarto & Dormitório', icon: Bed, category: 'Cômodos' },
  { id: 'Bath', name: 'Banheiro & Lavabo', icon: Bath, category: 'Cômodos' },
  { id: 'Building', name: 'Varanda & Sacada', icon: Building, category: 'Cômodos' },
  { id: 'DoorClosed', name: 'Closet & Despensa', icon: DoorClosed, category: 'Cômodos' },

  // Limpeza & Faxina
  { id: 'SprayCan', name: 'Produtos de Limpeza', icon: SprayCan, category: 'Limpeza' },
  { id: 'Sparkles', name: 'Higiene & Brilho', icon: Sparkles, category: 'Limpeza' },
  { id: 'Brush', name: 'Lavanderia & Escovas', icon: Brush, category: 'Limpeza' },
  { id: 'Droplets', name: 'Água & Líquidos', icon: Droplets, category: 'Limpeza' },
  { id: 'Shirt', name: 'Roupas & Tecidos', icon: Shirt, category: 'Limpeza' },

  // Tecnologia & Home Office
  { id: 'Laptop', name: 'Notebook & Tech', icon: Laptop, category: 'Tecnologia' },
  { id: 'Tv', name: 'Televisão & Cinema', icon: Tv, category: 'Tecnologia' },
  { id: 'Smartphone', name: 'Smartphones & Cabos', icon: Smartphone, category: 'Tecnologia' },
  { id: 'Headphones', name: 'Áudio & Música', icon: Headphones, category: 'Tecnologia' },
  { id: 'Briefcase', name: 'Escritório & Trabalho', icon: Briefcase, category: 'Tecnologia' },

  // Garagem, Ferramentas & Veículos
  { id: 'Car', name: 'Carro & Automotivo', icon: Car, category: 'Garagem' },
  { id: 'Bike', name: 'Bicicleta & Esporte', icon: Bike, category: 'Garagem' },
  { id: 'Wrench', name: 'Ferramentas Gerais', icon: Wrench, category: 'Garagem' },
  { id: 'Hammer', name: 'Martelo & Fixação', icon: Hammer, category: 'Garagem' },
  { id: 'Drill', name: 'Furadeira & Maquinário', icon: Drill, category: 'Garagem' },
  { id: 'Package', name: 'Caixas & Almoxarifado', icon: Package, category: 'Garagem' },

  // Lazer, Bem-estar & Outros
  { id: 'Dumbbell', name: 'Academia & Treino', icon: Dumbbell, category: 'Lazer & Saúde' },
  { id: 'HeartPulse', name: 'Farmácia & Cuidados', icon: HeartPulse, category: 'Lazer & Saúde' },
  { id: 'Flower2', name: 'Jardim & Flores', icon: Flower2, category: 'Lazer & Saúde' },
  { id: 'TreePine', name: 'Quintal & Chácara', icon: TreePine, category: 'Lazer & Saúde' },
  { id: 'Gamepad2', name: 'Games & Lazer', icon: Gamepad2, category: 'Lazer & Saúde' },
  { id: 'Dog', name: 'Pet Shop & Animais', icon: Dog, category: 'Lazer & Saúde' },
  { id: 'Baby', name: 'Bebê & Crianças', icon: Baby, category: 'Lazer & Saúde' },
  { id: 'ShoppingBag', name: 'Compras & Variados', icon: ShoppingBag, category: 'Lazer & Saúde' }
];

export const getSectorColorTheme = (colorId?: string, fallbackIconId?: string): SectorColorTheme => {
  if (colorId) {
    const found = SECTOR_COLOR_THEMES.find(c => c.id === colorId);
    if (found) return found;
  }
  const legacyMap: Record<string, string> = {
    Utensils: 'emerald',
    SprayCan: 'blue',
    Laptop: 'purple',
    Home: 'orange',
    Car: 'slate',
    Sofa: 'amber',
    Shirt: 'rose',
    Wrench: 'indigo',
    Package: 'cyan'
  };
  const mappedId = fallbackIconId ? legacyMap[fallbackIconId] || 'emerald' : 'emerald';
  return SECTOR_COLOR_THEMES.find(c => c.id === mappedId) || SECTOR_COLOR_THEMES[0];
};

export const getSectorIconData = (iconId: string): SectorIconItem => {
  return SECTOR_ICONS_LIST.find(i => i.id === iconId) || SECTOR_ICONS_LIST[0];
};
