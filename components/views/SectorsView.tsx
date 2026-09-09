"use client"
import { useState, useRef, useEffect, useMemo } from 'react';
import { 
  MoreVertical, 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Calendar,
  ArrowUpDown,
  Check,
  ChevronDown,
  ArrowDownAZ,
  ArrowUpZA,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  AlertCircle,
  Copy,
  AlertTriangle,
  SlidersHorizontal,
  FolderOpen,
  FolderInput,
  Palette,
  Sparkles,
  Package
} from 'lucide-react';
import { 
  SECTOR_COLOR_THEMES, 
  SECTOR_ICONS_LIST, 
  getSectorColorTheme, 
  getSectorIconData 
} from '@/lib/sectorThemeData';
import SectorCustomizationModal from './SectorCustomizationModal';
import { useApp, type Sector } from '@/lib/context/AppContext';

const INITIAL_MOCK_ITEMS: Record<number, any[]> = {
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

export const SORT_OPTIONS = [
  { id: 'prioridade', label: 'Prioridade (Alta → Baixa)', icon: AlertCircle },
  { id: 'nome-asc', label: 'Nome (A → Z)', icon: ArrowDownAZ },
  { id: 'nome-desc', label: 'Nome (Z → A)', icon: ArrowUpZA },
  { id: 'preco-desc', label: 'Maior Preço (R$)', icon: ArrowDownWideNarrow },
  { id: 'preco-asc', label: 'Menor Preço (R$)', icon: ArrowUpNarrowWide },
  { id: 'data-desc', label: 'Mais Recente', icon: Calendar },
  { id: 'data-asc', label: 'Mais Antigo', icon: Calendar },
] as const;

export type SortOptionType = typeof SORT_OPTIONS[number]['id'];

const getPriorityStyle = (priority: string) => {
  if (priority === 'Alta') return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/80';
  if (priority === 'Média') return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/80';
  return 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700';
};

interface SectorsViewProps {
  targetSectorId?: number | null;
  targetItemId?: number | null;
  onTargetHandled?: () => void;
}

export default function SectorsView({ targetSectorId, targetItemId, onTargetHandled }: SectorsViewProps = {}) {
  const { sectors, sectorItemsMap, setSectorItemsMap, addSector, updateSector, deleteSector } = useApp();
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sector Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    desc: '', 
    iconId: 'Utensils', 
    colorId: 'emerald' 
  });
  
  // Customization Menu Modal (Colors & Icons)
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [customizationInitialTab, setCustomizationInitialTab] = useState<'colors' | 'icons'>('colors');

  const handleOpenCustomization = (tab: 'colors' | 'icons' = 'colors') => {
    setCustomizationInitialTab(tab);
    setIsCustomizationOpen(true);
  };

  // Sector Details Modal & Selection
  const [detailsSector, setDetailsSector] = useState<Sector | null>(null);

  useEffect(() => {
    if (targetSectorId) {
      const sector = sectors.find(s => s.id === targetSectorId);
      if (sector) {
        setDetailsSector(sector);
        if (targetItemId) {
          setTimeout(() => {
            const el = document.getElementById(`item-${targetItemId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Small visual cue (could add a flash class but border ring is enough)
            }
          }, 400); // give the modal time to render
        }
      }
      if (onTargetHandled) {
        onTargetHandled();
      }
    }
  }, [targetSectorId, targetItemId, sectors, onTargetHandled]);

  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  
  // Bulk Actions Modals
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [targetSectorIdForMove, setTargetSectorIdForMove] = useState<number | null>(null);
  const [bulkPriorityValue, setBulkPriorityValue] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');

  // Sorting state for sector items
  const [itemSortBy, setItemSortBy] = useState<SortOptionType>('prioridade');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Single Item Action Menu & Deletion
  const [openItemMenuId, setOpenItemMenuId] = useState<number | null>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);
  const [openPriorityMenuId, setOpenPriorityMenuId] = useState<number | null>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  const [itemToDelete, setItemToDelete] = useState<{ sectorId: number; item: any } | null>(null);

  // Add / Edit single item modal inside details
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newItemData, setNewItemData] = useState({ name: '', desc: '', price: '', priority: 'Média' });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (itemMenuRef.current && !itemMenuRef.current.contains(event.target as Node)) {
        setOpenItemMenuId(null);
      }
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
        setOpenPriorityMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleItemMenu = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    setOpenItemMenuId(openItemMenuId === itemId ? null : itemId);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const sectorToDelete = sectors.find(s => s.id === id);
    deleteSector(id);
    setOpenMenuId(null);
    showToast(`Setor "${sectorToDelete?.name || ''}" removido.`);
  };

  const handleClearAllSectorItems = (sectorId: number) => {
    setSectorItemsMap(prev => ({ ...prev, [sectorId]: [] }));
    updateSector(sectorId, { items: 0 });
    setOpenMenuId(null);
    if (detailsSector?.id === sectorId) {
      setSelectedItemIds([]);
    }
    showToast('Todos os itens do setor foram removidos!');
  };

  const handleEdit = (e: React.MouseEvent, sector: any) => {
    e.stopPropagation();
    setModalMode('edit');
    setEditId(sector.id);
    setFormData({ 
      name: sector.name, 
      desc: sector.desc, 
      iconId: sector.iconId || 'Utensils',
      colorId: sector.colorId || 'emerald'
    });
    setOpenMenuId(null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({ 
      name: '', 
      desc: '', 
      iconId: 'Home', 
      colorId: 'emerald' 
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast('Por favor, informe o nome do setor.');
      return;
    }
    
    if (modalMode === 'add') {
      const newId = Date.now();
      addSector({
        id: newId,
        name: formData.name.trim(),
        desc: formData.desc.trim() || 'Nova categoria',
        iconId: formData.iconId,
        colorId: formData.colorId
      });
      showToast(`Setor "${formData.name}" criado com sucesso!`);
    } else {
      updateSector(editId!, { 
        name: formData.name.trim(), 
        desc: formData.desc.trim(), 
        iconId: formData.iconId,
        colorId: formData.colorId
      });
      
      // Update detailsSector if currently viewed
      if (detailsSector && detailsSector.id === editId) {
        setDetailsSector(prev => prev ? {
          ...prev,
          name: formData.name.trim(),
          desc: formData.desc.trim(),
          iconId: formData.iconId,
          colorId: formData.colorId
        } : null);
      }
      showToast('Setor atualizado com sucesso.');
    }
    setIsModalOpen(false);
  };

  const handleViewDetails = (sector: Sector) => {
    setDetailsSector(sector);
    setSelectedItemIds([]);
    setOpenMenuId(null);
    setOpenItemMenuId(null);
    setOpenPriorityMenuId(null);
    setIsSortDropdownOpen(false);
  };

  const handleCloseDetails = () => {
    setDetailsSector(null);
    setSelectedItemIds([]);
    setOpenPriorityMenuId(null);
  };

  // Multiple selection helpers (Checkboxes)
  const toggleSelectItem = (itemId: number) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = (currentItems: any[]) => {
    if (selectedItemIds.length === currentItems.length && currentItems.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(currentItems.map(i => i.id));
    }
  };

  // Bulk Actions
  const handleExecuteBulkDelete = () => {
    if (!detailsSector || selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    
    setSectorItemsMap(prev => {
      const currentList = prev[detailsSector.id] || [];
      return {
        ...prev,
        [detailsSector.id]: currentList.filter(i => !selectedItemIds.includes(i.id))
      };
    });

    updateSector(detailsSector.id, { items: Math.max(0, detailsSector.items - count) });

    setSelectedItemIds([]);
    setIsBulkDeleteModalOpen(false);
    showToast(`${count} ${count === 1 ? 'item excluído' : 'itens excluídos'} com sucesso!`);
  };

  const handleExecuteBulkPriority = (priority: 'Alta' | 'Média' | 'Baixa') => {
    if (!detailsSector || selectedItemIds.length === 0) return;
    const count = selectedItemIds.length;
    
    setSectorItemsMap(prev => {
      const currentList = prev[detailsSector.id] || [];
      return {
        ...prev,
        [detailsSector.id]: currentList.map(i => 
          selectedItemIds.includes(i.id) ? { ...i, priority } : i
        )
      };
    });

    setIsBulkPriorityModalOpen(false);
    showToast(`Prioridade de ${count} itens alterada para "${priority}"!`);
  };

  const handleExecuteBulkMove = () => {
    if (!detailsSector || selectedItemIds.length === 0) return;
    if (!targetSectorIdForMove) {
      showToast('Por favor, selecione um setor de destino.');
      return;
    }
    const destSector = sectors.find(s => s.id === targetSectorIdForMove);
    if (!destSector) return;

    const currentList = sectorItemsMap[detailsSector.id] || [];
    const itemsToMove = currentList.filter(i => selectedItemIds.includes(i.id));
    const count = itemsToMove.length;

    setSectorItemsMap(prev => {
      const originList = prev[detailsSector.id] || [];
      const destList = prev[targetSectorIdForMove] || [];
      return {
        ...prev,
        [detailsSector.id]: originList.filter(i => !selectedItemIds.includes(i.id)),
        [targetSectorIdForMove]: [...destList, ...itemsToMove]
      };
    });

    updateSector(detailsSector.id, { items: Math.max(0, detailsSector.items - count) });
    if (destSector) {
      updateSector(destSector.id, { items: destSector.items + count });
    }

    setSelectedItemIds([]);
    setIsBulkMoveModalOpen(false);
    showToast(`${count} ${count === 1 ? 'item transferido' : 'itens transferidos'} para "${destSector.name}"!`);
  };

  // Add / Edit Item
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setNewItemData({ name: '', desc: '', price: '', priority: 'Média' });
    setIsAddItemModalOpen(true);
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItem(item);
    setNewItemData({ 
      name: item.name, 
      desc: item.desc, 
      price: item.price.replace(/[^\d.,]/g, ''), 
      priority: item.priority 
    });
    setOpenItemMenuId(null);
    setIsAddItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!detailsSector) return;
    if (!newItemData.name.trim()) {
      showToast('Por favor, informe o nome do item.');
      return;
    }
    
    const numPrice = parseFloat(newItemData.price.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const formattedPrice = numPrice > 0 ? `R$ ${numPrice.toFixed(2).replace('.', ',')}` : 'R$ 0,00';

    if (editingItem) {
      setSectorItemsMap(prev => {
        const currentList = prev[detailsSector.id] || [];
        return {
          ...prev,
          [detailsSector.id]: currentList.map(i => i.id === editingItem.id ? {
            ...i,
            name: newItemData.name.trim(),
            desc: newItemData.desc.trim() || 'Sem descrição',
            price: formattedPrice,
            priority: newItemData.priority
          } : i)
        };
      });
      showToast(`Item "${newItemData.name}" atualizado!`);
    } else {
      const newItem = {
        id: Date.now(),
        name: newItemData.name.trim(),
        desc: newItemData.desc.trim() || 'Sem descrição',
        price: formattedPrice,
        date: new Date().toLocaleDateString('pt-BR'),
        priority: newItemData.priority
      };

      setSectorItemsMap(prev => {
        const currentList = prev[detailsSector.id] || [];
        return { ...prev, [detailsSector.id]: [...currentList, newItem] };
      });
      
      updateSector(detailsSector.id, { items: detailsSector.items + 1 });
      showToast(`Item "${newItemData.name}" adicionado ao setor!`);
    }

    setIsAddItemModalOpen(false);
    setEditingItem(null);
    setNewItemData({ name: '', desc: '', price: '', priority: 'Média' });
  };

  const confirmDeleteItem = (sectorId: number, item: any) => {
    setOpenItemMenuId(null);
    setItemToDelete({ sectorId, item });
  };

  const executeDeleteItem = () => {
    if (!itemToDelete) return;
    const { sectorId, item } = itemToDelete;
    
    setSectorItemsMap(prev => {
      const currentList = prev[sectorId] || [];
      return { ...prev, [sectorId]: currentList.filter(i => i.id !== item.id) };
    });

    updateSector(sectorId, { items: Math.max(0, (sectors.find(s => s.id === sectorId)?.items || 1) - 1) });

    setSelectedItemIds(prev => prev.filter(id => id !== item.id));
    setItemToDelete(null);
    showToast(`"${item.name}" foi excluído do setor.`);
  };

  const handleDuplicateItem = (sectorId: number, item: any) => {
    const duplicatedItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} (Cópia)`,
      date: new Date().toLocaleDateString('pt-BR')
    };

    setSectorItemsMap(prev => {
      const currentList = prev[sectorId] || [];
      return { ...prev, [sectorId]: [...currentList, duplicatedItem] };
    });

    updateSector(sectorId, { items: (sectors.find(s => s.id === sectorId)?.items || 0) + 1 });

    setOpenItemMenuId(null);
    showToast(`"${item.name}" duplicado com sucesso!`);
  };

  const handleUpdateItemPriority = (sectorId: number, itemId: number, newPriority: string) => {
    setSectorItemsMap(prev => {
      const currentList = prev[sectorId] || [];
      return {
        ...prev,
        [sectorId]: currentList.map(i => i.id === itemId ? { ...i, priority: newPriority } : i)
      };
    });
    setOpenItemMenuId(null);
    showToast(`Prioridade definida como ${newPriority}`);
  };

  const getSectorTotals = (sectorId: number) => {
    const items = sectorItemsMap[sectorId] || [];
    const count = items.length;
    const costNum = items.reduce((acc, item) => {
      const val = parseFloat(String(item.price).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      return acc + val;
    }, 0);
    return { count, cost: `R$ ${costNum.toFixed(2).replace('.', ',')}` };
  };

  // Itens ordenados dinamicamente
  const sortedSectorItems = useMemo(() => {
    if (!detailsSector) return [];
    const list = [...(sectorItemsMap[detailsSector.id] || [])];
    
    const getPriceNum = (p: string) => parseFloat(String(p).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const priorityWeight: Record<string, number> = { 'Alta': 1, 'Média': 2, 'Baixa': 3 };

    return list.sort((a, b) => {
      switch (itemSortBy) {
        case 'nome-asc':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'nome-desc':
          return b.name.localeCompare(a.name, 'pt-BR');
        case 'preco-desc':
          return getPriceNum(b.price) - getPriceNum(a.price);
        case 'preco-asc':
          return getPriceNum(a.price) - getPriceNum(b.price);
        case 'data-desc':
          return (b.id || 0) - (a.id || 0);
        case 'data-asc':
          return (a.id || 0) - (b.id || 0);
        case 'prioridade':
        default: {
          const wA = priorityWeight[a.priority] ?? 99;
          const wB = priorityWeight[b.priority] ?? 99;
          if (wA !== wB) return wA - wB;
          return a.name.localeCompare(b.name, 'pt-BR');
        }
      }
    });
  }, [detailsSector, sectorItemsMap, itemSortBy]);

  const isAllItemsSelected = sortedSectorItems.length > 0 && selectedItemIds.length === sortedSectorItems.length;
  const isPartiallySelected = selectedItemIds.length > 0 && selectedItemIds.length < sortedSectorItems.length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gerenciamento de Setores
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Organize cada ambiente e cômodo com cores temáticas e categorias inteligentes.
          </p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-slate-900 dark:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Novo Setor
        </button>
      </div>

      {/* Grid of Sector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {sectors.map((sector) => {
          const colorTheme = getSectorColorTheme(sector.colorId, sector.iconId);
          const iconData = getSectorIconData(sector.iconId);
          const IconComp = iconData.icon || Package;
          const isMenuOpen = openMenuId === sector.id;
          const { count, cost } = getSectorTotals(sector.id);

          return (
            <div 
              key={sector.id}
              onClick={() => handleViewDetails(sector)}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative group hover:shadow-md transition-all cursor-pointer ${colorTheme.lightBorder} ${isMenuOpen ? 'z-30' : 'z-0'}`}
            >
              <div className={`flex justify-between items-start mb-6 relative ${isMenuOpen ? 'z-50' : 'z-10'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 shadow-2xs ${colorTheme.iconBg} ${colorTheme.iconBorder}`}>
                  <IconComp className={`h-6 w-6 ${colorTheme.iconText}`} />
                </div>
                
                <div className="relative z-40" ref={isMenuOpen ? menuRef : null}>
                  <button 
                    onClick={(e) => toggleMenu(e, sector.id)}
                    className={`transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${isMenuOpen ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
                    title="Opções do setor"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  
                  {isMenuOpen && (
                    <div 
                      className="absolute right-0 top-9 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-950/10 dark:ring-white/10 opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button 
                        onClick={(e) => handleEdit(e, sector)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                      >
                        <Pencil className="w-4 h-4 text-slate-400" /> Editar Setor
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(sector); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                      >
                        <FolderOpen className="w-4 h-4 text-slate-400" /> Ver e Gerenciar Itens
                      </button>
                      {count > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Deseja excluir todos os ${count} itens do setor "${sector.name}"?`)) {
                              handleClearAllSectorItems(sector.id);
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors flex items-center gap-2.5"
                        >
                          <Trash2 className="w-4 h-4 text-amber-500" /> Limpar Todos os Itens
                        </button>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                      <button 
                        onClick={(e) => handleDelete(e, sector.id)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors flex items-center gap-2.5"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Excluir Setor
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6 relative z-10 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{sector.name}</h3>
                  <span className={`w-2 h-2 rounded-full ${colorTheme.dotBg}`} title={`Cor: ${colorTheme.name}`}></span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{sector.desc}</p>
              </div>
              
              <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-800 pt-4 relative z-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Itens</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{count}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Custo Estimado</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{cost}</p>
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-2xl ${colorTheme.barBg}`}></div>
            </div>
          );
        })}

        {/* Quick Add Sector Button */}
        <div 
          onClick={handleAdd}
          className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors min-h-[220px] group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 mb-3 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform">
            <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Criar setor</p>
        </div>
      </div>

      {/* Add / Edit Sector Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-850/70">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {modalMode === 'add' ? 'Adicionar Novo Setor' : 'Editar Setor'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Sector Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Setor
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm"
                  placeholder="Ex: Cozinha, Quarto Master, Garagem..."
                  autoFocus
                />
              </div>

              {/* Sector Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Descrição Curta
                </label>
                <input 
                  type="text" 
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 text-sm"
                  placeholder="Ex: Despensa, prateleiras e mantimentos"
                />
              </div>

              {/* Amostras Rápidas de Cores com Botão + Opções */}
              {(() => {
                const currentTheme = getSectorColorTheme(formData.colorId, formData.iconId);
                const baseColors = ['emerald', 'blue', 'purple', 'rose', 'amber', 'cyan'];
                const displayColorIds = formData.colorId && !baseColors.includes(formData.colorId)
                  ? [formData.colorId, ...baseColors.slice(0, 5)]
                  : baseColors;

                return (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-slate-400" /> Cor do Setor
                      </label>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${currentTheme.iconBg} ${currentTheme.iconBorder} ${currentTheme.iconText}`}>
                        {currentTheme.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {displayColorIds.map((colId) => {
                        const col = SECTOR_COLOR_THEMES.find(c => c.id === colId) || SECTOR_COLOR_THEMES[0];
                        const isSelected = formData.colorId === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, colorId: col.id })}
                            className={`h-10 rounded-xl flex items-center justify-center transition-all ${
                              isSelected 
                                ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-105 shadow-sm' 
                                : 'opacity-85 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                          </button>
                        );
                      })}

                      {/* Botão + de Cor */}
                      <button
                        type="button"
                        onClick={() => handleOpenCustomization('colors')}
                        className="h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center shadow-2xs active:scale-95"
                        title="Mais opções de cores"
                        aria-label="Mais opções de cores"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Amostras Rápidas de Ícones com Botão + */}
              {(() => {
                const currentTheme = getSectorColorTheme(formData.colorId, formData.iconId);
                const currentIcon = getSectorIconData(formData.iconId);
                const baseIcons = ['Utensils', 'Home', 'SprayCan', 'Laptop', 'Wrench', 'ShoppingBag'];
                const displayIconIds = formData.iconId && !baseIcons.includes(formData.iconId)
                  ? [formData.iconId, ...baseIcons.slice(0, 5)]
                  : baseIcons;

                return (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ícone do Setor
                      </label>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {currentIcon.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {displayIconIds.map((iconId) => {
                        const iconData = getSectorIconData(iconId);
                        const IconComponent = iconData.icon || Package;
                        const isSelected = formData.iconId === iconData.id;

                        return (
                          <button
                            key={iconData.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, iconId: iconData.id })}
                            className={`h-10 rounded-xl flex items-center justify-center transition-all border ${
                              isSelected
                                ? `${currentTheme.iconBg} ${currentTheme.iconBorder} ring-2 ring-emerald-500/50 scale-105 shadow-xs`
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 hover:scale-105'
                            }`}
                            title={iconData.name}
                          >
                            <IconComponent className={`w-5 h-5 ${isSelected ? currentTheme.iconText : 'text-slate-600 dark:text-slate-300'}`} />
                          </button>
                        );
                      })}

                      {/* Botão + de Ícone */}
                      <button
                        type="button"
                        onClick={() => handleOpenCustomization('icons')}
                        className="h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center justify-center shadow-2xs active:scale-95"
                        title="Mais opções de ícones"
                        aria-label="Mais opções de ícones"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Live Preview Card */}
              {(() => {
                const currentTheme = getSectorColorTheme(formData.colorId, formData.iconId);
                const currentIcon = getSectorIconData(formData.iconId);
                const CurrentIconComp = currentIcon.icon || Package;

                return (
                  <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-750">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Prévia Visual em Tempo Real
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCustomization('colors')}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Edição
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${currentTheme.iconBg} ${currentTheme.iconBorder}`}>
                        <CurrentIconComp className={`w-5 h-5 ${currentTheme.iconText}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {formData.name.trim() || 'Nome do Setor'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {formData.desc.trim() || 'Descrição e itens deste ambiente'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/70 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Salvar Setor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sector Customization Modal (Colors & Icons Menu) */}
      {isCustomizationOpen && (
        <SectorCustomizationModal
          key={`${formData.colorId}-${formData.iconId}-${customizationInitialTab}`}
          isOpen={isCustomizationOpen}
          onClose={() => setIsCustomizationOpen(false)}
          selectedColorId={formData.colorId}
          selectedIconId={formData.iconId}
          initialTab={customizationInitialTab}
          sectorNamePreview={formData.name}
          onSelect={(colorId, iconId) => {
            setFormData(prev => ({ ...prev, colorId, iconId }));
            showToast('Ícone e cor atualizados!');
          }}
        />
      )}

      {/* Sector Details Modal with Items List and Bulk Checkboxes */}
      {detailsSector && (() => {
        const sectorTheme = getSectorColorTheme(detailsSector.colorId, detailsSector.iconId);
        const sectorIconData = getSectorIconData(detailsSector.iconId);
        const SectorIcon = sectorIconData.icon || Package;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border shadow-xs ${sectorTheme.iconBg} ${sectorTheme.iconBorder}`}>
                    <SectorIcon className={`h-6 w-6 ${sectorTheme.iconText}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{detailsSector.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sectorTheme.iconBg} ${sectorTheme.iconBorder} ${sectorTheme.iconText}`}>
                        {sectorTheme.name.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {detailsSector.desc}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDetails}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Body / Items List */}
              <div className="flex-1 overflow-y-auto bg-slate-50/40 dark:bg-slate-950/40 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Itens Cadastrados
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {sortedSectorItems.length}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Gerencie, ordene e utilize caixas de seleção para ações em lote
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {/* Botão de Ordenação */}
                    <div className="relative" ref={sortDropdownRef}>
                      <button 
                        type="button"
                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 shadow-xs ${
                          isSortDropdownOpen 
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        title="Ordenar itens deste setor"
                      >
                        <ArrowUpDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">Ordenar:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 max-w-[130px] truncate">
                          {SORT_OPTIONS.find(o => o.id === itemSortBy)?.label.split(' ')[0]}
                        </span>
                      </button>

                      {isSortDropdownOpen && (
                        <div className="absolute right-0 top-11 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/80 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                              <SlidersHorizontal className="w-3 h-3" /> Critério de Ordenação
                            </span>
                          </div>
                          <div className="py-1">
                            {SORT_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isSelected = itemSortBy === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => {
                                    setItemSortBy(option.id);
                                    setIsSortDropdownOpen(false);
                                    showToast(`Ordenado por: ${option.label}`);
                                  }}
                                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                    isSelected 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold' 
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5">
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                                    {option.label}
                                  </span>
                                  {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleOpenAddItem}
                      className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 shrink-0"
                    >
                      <Plus className="h-4 w-4" /> Adicionar Novo Item
                    </button>
                  </div>
                </div>

                {/* Bulk Actions & Checkbox Header Bar */}
                {sortedSectorItems.length > 0 && (
                  <div className={`rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-3 border mb-3 transition-all ${
                    selectedItemIds.length > 0
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/10'
                      : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750'
                  }`}>
                    
                    {/* Master Checkbox */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectAll(sortedSectorItems)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isAllItemsSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : isPartiallySelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                        }`}
                        title={isAllItemsSelected ? "Desmarcar todos os itens" : "Selecionar todos os itens"}
                      >
                        {isAllItemsSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        {isPartiallySelected && <span className="w-2 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />}
                      </button>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {selectedItemIds.length > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-300">
                            {selectedItemIds.length} de {sortedSectorItems.length} selecionados
                          </span>
                        ) : (
                          `Selecionar todos os itens (${sortedSectorItems.length})`
                        )}
                      </span>
                    </div>

                    {/* Bulk Action Buttons */}
                    {selectedItemIds.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Mudar Prioridade em Lote */}
                        <button
                          type="button"
                          onClick={() => setIsBulkPriorityModalOpen(true)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                          <span>Mudar Prioridade</span>
                        </button>

                        {/* Mover para Outro Setor em Lote */}
                        <button
                          type="button"
                          onClick={() => {
                            const otherSectors = sectors.filter(s => s.id !== detailsSector.id);
                            if (otherSectors.length > 0) {
                              setTargetSectorIdForMove(otherSectors[0].id);
                            }
                            setIsBulkMoveModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-blue-500" />
                          <span>Mover para Setor</span>
                        </button>

                        {/* Excluir em Lote */}
                        <button
                          type="button"
                          onClick={() => setIsBulkDeleteModalOpen(true)}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir ({selectedItemIds.length})</span>
                        </button>

                        {/* Desmarcar */}
                        <button
                          type="button"
                          onClick={() => setSelectedItemIds([])}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          title="Limpar seleção"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {sortedSectorItems && sortedSectorItems.length > 0 ? (
                    sortedSectorItems.map((item) => {
                      const isItemSelected = selectedItemIds.includes(item.id);

                      return (
                        <div 
                          key={item.id} 
                          id={`item-${item.id}`}
                          className={`rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all relative border ${openItemMenuId === item.id || openPriorityMenuId === item.id ? 'z-50' : 'z-0'} ${
                            isItemSelected
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500/20'
                              : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:shadow-sm'
                          }`}
                        >
                          {/* Caixa de Seleção Individual */}
                          <div className="flex items-center self-start md:self-center pr-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleSelectItem(item.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                isItemSelected
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                  : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                              }`}
                              title={isItemSelected ? "Desmarcar item" : "Selecionar item"}
                            >
                              {isItemSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.desc}</p>
                          </div>
                          
                          {/* Priority Button with Options Dropdown */}
                          <div 
                            className="relative shrink-0" 
                            ref={openPriorityMenuId === item.id ? priorityMenuRef : null}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenItemMenuId(null);
                                setOpenPriorityMenuId(openPriorityMenuId === item.id ? null : item.id);
                              }}
                              title={`Prioridade atual: ${item.priority}. Clique para escolher.`}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs hover:shadow-xs flex items-center gap-1.5 select-none ${getPriorityStyle(item.priority)}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.priority === 'Alta' ? 'bg-rose-500' :
                                item.priority === 'Média' ? 'bg-amber-500' : 'bg-slate-400'
                              }`} />
                              <span>{item.priority}</span>
                              <ChevronDown className={`w-3 h-3 opacity-60 transition-transform duration-200 ${openPriorityMenuId === item.id ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Caixa de Opções de Prioridade */}
                            {openPriorityMenuId === item.id && (
                              <div 
                                className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-950/10 dark:ring-white/10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                                  Definir Prioridade
                                </div>
                                {(['Alta', 'Média', 'Baixa'] as const).map((p) => {
                                  const isSelected = item.priority === p;
                                  return (
                                    <button
                                      key={p}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateItemPriority(detailsSector.id, item.id, p);
                                        setOpenPriorityMenuId(null);
                                        showToast(`Prioridade alterada para ${p}!`);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                        isSelected 
                                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold' 
                                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${
                                          p === 'Alta' ? 'bg-rose-500' :
                                          p === 'Média' ? 'bg-amber-500' : 'bg-slate-400'
                                        }`} />
                                        <span>{p}</span>
                                      </span>
                                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* Price & Date */}
                          <div className="flex items-center justify-between md:flex-col md:items-end gap-1 shrink-0 md:w-28 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-slate-750 md:border-none">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.price}</span>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {item.date}
                            </span>
                          </div>

                          {/* Individual Item Actions */}
                          <div className="flex items-center justify-end gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-750">
                            {/* Botão Rápido de Excluir */}
                            <button 
                              onClick={() => confirmDeleteItem(detailsSector.id, item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Excluir item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {/* Menu de Ações do Item */}
                            <div className="relative" ref={openItemMenuId === item.id ? itemMenuRef : null}>
                              <button 
                                onClick={(e) => toggleItemMenu(e, item.id)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  openItemMenuId === item.id 
                                    ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-750' 
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                                }`}
                                title="Menu de opções do item"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {openItemMenuId === item.id && (
                                <div 
                                  className="absolute right-0 top-8 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-950/10 dark:ring-white/10 opacity-100"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                                      {item.name}
                                    </p>
                                  </div>

                                  <button 
                                    onClick={() => confirmDeleteItem(detailsSector.id, item)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> 
                                    Excluir Item
                                  </button>

                                  <button 
                                    onClick={() => handleOpenEditItem(item)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-slate-400" /> 
                                    Editar Detalhes
                                  </button>

                                  <button 
                                    onClick={() => handleDuplicateItem(detailsSector.id, item)}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-slate-400" /> 
                                    Duplicar Item
                                  </button>

                                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>

                                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    Alterar Prioridade:
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 px-2.5 py-1">
                                    {(['Alta', 'Média', 'Baixa'] as const).map(p => (
                                      <button
                                        key={p}
                                        onClick={() => handleUpdateItemPriority(detailsSector.id, item.id, p)}
                                        className={`py-1 text-[10px] font-bold rounded-md transition-colors ${
                                          item.priority === p 
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                      >
                                        {p}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                      <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum item cadastrado neste setor ainda.</p>
                      <button
                        onClick={handleOpenAddItem}
                        className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar o primeiro item
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 md:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center shrink-0">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Qtd. Itens</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{getSectorTotals(detailsSector.id).count}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Custo Total</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{getSectorTotals(detailsSector.id).cost}</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseDetails}
                  className="px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add / Edit Single Item Modal */}
      {isAddItemModalOpen && detailsSector && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? 'Editar Item no Setor' : 'Adicionar Item no Setor'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddItemModalOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Item</label>
                <input 
                  type="text" 
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  placeholder="Ex: Sabão em Pó 1kg"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
                <input 
                  type="text" 
                  value={newItemData.desc}
                  onChange={(e) => setNewItemData({...newItemData, desc: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  placeholder="Ex: Marca XYZ"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preço Estimado</label>
                  <input 
                    type="text" 
                    value={newItemData.price}
                    onChange={(e) => setNewItemData({...newItemData, price: e.target.value})}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                    placeholder="Ex: 14,90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prioridade</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Alta', 'Média', 'Baixa'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewItemData({ ...newItemData, priority: p })}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          newItemData.priority === p
                            ? p === 'Alta'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/60 dark:border-rose-500 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-xs'
                              : p === 'Média'
                              ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/60 dark:border-amber-500 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                              : 'bg-slate-100 border-slate-400 text-slate-700 dark:bg-slate-800 dark:border-slate-500 dark:text-slate-200 ring-2 ring-slate-400/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          p === 'Alta' ? 'bg-rose-500' : p === 'Média' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsAddItemModalOpen(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveItem}
                className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {editingItem ? 'Salvar Alterações' : 'Adicionar Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão em Lote */}
      {isBulkDeleteModalOpen && detailsSector && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-5 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3.5 border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Excluir {selectedItemIds.length} itens?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tem certeza que deseja remover os <strong className="text-slate-900 dark:text-slate-200">{selectedItemIds.length} itens selecionados</strong> deste setor? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Sim, Excluir Itens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Prioridade em Lote */}
      {isBulkPriorityModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-5 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3.5 border border-amber-100 dark:border-amber-900/50">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Alterar Prioridade em Lote</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Defina o novo nível de prioridade para os <strong className="text-slate-900 dark:text-slate-200">{selectedItemIds.length} itens selecionados</strong>:
            </p>
            
            <div className="grid grid-cols-3 gap-2 my-4">
              {(['Alta', 'Média', 'Baixa'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBulkPriorityValue(p)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    bulkPriorityValue === p
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkPriorityModalOpen(false)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExecuteBulkPriority(bulkPriorityValue)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                Aplicar a Todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mover Itens em Lote para Outro Setor */}
      {isBulkMoveModalOpen && detailsSector && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-5 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3.5 border border-blue-100 dark:border-blue-900/50">
              <FolderInput className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Mover para Outro Setor</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Transferir os <strong className="text-slate-900 dark:text-slate-200">{selectedItemIds.length} itens</strong> para qual setor destino?
            </p>
            
            <div className="my-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Selecione o Setor Destino:
              </label>
              <select
                value={targetSectorIdForMove || ''}
                onChange={(e) => setTargetSectorIdForMove(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {sectors
                  .filter(s => s.id !== detailsSector.id)
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.desc})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkMove}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Mover Itens
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Item Individual */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-5 animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3.5 border border-rose-100 dark:border-rose-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Excluir Item?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tem certeza que deseja excluir o item <strong className="text-slate-900 dark:text-slate-200">&ldquo;{itemToDelete.item.name}&rdquo;</strong>?
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteItem}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[80] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200 border border-slate-700 dark:border-slate-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
