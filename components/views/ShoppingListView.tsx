"use client"
import { 
  Search, 
  Droplets, 
  SprayCan, 
  Hand, 
  Plus, 
  Tag, 
  X, 
  Apple, 
  Carrot, 
  Milk, 
  Plug, 
  Heart, 
  Package, 
  Filter, 
  Trash2, 
  MoreVertical, 
  Check, 
  SlidersHorizontal, 
  RotateCcw, 
  AlertTriangle 
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useApp, type PriorityType } from '@/lib/context/AppContext';

const AVAILABLE_ITEM_ICONS = [
  { id: 'Tag', icon: Tag },
  { id: 'Droplets', icon: Droplets },
  { id: 'SprayCan', icon: SprayCan },
  { id: 'Hand', icon: Hand },
  { id: 'Apple', icon: Apple },
  { id: 'Carrot', icon: Carrot },
  { id: 'Milk', icon: Milk },
  { id: 'Plug', icon: Plug },
  { id: 'Heart', icon: Heart },
  { id: 'Package', icon: Package },
];



const SUGGESTIONS = [
  'Arroz', 'Feijão', 'Açúcar', 'Café', 'Leite', 'Óleo', 'Azeite', 'Macarrão', 
  'Sabão em Pó', 'Detergente', 'Amaciante', 'Papel Higiênico', 'Pasta de Dente', 
  'Sabonete', 'Desodorante', 'Pão', 'Manteiga', 'Queijo', 'Presunto', 'Ovos'
];

export default function ShoppingListView() {
  const { 
    shoppingItems, 
    toggleShoppingItem, 
    addShoppingItem,
    editShoppingItem, 
    removeShoppingItem, 
    updateShoppingItemPriority,
    bulkToggleShoppingItems,
    bulkRemoveShoppingItems,
    bulkUpdateShoppingItemPriority,
    shoppingStats,
    shoppingCategories,
    addShoppingCategory,
    updateShoppingCategory,
    deleteShoppingCategory
  } = useApp();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  
  // Selection state for bulk activities
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkPriorityModalOpen, setIsBulkPriorityModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [bulkPriorityTarget, setBulkPriorityTarget] = useState<PriorityType>('Alta');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [catEditName, setCatEditName] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('Alimentos');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemIcon, setNewItemIcon] = useState('Tag');
  const [newItemPriority, setNewItemPriority] = useState<PriorityType>('Média');
  const [nameError, setNameError] = useState(false);

  // Item Action Menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    return shoppingItems.filter(i => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeFilter === 'Todos' || i.category === activeFilter;
      const matchPriority = priorityFilter === 'Todas' || i.priority === priorityFilter;
      return matchSearch && matchCat && matchPriority;
    });
  }, [shoppingItems, search, activeFilter, priorityFilter]);

  // Bulk selection calculations
  const allVisibleSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItemIds.includes(i.id));
  const isPartiallySelected = selectedItemIds.length > 0 && !allVisibleSelected;

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map(i => i.id));
    }
  };

  // Bulk actions handlers
  const handleBulkMarkPurchased = (checked: boolean) => {
    bulkToggleShoppingItems(selectedItemIds, checked);
    showToast(checked ? `${selectedItemIds.length} itens marcados como comprados!` : `${selectedItemIds.length} itens marcados como pendentes!`);
    setSelectedItemIds([]);
  };

  const handleBulkChangePriority = (priority: PriorityType) => {
    bulkUpdateShoppingItemPriority(selectedItemIds, priority);
    showToast(`Prioridade alterada para ${priority} em ${selectedItemIds.length} itens!`);
    setIsBulkPriorityModalOpen(false);
    setSelectedItemIds([]);
  };

  const handleBulkDelete = () => {
    bulkRemoveShoppingItems(selectedItemIds);
    showToast(`${selectedItemIds.length} itens excluídos da lista!`);
    setIsBulkDeleteModalOpen(false);
    setSelectedItemIds([]);
  };

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    
    if (editingItemId) {
      editShoppingItem(editingItemId, {
        name: newItemName.trim(),
        
        category: newItemCat,
        priority: newItemPriority,
        iconId: newItemIcon
      });
      showToast('Item atualizado com sucesso!');
    } else {
      addShoppingItem({
        name: newItemName.trim(),
        checked: false,
        price: 'R$ 0,00',
        numPrice: 0,
        category: newItemCat,
        priority: newItemPriority,
        iconId: newItemIcon
      });
      showToast('Item adicionado à lista!');
    }
    
    setNewItemName('');
    
    setNewItemCat('none');
    setNewItemPriority('Média');
    setEditingItemId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Lista de Compras</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {shoppingStats.totalCount} itens cadastrados • {shoppingStats.pendingCount} pendentes • {shoppingStats.completedCount} concluídos
          </p>
        </div>
        <button type="button" onClick={() => { setEditingItemId(null); setNewItemName('');  setNewItemCat('none'); setNewItemPriority('Média'); setIsModalOpen(true); }}
          className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" /> Novo Item
        </button>
      </div>

      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <input 
          type="text" 
          value={search}
          list="shopping-suggestions"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ou adicionar produtos comuns..." 
          className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors shadow-sm"
        />
        <datalist id="shopping-suggestions">
          {SUGGESTIONS.map(suggestion => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
        <button type="button" 
          onClick={() => setIsCategoryModalOpen(true)}
          className="flex-shrink-0 flex items-center justify-center px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
        {['Todos', ...shoppingCategories].map((chip) => {
          const isActive = activeFilter === chip;
          return (
            <button type="button" 
              key={chip}
              onClick={() => setActiveFilter(chip)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full border transition-all active:scale-95 ${
                isActive 
                  ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-sm' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="Todas">Todas as Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Barra de Seleção e Atividades em Escala */}
      <div className={`rounded-2xl p-3 border transition-all flex flex-wrap items-center justify-between gap-3 ${
        selectedItemIds.length > 0 
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 shadow-xs' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
      }`}>
        {/* Botão Selecionar Todos */}
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={handleToggleSelectAll}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              allVisibleSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : selectedItemIds.length > 0
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={allVisibleSelected ? "Desmarcar todos os itens" : "Selecionar todos os itens"}
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
              allVisibleSelected 
                ? 'bg-white text-emerald-600 border-white' 
                : isPartiallySelected
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-900'
            }`}>
              {allVisibleSelected && <Check className="w-3 h-3 stroke-[3]" />}
              {isPartiallySelected && <span className="w-2 h-0.5 bg-white rounded-full" />}
            </div>
            <span>Selecionar Todos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              allVisibleSelected
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              {filteredItems.length}
            </span>
          </button>
        </div>

        {/* Atividades em Escala (Bulk Actions) */}
        {selectedItemIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mr-2 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
              {String(selectedItemIds.length).padStart(2, '0')} {selectedItemIds.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>

            {/* Marcar Comprados */}
            <button type="button"
              onClick={() => handleBulkMarkPurchased(true)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Marcar todos os selecionados como comprados"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Marcar Comprados</span>
            </button>

            {/* Marcar Pendentes */}
            <button type="button"
              onClick={() => handleBulkMarkPurchased(false)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Marcar todos os selecionados como pendentes"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Marcar Pendentes</span>
            </button>

            {/* Mudar Prioridade em Escala */}
            <button type="button"
              onClick={() => setIsBulkPriorityModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Alterar prioridade de todos os selecionados"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
              <span>Mudar Prioridade</span>
            </button>

            {/* Excluir em Escala */}
            <button type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
              title="Excluir itens selecionados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir ({selectedItemIds.length})</span>
            </button>

            {/* Desmarcar / Limpar */}
            <button type="button"
              onClick={() => setSelectedItemIds([])}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Limpar seleção"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 pb-24">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-medium">Nenhum item encontrado.</div>
        ) : (
          filteredItems.map((item) => {
            const Icon = AVAILABLE_ITEM_ICONS.find(i => i.id === item.iconId)?.icon || Tag;
            const priorityColors = {
              Alta: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
              Média: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
              Baixa: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
            };
            const pColor = priorityColors[item.priority] || priorityColors.Média;
            const isSelected = selectedItemIds.includes(item.id);

            return (
              <div 
                key={item.id} 
                className={`rounded-2xl p-4 border transition-all flex items-center gap-3 md:gap-4 ${
                  isSelected 
                    ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 shadow-xs ring-1 ring-emerald-500/20' 
                    : item.checked 
                    ? 'opacity-60 bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Checkbox para Seleção em Escala */}
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItemIds(prev => 
                      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                    );
                  }}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-800 shadow-sm'
                  }`}
                  title={isSelected ? "Desmarcar item" : "Selecionar para atividades em escala"}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                  <Icon className="h-5 w-5 md:h-6 md:w-6 text-slate-500 dark:text-slate-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h2 
                      onClick={() => toggleShoppingItem(item.id)}
                      className={`cursor-pointer text-base font-semibold text-slate-900 dark:text-slate-100 truncate ${item.checked ? 'line-through text-slate-500 dark:text-slate-500' : ''}`}
                    >
                      {item.name}
                    </h2>
                    <select
                      value={item.priority}
                      onChange={(e) => updateShoppingItemPriority(item.id, e.target.value as PriorityType)}
                      className={`appearance-none cursor-pointer outline-none inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${pColor}`}
                    >
                      <option value="Alta">ALTA</option>
                      <option value="Média">MÉDIA</option>
                      <option value="Baixa">BAIXA</option>
                    </select>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Preço Estimado: {item.price}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status de Comprado / Pendente */}
                  <label className="flex items-center cursor-pointer" title={item.checked ? "Marcar como pendente" : "Marcar como comprado"}>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-slate-300 dark:border-slate-600 dark:bg-slate-800 transition-all checked:border-emerald-500 checked:bg-emerald-500 hover:border-emerald-400 shadow-sm"
                        checked={item.checked}
                        onChange={() => toggleShoppingItem(item.id)}
                      />
                      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 transition-opacity peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </label>

                  <button type="button" 
                    onClick={() => removeShoppingItem(item.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Remover da lista"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* 3-Dots Action Menu with Delete Option */}
                  <div className="relative" ref={openMenuId === item.id ? menuRef : null}>
                    <button type="button"
                      onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        openMenuId === item.id 
                          ? 'bg-slate-150 dark:bg-slate-800 text-slate-900 dark:text-slate-100' 
                          : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                      title="Mais opções do item"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openMenuId === item.id && (
                      <div 
                        className="absolute right-0 top-9 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-950/10 dark:ring-white/10 opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                            {item.name}
                          </p>
                        </div>
                        
                        {/* Opção Excluir no Menu */}
                        <button type="button"
                          onClick={() => {
                            removeShoppingItem(item.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          Excluir da Lista
                        </button>
                        <button type="button"
                          onClick={() => {
                            setEditingItemId(item.id);
                            setNewItemName(item.name);
                            
                            setNewItemCat(item.category || 'Alimentos');
                            setNewItemPriority(item.priority || 'Média');
                            setNewItemIcon(item.iconId || 'shopping-cart');
                            setIsModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          Editar Item</button>

                        <button type="button"
                          onClick={() => {
                            toggleShoppingItem(item.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          {item.checked ? 'Marcar como Pendente' : 'Marcar como Comprado'}
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                        
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Mudar Prioridade:
                        </div>
                        <div className="grid grid-cols-1 gap-1 px-2.5 py-1">
                          {(['Alta', 'Média', 'Baixa'] as const).map((p) => (
                            <button type="button"
                              key={p}
                              onClick={() => {
                                updateShoppingItemPriority(item.id, p);
                                setOpenMenuId(null);
                              }}
                              className={`w-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                item.priority === p 
                                  ? p === 'Alta' 
                                    ? 'bg-rose-600 text-white' 
                                    : p === 'Média'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-600 text-white'
                                  : p === 'Alta'
                                    ? 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                    : p === 'Média'
                                    ? 'text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    : 'text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.priority === p 
                                  ? 'bg-white' 
                                  : p === 'Alta' ? 'bg-rose-500' : p === 'Média' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
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
        )}
      </div>
      
      {/* Floating Action Button */}
      <button type="button" onClick={() => { setEditingItemId(null); setNewItemName('');  setNewItemCat('none'); setNewItemPriority('Média'); setIsModalOpen(true); }}
        className="fixed right-6 bottom-24 md:bottom-10 w-14 h-14 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-slate-800 dark:hover:bg-emerald-500 transition-all z-30 active:scale-95 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:focus:ring-emerald-950"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{editingItemId ? 'Salvar Alterações' : 'Adicionar à Lista'}</h3>
              <button type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Selecione o Ícone</label>
                <div className="flex gap-2.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {AVAILABLE_ITEM_ICONS.map((ic) => {
                    const IconComp = ic.icon;
                    const isSelected = newItemIcon === ic.id;
                    return (
                      <button type="button"
                        key={ic.id}
                        onClick={() => setNewItemIcon(ic.id)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${
                          isSelected 
                            ? 'border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-sm' 
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nome do Item</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => {
                    setNewItemName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 ${
                    nameError 
                      ? 'border-rose-400 focus:ring-rose-400' 
                      : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                  placeholder="Ex: Maçãs, Pão Integral"
                  autoFocus
                />
                {nameError && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1">
                    Por favor, digite o nome do item.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Preço Estimado</label>
                  <input 
                    type="text" 
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                    placeholder="Ex: 8,50"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
                    <button 
                      type="button" 
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Gerenciar
                    </button>
                  </div>
                  <select 
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  >
                    {shoppingCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prioridade</label>
                <select 
                  value={newItemPriority}
                  onChange={(e) => setNewItemPriority(e.target.value as PriorityType)}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                >
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-3">
              <button type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button type="button" 
                onClick={handleAdd}
                className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {editingItemId ? 'Salvar Alterações' : 'Adicionar à Lista'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Exclusão em Lote */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Excluir {selectedItemIds.length} {selectedItemIds.length > 1 ? 'itens' : 'item'}?
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Esta ação removerá permanentemente os {selectedItemIds.length} itens selecionados da sua lista de compras.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-3">
              <button type="button" 
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button type="button" 
                onClick={handleBulkDelete}
                className="px-6 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Gerenciar Categorias</h3>
              <button type="button" 
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nova categoria..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                />
                <button type="button"
                  onClick={() => {
                    if (newCatName.trim()) {
                      addShoppingCategory(newCatName.trim());
                      setNewCatName('');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2 mt-4">
                {shoppingCategories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {catEditId === cat ? (
                      <div className="flex flex-1 gap-2 mr-2">
                        <input
                          type="text"
                          value={catEditName}
                          onChange={e => setCatEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                        />
                        <button type="button"
                          onClick={() => {
                            if (catEditName.trim() && catEditName !== cat) {
                              updateShoppingCategory(cat, catEditName.trim());
                            }
                            setCatEditId(null);
                          }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button type="button"
                          onClick={() => setCatEditId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                        <div className="flex items-center gap-1">
                          <button type="button"
                            onClick={() => {
                              setCatEditId(cat);
                              setCatEditName(cat);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button type="button"
                            onClick={() => deleteShoppingCategory(cat)}
                            disabled={cat === 'Sem categoria'}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button type="button" 
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 rounded-xl transition-all shadow-sm"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alteração de Prioridade em Lote */}
      {isBulkPriorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Mudar Prioridade ({selectedItemIds.length} {selectedItemIds.length > 1 ? 'itens' : 'item'})
              </h3>
              <button type="button" 
                onClick={() => setIsBulkPriorityModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Selecione o novo nível de prioridade para aplicar a todos os itens selecionados:
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(['Alta', 'Média', 'Baixa'] as const).map((p) => {
                  const isSelected = bulkPriorityTarget === p;
                  return (
                    <button type="button"
                      key={p}
                      onClick={() => setBulkPriorityTarget(p)}
                      className={`py-3 px-2 rounded-xl border-2 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected 
                          ? p === 'Alta' 
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                            : p === 'Média'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${
                        isSelected 
                          ? 'bg-white' 
                          : p === 'Alta' ? 'bg-rose-500' : p === 'Média' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end gap-3">
              <button type="button" 
                onClick={() => setIsBulkPriorityModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button type="button" 
                onClick={() => handleBulkChangePriority(bulkPriorityTarget)}
                className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Aplicar aos Selecionados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-4 py-2.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
