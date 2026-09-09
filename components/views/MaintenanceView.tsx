"use client"
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  User, 
  DollarSign, 
  ShoppingCart, 
  Layers, 
  Trash2, 
  Edit3, 
  X, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  Package, 
  Eye, 
  EyeOff,
  Sparkles,
  Home,
  MoreVertical,
  CalendarDays,
  RotateCcw,
  CalendarCheck,
  ShieldAlert
} from 'lucide-react';
import { 
  useApp, 
  type MaintenanceItem, 
  type MaintenancePriority, 
  type MaintenanceType, 
  type MaintenanceStatus, 
  type MaintenancePeriodicity,
  type MaintenanceSubgroup,
  type MaintenanceSubitem,
  type MaintenanceChecklistStep
} from '@/lib/context/AppContext';
import MaintenanceCalendarView from './MaintenanceCalendarView';

interface MaintenanceViewProps {
  initialMacroTab?: 'lista' | 'calendario' | 'setores' | 'compras' | 'gastos';
  onMacroTabChange?: (tab: 'lista' | 'calendario' | 'setores' | 'compras' | 'gastos') => void;
}

export default function MaintenanceView({
  initialMacroTab = 'lista',
  onMacroTabChange
}: MaintenanceViewProps = {}) {
  const { 
    maintenances, 
    addMaintenance, 
    updateMaintenance, 
    deleteMaintenance, 
    toggleMaintenanceStatus, 
    toggleMaintenanceSubitemPurchased, 
    toggleMaintenanceChecklistStep, 
    sendSubitemToShoppingList,
    rescheduleMaintenance,
    maintenanceStats,
    sectors,
    addSector
  } = useApp();

  // Today string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  // Filtros e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | MaintenanceStatus>('Todos');
  const [selectedPriority, setSelectedPriority] = useState<'Todas' | MaintenancePriority>('Todas');
  const [selectedType, setSelectedType] = useState<'Todos' | MaintenanceType>('Todos');

  // Modo de visualização macro com sincronização segura de props
  const [internalMacroTab, setInternalMacroTab] = useState<'lista' | 'calendario' | 'setores' | 'compras' | 'gastos'>(initialMacroTab || 'lista');
  const [prevInitialTab, setPrevInitialTab] = useState(initialMacroTab);

  if (initialMacroTab !== prevInitialTab) {
    setPrevInitialTab(initialMacroTab);
    setInternalMacroTab(initialMacroTab);
  }

  const macroTab = internalMacroTab;

  const setMacroTab = (tab: 'lista' | 'calendario' | 'setores' | 'compras' | 'gastos') => {
    setInternalMacroTab(tab);
    onMacroTabChange?.(tab);
  };
  
  // Toggle para ocultar ou exibir gastos na interface global
  const [showGlobalExpenses, setShowGlobalExpenses] = useState(true);

  // Itens expandidos para visualização micro (inicia com detalhes ocultos por padrão)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Menu de 3 pontos nos cards de manutenção
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);
  const cardMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardMenuRef.current && !cardMenuRef.current.contains(event.target as Node)) {
        setOpenCardMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal de agendamento rápido
  const [scheduleModalItem, setScheduleModalItem] = useState<MaintenanceItem | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState('');

  const handleOpenScheduleModal = (item: MaintenanceItem) => {
    setScheduleModalItem(item);
    setNewScheduleDate(item.dueDate || todayStr);
  };

  // Modal de criação / edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Geral');
  const [isCreatingNewSector, setIsCreatingNewSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [type, setType] = useState<MaintenanceType>('Preventiva');
  const [priority, setPriority] = useState<MaintenancePriority>('Média');
  const [status, setStatus] = useState<MaintenanceStatus>('Pendente');
  const [dueDate, setDueDate] = useState('');
  const [periodicity, setPeriodicity] = useState<MaintenancePeriodicity>('Única');
  const [responsible, setResponsible] = useState('Faça Você Mesmo (DIY)');
  const [description, setDescription] = useState('');
  
  // Opções configuráveis solicitadas:
  const [hasBudget, setHasBudget] = useState(true);
  const [laborCost, setLaborCost] = useState('');
  const [otherCosts, setOtherCosts] = useState('');
  
  const [hasItemsToBuy, setHasItemsToBuy] = useState(false);
  const [subgroups, setSubgroups] = useState<MaintenanceSubgroup[]>([]);

  // Checklist
  const [hasChecklist, setHasChecklist] = useState(true);
  const [checklistSteps, setChecklistSteps] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newStepText, setNewStepText] = useState('');

  // Subgrupo e item temporário no modal
  const [newSubgroupTitle, setNewSubgroupTitle] = useState('');
  const [activeSubgroupForNewItem, setActiveSubgroupForNewItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newItemPrice, setNewItemPrice] = useState('');

  // Notificação toast temporária para feedback de envio à lista de compras
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtragem de manutenções
  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(m => {
      const matchSearch = 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.responsible.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchSector = selectedSector === 'Todos' || m.sector === selectedSector;
      const matchStatus = selectedStatus === 'Todos' || m.status === selectedStatus;
      const matchPriority = selectedPriority === 'Todas' || m.priority === selectedPriority;
      const matchType = selectedType === 'Todos' || m.type === selectedType;

      return matchSearch && matchSector && matchStatus && matchPriority && matchType;
    });
  }, [maintenances, searchQuery, selectedSector, selectedStatus, selectedPriority, selectedType]);

  // Agrupamento por setor para visão macro
  const dynamicSectors = useMemo(() => {
    const globalSectors = sectors.map(s => s.name);
    
    // Also include any custom sectors that might be in maintenances but not in the global list (just in case)
    const customSectors = new Set<string>();
    maintenances.forEach(m => {
      if (!globalSectors.includes(m.sector)) {
        customSectors.add(m.sector);
      }
    });
    
    return ['Todos', ...globalSectors, ...Array.from(customSectors)];
  }, [sectors, maintenances]);

  const sectorGroups = useMemo(() => {
    const map: Record<string, MaintenanceItem[]> = {};
    maintenances.forEach(m => {
      if (!map[m.sector]) map[m.sector] = [];
      map[m.sector].push(m);
    });
    return map;
  }, [maintenances]);

  // Todos os subgrupos de compras agregados para a aba de compras
  const allPurchaseItems = useMemo(() => {
    const list: {
      maintenanceId: string;
      maintenanceTitle: string;
      subgroupId: string;
      subgroupTitle: string;
      item: MaintenanceSubitem;
    }[] = [];

    maintenances.forEach(m => {
      if (m.hasItemsToBuy && m.itemSubgroups) {
        m.itemSubgroups.forEach(sg => {
          sg.items.forEach(item => {
            list.push({
              maintenanceId: m.id,
              maintenanceTitle: m.title,
              subgroupId: sg.id,
              subgroupTitle: sg.title,
              item
            });
          });
        });
      }
    });

    return list;
  }, [maintenances]);

  // Abertura de modal para nova manutenção
  const handleOpenNewModal = () => {
    setEditingId(null);
    setTitle('');
    setSector('Climatização');
    setIsCreatingNewSector(false);
    setNewSectorName('');
    setType('Preventiva');
    setPriority('Média');
    setStatus('Pendente');
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setPeriodicity('Semestral');
    setResponsible('Faça Você Mesmo (DIY)');
    setDescription('');
    setHasBudget(false);
    setLaborCost('');
    setOtherCosts('');
    setHasItemsToBuy(false);
    setSubgroups([]);
    setHasChecklist(true);
    setChecklistSteps([
      { id: 'st-1', text: 'Inspecionar o local e desligar fontes elétricas/hidráulicas se necessário', completed: false },
      { id: 'st-2', text: 'Realizar o procedimento preventivo ou substituição', completed: false },
      { id: 'st-3', text: 'Testar funcionamento e recolocar proteções', completed: false }
    ]);
    setIsModalOpen(true);
  };

  // Abertura de modal para nova manutenção com data e/ou setor pré-selecionados
  const handleOpenNewModalWithDate = (date?: string, initialSector?: string) => {
    handleOpenNewModal();
    if (date) {
      setDueDate(date);
    }
    if (initialSector) {
      setSector(initialSector);
    }
  };

  // Abertura de modal para edição
  const handleOpenEditModal = (item: MaintenanceItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSector(item.sector);
    setIsCreatingNewSector(false);
    setNewSectorName('');
    setType(item.type);
    setPriority(item.priority);
    setStatus(item.status);
    setDueDate(item.dueDate);
    setPeriodicity(item.periodicity);
    setResponsible(item.responsible);
    setDescription(item.description);
    setHasBudget(item.hasBudget);
    setLaborCost(item.laborCost ? item.laborCost.toString() : '');
    setOtherCosts(item.otherCosts ? item.otherCosts.toString() : '');
    setHasItemsToBuy(item.hasItemsToBuy);
    setSubgroups(JSON.parse(JSON.stringify(item.itemSubgroups || [])));
    setHasChecklist((item.checklist && item.checklist.length > 0) || false);
    setChecklistSteps(JSON.parse(JSON.stringify(item.checklist || [])));
    setIsModalOpen(true);
  };

  // Subgrupos no Modal
  const handleAddSubgroup = () => {
    if (!newSubgroupTitle.trim()) {
      triggerToast('Digite um título para o subgrupo');
      return;
    }
    const newSg: MaintenanceSubgroup = {
      id: `sg-${Date.now()}`,
      title: newSubgroupTitle.trim(),
      items: []
    };
    setSubgroups(prev => [...prev, newSg]);
    setNewSubgroupTitle('');
    setActiveSubgroupForNewItem(newSg.id);
  };

  const handleRemoveSubgroup = (sgId: string) => {
    setSubgroups(prev => prev.filter(sg => sg.id !== sgId));
    if (activeSubgroupForNewItem === sgId) {
      setActiveSubgroupForNewItem(null);
    }
  };

  const handleAddItemToSubgroup = (sgId: string) => {
    if (!newItemName.trim()) {
      triggerToast('Digite o nome do item para adicionar ao subgrupo');
      return;
    }
    const qty = parseInt(newItemQty) || 1;
    const parsedPrice = parseFloat(newItemPrice.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    const newItem: MaintenanceSubitem = {
      id: `sub-${Date.now()}`,
      name: newItemName.trim(),
      qty,
      unitPrice: parsedPrice,
      purchased: false,
    };

    setSubgroups(prev => prev.map(sg => {
      if (sg.id !== sgId) return sg;
      return {
        ...sg,
        items: [...sg.items, newItem]
      };
    }));

    setNewItemName('');
    setNewItemQty('1');
    setNewItemPrice('');
  };

  const handleRemoveItemFromSubgroup = (sgId: string, itemId: string) => {
    setSubgroups(prev => prev.map(sg => {
      if (sg.id !== sgId) return sg;
      return {
        ...sg,
        items: sg.items.filter(i => i.id !== itemId)
      };
    }));
  };

  // Checklist no Modal
  const handleAddChecklistStep = () => {
    if (!newStepText.trim()) {
      triggerToast('Digite o texto do passo para adicionar ao checklist');
      return;
    }
    setChecklistSteps(prev => [
      ...prev,
      { id: `chk-${Date.now()}`, text: newStepText.trim(), completed: false }
    ]);
    setNewStepText('');
  };

  const handleRemoveChecklistStep = (stepId: string) => {
    setChecklistSteps(prev => prev.filter(s => s.id !== stepId));
  };

  // Salvar manutenção (Adicionar ou Editar)
  const handleSave = () => {
    if (!title.trim()) {
      triggerToast('Por favor, digite o título da manutenção');
      return;
    }

    const parsedLabor = parseFloat(laborCost.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const parsedOther = parseFloat(otherCosts.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

    let finalSector = sector;
    if (isCreatingNewSector && newSectorName.trim()) {
      finalSector = newSectorName.trim();
      // Check if it already exists in global sectors
      if (!sectors.some(s => s.name.toLowerCase() === finalSector.toLowerCase())) {
        addSector({
          name: finalSector,
          desc: 'Setor criado via Manutenção',
          iconId: 'Wrench', // Default icon for maintenance created sectors
          colorId: 'slate'  // Default color
        });
      }
    }

    const payload: Omit<MaintenanceItem, 'id'> = {
      title: title.trim(),
      sector: finalSector,
      type,
      priority,
      status,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      periodicity,
      responsible: responsible.trim() || 'Faça Você Mesmo (DIY)',
      description: description.trim(),
      hasBudget,
      laborCost: hasBudget ? parsedLabor : 0,
      otherCosts: hasBudget ? parsedOther : 0,
      hasItemsToBuy,
      itemSubgroups: hasItemsToBuy ? subgroups : [],
      checklist: hasChecklist ? checklistSteps : []
    };

    if (editingId) {
      updateMaintenance(editingId, payload);
      triggerToast('Manutenção atualizada com sucesso!');
    } else {
      addMaintenance(payload);
      triggerToast('Nova manutenção agendada com sucesso!');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{feedbackToast}</span>
        </div>
      )}

      {/* Topo da Aba de Manutenção */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Manutenções da Casa
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Organização preventiva e corretiva com visão macro e detalhamento micro.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Alternância de Gastos (Flexível / A depender do momento) */}
          <button
            type="button"
            onClick={() => setShowGlobalExpenses(!showGlobalExpenses)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showGlobalExpenses
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="Alternar visibilidade de orçamentos e gastos"
          >
            {showGlobalExpenses ? (
              <>
                <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gastos Visíveis</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span>Gastos Ocultos</span>
              </>
            )}
          </button>

          {/* Botão Nova Manutenção */}
          <button
            type="button"
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Manutenção</span>
          </button>
        </div>
      </div>

      {/* VISÃO MACRO: Cards de Indicadores Gerais da Casa */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1: Saúde & Status */}
        <div 
          onClick={() => { setMacroTab('lista'); setSelectedType('Preventiva'); setSelectedStatus('Todos'); setSelectedPriority('Todas'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors">
            <span>Saúde Preventiva</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {maintenanceStats.healthRate}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {maintenanceStats.completedCount}/{maintenanceStats.totalCount} concluídas
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${maintenanceStats.healthRate}%` }}
            />
          </div>
        </div>

        {/* Card 2: Urgências e Pendências */}
        <div 
          onClick={() => { setMacroTab('lista'); setSelectedPriority('Crítica'); setSelectedStatus('Pendente'); setSelectedType('Todos'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-rose-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-rose-500 transition-colors">
            <span>Pendências Críticas</span>
            <AlertTriangle className={`w-4 h-4 ${maintenanceStats.criticalCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {maintenanceStats.criticalCount + maintenanceStats.highCount}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              {maintenanceStats.criticalCount} críticas • {maintenanceStats.highCount} altas
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            {maintenanceStats.pendingCount} manutenções aguardando execução
          </p>
        </div>

        {/* Card 3: Itens a Comprar / Peças dos Subgrupos */}
        <div 
          onClick={() => { setMacroTab('compras'); }}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group active:scale-95"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 group-hover:text-amber-500 transition-colors">
            <span>Peças & Subgrupos</span>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {maintenanceStats.itemsToBuyTotal}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              {maintenanceStats.itemsToBuyPending} pendentes
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            {maintenanceStats.itemsToBuyPurchased} peças já adquiridas para serviços
          </p>
        </div>

        {/* Card 4: Gastos e Orçamentos (Quando ativado) */}
        <div 
          onClick={() => { if (showGlobalExpenses) setMacroTab('gastos'); }}
          className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all ${showGlobalExpenses ? 'hover:shadow-md hover:border-blue-500 cursor-pointer active:scale-95 group' : ''}`}
        >
          <div className={`flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 ${showGlobalExpenses ? 'group-hover:text-blue-500 transition-colors' : ''}`}>
            <span>Orçamento Estimado</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          {showGlobalExpenses ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  R$ {maintenanceStats.totalBudget.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <span>Mão de Obra: R$ {maintenanceStats.laborCost.toFixed(0)}</span>
                <span>Peças: R$ {maintenanceStats.materialsCost.toFixed(0)}</span>
              </div>
            </>
          ) : (
            <div className="py-1">
              <span className="text-sm font-medium text-slate-400 italic">Gastos Ocultos</span>
              <p className="text-[11px] text-slate-400 mt-1">Clique em &quot;Gastos Visíveis&quot; para inspecionar</p>
            </div>
          )}
        </div>
      </div>

      {/* Navegação de Visões Macro: Lista Geral, Calendário de Agendamento, Por Setor/Cômodo, Subgrupos de Compras, e Painel de Gastos */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMacroTab('lista')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              macroTab === 'lista'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Todas as Manutenções ({filteredMaintenances.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMacroTab('calendario')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              macroTab === 'calendario'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário & Agendamento</span>
            {maintenanceStats.overdueCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {maintenanceStats.overdueCount} atrasada(s)
              </span>
            ) : maintenanceStats.upcomingCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {maintenanceStats.upcomingCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setMacroTab('setores')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              macroTab === 'setores'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Por Setores</span>
          </button>

          <button
            type="button"
            onClick={() => setMacroTab('compras')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              macroTab === 'compras'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Subgrupos de Compras ({allPurchaseItems.length})</span>
          </button>

          {showGlobalExpenses && (
            <button
              type="button"
              onClick={() => setMacroTab('gastos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                macroTab === 'gastos'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Aba de Gastos & Orçamento</span>
            </button>
          )}
        </div>

        {/* Busca Rápida */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por serviço, técnico..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* FILTROS RÁPIDOS (Visão Lista e Setores) */}
      {(macroTab === 'lista' || macroTab === 'setores') && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          {/* Filtro de Setores */}
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            {dynamicSectors.map(s => (
              <option key={s} value={s}>{s === 'Todos' ? 'Todos os Setores' : s}</option>
            ))}
          </select>

          {/* Filtro de Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Pendente">Apenas Pendentes</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluídas</option>
          </select>

          {/* Filtro de Prioridade */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Todas">Todas as Prioridades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>

          {/* Filtro de Tipo */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Preventiva">Preventiva</option>
            <option value="Corretiva">Corretiva</option>
            <option value="Melhoria">Melhoria</option>
          </select>

          {(selectedSector !== 'Todos' || selectedStatus !== 'Todos' || selectedPriority !== 'Todas' || selectedType !== 'Todos' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSector('Todos');
                setSelectedStatus('Todos');
                setSelectedPriority('Todas');
                setSelectedType('Todos');
                setSearchQuery('');
              }}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-2"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: LISTA GERAL COM DETALHAMENTO MICRO DAS MANUTENÇÕES */}
      {/* ========================================================================= */}
      {macroTab === 'lista' && (
        <div className="space-y-4">
          {filteredMaintenances.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Wrench className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhuma manutenção encontrada</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Altere os filtros acima ou crie uma nova manutenção para organizar as necessidades da casa.
              </p>
              <button
                onClick={handleOpenNewModal}
                className="mt-4 inline-flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                Criar Manutenção
              </button>
            </div>
          ) : (
            filteredMaintenances.map((item) => {
              const isExpanded = !!expandedItems[item.id];
              
              // Totais de compra desta manutenção
              const totalItemsInMaint = item.itemSubgroups?.reduce((acc, sg) => acc + sg.items.length, 0) || 0;
              const purchasedItemsInMaint = item.itemSubgroups?.reduce((acc, sg) => acc + sg.items.filter(i => i.purchased).length, 0) || 0;
              const materialCost = item.itemSubgroups?.reduce((acc, sg) => acc + sg.items.reduce((sAcc, i) => sAcc + (i.unitPrice * i.qty), 0), 0) || 0;
              const totalMaintCost = (item.laborCost || 0) + (item.otherCosts || 0) + materialCost;

              // Progresso checklist
              const totalSteps = item.checklist?.length || 0;
              const completedSteps = item.checklist?.filter(s => s.completed).length || 0;

              return (
                <div 
                  key={item.id} 
                  className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 shadow-xs ${openCardMenuId === item.id ? 'relative z-50' : ''} ${
                    item.status === 'Concluída' 
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20' 
                      : item.priority === 'Crítica'
                      ? 'border-rose-300 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Cabeçalho do Card Micro */}
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleMaintenanceStatus(item.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            item.status === 'Concluída'
                              ? 'bg-emerald-500 text-white shadow-2xs'
                              : item.status === 'Em Andamento'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700'
                          }`}
                          title={`Status atual: ${item.status}. Clique para alternar.`}
                        >
                          {item.status === 'Concluída' ? (
                            <Check className="w-4 h-4" />
                          ) : item.status === 'Em Andamento' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {/* Nível de Prioridade */}
                            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                              item.priority === 'Crítica'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                : item.priority === 'Alta'
                                ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800'
                                : item.priority === 'Média'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                            }`}>
                              {item.priority}
                            </span>

                            {/* Tipo: Preventiva / Corretiva / Melhoria */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.type}
                            </span>

                            {/* Setor */}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                              {item.sector}
                            </span>

                            {/* Indicador de Atraso ou Hoje */}
                            {item.status !== 'Concluída' && item.dueDate && item.dueDate < todayStr && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                                <ShieldAlert className="w-3 h-3" /> Atrasada
                              </span>
                            )}
                            {item.status !== 'Concluída' && item.dueDate === todayStr && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500 text-white flex items-center gap-1 shadow-xs">
                                <Clock className="w-3 h-3" /> Para Hoje
                              </span>
                            )}

                            {/* Periodicidade */}
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                              • {item.periodicity}
                            </span>
                          </div>

                          <h3 className={`text-base font-bold text-slate-900 dark:text-slate-100 ${
                            item.status === 'Concluída' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}>
                            {item.title}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                            {item.description || 'Sem descrição detalhada.'}
                          </p>
                        </div>
                      </div>

                      {/* Informações Rápidas e Ações */}
                      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        {/* Indicador de Prazo / Responsável */}
                        <div className="text-right text-xs">
                          <div className={`flex items-center gap-1.5 font-semibold ${
                            item.status !== 'Concluída' && item.dueDate && item.dueDate < todayStr
                              ? 'text-rose-600 dark:text-rose-400 font-bold'
                              : item.status !== 'Concluída' && item.dueDate === todayStr
                              ? 'text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'Sem data'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] mt-0.5 justify-end">
                            <User className="w-3 h-3" />
                            <span>{item.responsible}</span>
                          </div>
                        </div>

                        {/* Indicador de Custo (Se tiver orçamento e gastos visíveis) */}
                        {showGlobalExpenses && (
                          <div className="text-right px-3 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 min-w-24">
                            {item.hasBudget ? (
                              <>
                                <span className="text-[10px] text-slate-400 block font-semibold">Orçamento Total</span>
                                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                                  R$ {totalMaintCost.toFixed(2).replace('.', ',')}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">
                                Sem Gastos (DIY)
                              </span>
                            )}
                          </div>
                        )}

                        {/* Botões de Ação com menu de 3 pontos sem transparência */}
                        <div className="flex items-center gap-1 relative">
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(item)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Agendar / Alterar Data no Calendário"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar Manutenção"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle expandir detalhamento micro */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title={isExpanded ? 'Recolher detalhes' : 'Expandir micro detalhamento'}
                          >
                            <span className="text-[11px]">{isExpanded ? 'Ocultar' : 'Detalhes'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {/* Botão de 3 Pontos com Dropdown sem transparência */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCardMenuId(openCardMenuId === item.id ? null : item.id);
                              }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Mais opções da manutenção"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {openCardMenuId === item.id && (
                              <div
                                ref={cardMenuRef}
                                className="absolute right-0 top-9 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 ring-1 ring-slate-950/10 dark:ring-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                                    {item.title}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenScheduleModal(item);
                                    setOpenCardMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                  Agendar no Calendário
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenEditModal(item);
                                    setOpenCardMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                                  Editar Manutenção
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleMaintenanceStatus(item.id);
                                    setOpenCardMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  {item.status === 'Concluída' ? 'Reabrir Manutenção' : 'Marcar como Concluída'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleExpand(item.id);
                                    setOpenCardMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                                >
                                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                                  {isExpanded ? 'Recolher Detalhes' : 'Ver Detalhes'}
                                </button>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteMaintenance(item.id);
                                    setOpenCardMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  Excluir Manutenção
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo visual rápido (Subgrupos de compras e Checklist) se recolhido */}
                    {!isExpanded && (
                      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                        {item.hasItemsToBuy && (
                          <div className="flex items-center gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              <strong>{item.itemSubgroups?.length || 0} subgrupos</strong> de compras ({purchasedItemsInMaint}/{totalItemsInMaint} comprados)
                            </span>
                          </div>
                        )}

                        {totalSteps > 0 && (
                          <div className="flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                            <span>
                              Passos: <strong>{completedSteps}/{totalSteps}</strong> executados
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ========================================================= */}
                  {/* DETALHAMENTO MICRO EXPANDIDO (Subgrupos, Compras, Checklist e Finanças) */}
                  {/* ========================================================= */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 rounded-b-2xl p-4 md:p-6 space-y-5 animate-in slide-in-from-top-1 duration-200">
                      {/* 1. Checklist de Execução */}
                      {item.checklist && item.checklist.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Passos para Execução</span>
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {completedSteps} de {totalSteps} concluídos
                            </span>
                          </div>

                          <div className="space-y-1.5 bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800">
                            {item.checklist.map((step) => (
                              <label
                                key={step.id}
                                className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={step.completed}
                                  onChange={() => toggleMaintenanceChecklistStep(item.id, step.id)}
                                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                                />
                                <span className={`text-xs ${
                                  step.completed 
                                    ? 'line-through text-slate-400 dark:text-slate-500' 
                                    : 'text-slate-800 dark:text-slate-200 font-medium'
                                }`}>
                                  {step.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. Subgrupos de Itens a serem Comprados (se ativado na configuração) */}
                      {item.hasItemsToBuy && item.itemSubgroups && item.itemSubgroups.length > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                              <span>Subgrupos de Itens a Comprar</span>
                            </h4>
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                              {purchasedItemsInMaint} de {totalItemsInMaint} peças adquiridas
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {item.itemSubgroups.map((subgroup) => (
                              <div 
                                key={subgroup.id} 
                                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs"
                              >
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    {subgroup.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {subgroup.items.length} {subgroup.items.length === 1 ? 'item' : 'itens'}
                                  </span>
                                </div>

                                {subgroup.items.length === 0 ? (
                                  <p className="text-[11px] text-slate-400 italic py-2">Nenhum item neste subgrupo.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {subgroup.items.map((subItem) => (
                                      <div 
                                        key={subItem.id}
                                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                                      >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                          <button
                                            type="button"
                                            onClick={() => toggleMaintenanceSubitemPurchased(item.id, subgroup.id, subItem.id)}
                                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                                              subItem.purchased 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                            }`}
                                            title={subItem.purchased ? 'Marcar como não comprado' : 'Marcar como comprado'}
                                          >
                                            {subItem.purchased && <Check className="w-3 h-3" />}
                                          </button>
                                          <div className="min-w-0 flex-1">
                                            <p className={`font-semibold truncate ${
                                              subItem.purchased ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                                            }`}>
                                              {subItem.name}
                                            </p>
                                            <span className="text-[10px] text-slate-400">
                                              {subItem.qty}x • R$ {subItem.unitPrice.toFixed(2).replace('.', ',')} un
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="font-bold text-slate-900 dark:text-slate-100">
                                            R$ {(subItem.unitPrice * subItem.qty).toFixed(2).replace('.', ',')}
                                          </span>

                                          {/* Ação inteligente: Enviar para lista de compras */}
                                          <button
                                            type="button"
                                            onClick={() => {
                                              sendSubitemToShoppingList(item.id, subgroup.id, subItem.id);
                                              if (subItem.sentToShoppingList) {
                                                triggerToast(`"${subItem.name}" já está na Lista de Compras (adicionado novamente)!`);
                                              } else {
                                                triggerToast(`"${subItem.name}" enviado para a Lista de Compras!`);
                                              }
                                            }}
                                            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                              subItem.sentToShoppingList
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/80'
                                                : 'bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 border border-slate-200 dark:border-slate-600'
                                            }`}
                                            title={subItem.sentToShoppingList ? 'Já adicionado à lista de compras da casa (clique para re-adicionar)' : 'Enviar para lista de compras geral'}
                                          >
                                            <ShoppingCart className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        item.hasItemsToBuy && (
                          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                            Nenhum subgrupo de compra configurado para esta manutenção.
                          </div>
                        )
                      )}

                      {/* 3. Detalhamento de Gastos / Orçamento (se configurado) */}
                      {showGlobalExpenses && item.hasBudget && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                            <span>Composição Orçamentária</span>
                          </h4>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                              <span className="text-[10px] text-slate-400 block font-medium">Mão de Obra</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                R$ {(item.laborCost || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                              <span className="text-[10px] text-slate-400 block font-medium">Materiais & Peças</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                R$ {materialCost.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                              <span className="text-[10px] text-slate-400 block font-medium">Outros Custos</span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                R$ {(item.otherCosts || 0).toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60">
                              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">Investimento Total</span>
                              <span className="font-black text-emerald-800 dark:text-emerald-300 text-sm">
                                R$ {totalMaintCost.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA CALENDÁRIO: AGENDAMENTO, CALENDÁRIO MENSAL, ATRASADAS E PRÓXIMAS */}
      {/* ========================================================================= */}
      {macroTab === 'calendario' && (
        <MaintenanceCalendarView 
          onOpenEditModal={handleOpenEditModal}
          onOpenNewModalWithDate={handleOpenNewModalWithDate}
          onOpenScheduleModal={handleOpenScheduleModal}
          showExpenses={showGlobalExpenses}
        />
      )}

      {/* ========================================================================= */}
      {/* ABA 2: VISÃO MACRO POR SETORES DA CASA */}
      {/* ========================================================================= */}
      {macroTab === 'setores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(sectorGroups).map(([sectorName, items]) => {
            const pending = items.filter(i => i.status !== 'Concluída').length;
            const completed = items.filter(i => i.status === 'Concluída').length;
            const totalCost = items.reduce((acc, m) => {
              if (!m.hasBudget) return acc;
              const mat = m.itemSubgroups?.reduce((sAcc, sg) => sAcc + sg.items.reduce((iAcc, item) => iAcc + (item.unitPrice * item.qty), 0), 0) || 0;
              return acc + (m.laborCost || 0) + (m.otherCosts || 0) + mat;
            }, 0);

            return (
              <div 
                key={sectorName}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors"
              >
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      {sectorName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{sectorName}</h3>
                      <p className="text-[11px] text-slate-400">{items.length} manutenções</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    pending > 0 
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300' 
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {pending > 0 ? `${pending} Pendentes` : 'Em Dia'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {items.map((m) => {
                    const isOverdue = m.status !== 'Concluída' && m.dueDate && m.dueDate < todayStr;
                    return (
                      <div 
                        key={m.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleMaintenanceStatus(m.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                              m.status === 'Concluída'
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                            }`}
                            title={m.status === 'Concluída' ? 'Reabrir manutenção' : 'Concluir manutenção'}
                          >
                            {m.status === 'Concluída' && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div 
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => handleOpenEditModal(m)}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className={`font-semibold block truncate hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors ${
                                m.status === 'Concluída' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                              }`}>
                                {m.title}
                              </span>
                              {isOverdue && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shrink-0">
                                  Atrasada
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {m.dueDate ? m.dueDate.split('-').reverse().join('/') : 'Sem data'} • {m.periodicity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(m)}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                            title="Agendar no calendário"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(m)}
                            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            m.priority === 'Crítica' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {m.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenNewModalWithDate(undefined, sectorName)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-3"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Adicionar Manutenção em {sectorName}</span>
                </button>

                {showGlobalExpenses && totalCost > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Previsto no Setor:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      R$ {totalCost.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: SUBGRUPOS DE COMPRAS AGREGADOS (Com envio rápido para o carrinho) */}
      {/* ========================================================================= */}
      {macroTab === 'compras' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                <span>Itens e Peças de Todas as Manutenções</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Subgrupos criados nas manutenções para controle de compra de materiais da casa.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl">
                {maintenanceStats.itemsToBuyPending} peças a adquirir
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl">
                {maintenanceStats.itemsToBuyPurchased} já adquiridas
              </span>
            </div>
          </div>

          {allPurchaseItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma manutenção possui subgrupos de compras ativos no momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {allPurchaseItems.map(({ maintenanceId, maintenanceTitle, subgroupId, subgroupTitle, item }) => (
                <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleMaintenanceSubitemPurchased(maintenanceId, subgroupId, item.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        item.purchased ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                      title={item.purchased ? 'Marcar pendente' : 'Marcar comprado'}
                    >
                      {item.purchased && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div>
                      <h4 className={`text-sm font-bold ${
                        item.purchased ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {maintenanceTitle}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 dark:text-slate-400">{subgroupTitle}</span>
                        <span>•</span>
                        <span>Qtd: {item.qty} un</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        R$ {(item.unitPrice * item.qty).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (R$ {item.unitPrice.toFixed(2).replace('.', ',')} un)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sendSubitemToShoppingList(maintenanceId, subgroupId, item.id);
                        if (item.sentToShoppingList) {
                          triggerToast(`"${item.name}" já está na lista de compras (adicionado novamente)!`);
                        } else {
                          triggerToast(`"${item.name}" adicionado à Lista de Compras da Casa!`);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        item.sentToShoppingList
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/80'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs'
                      }`}
                      title={item.sentToShoppingList ? 'Já adicionado à lista (clique para enviar novamente)' : 'Enviar para lista de compras'}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{item.sentToShoppingList ? 'Na Lista (Reenviar)' : 'Enviar p/ Compras'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: GASTOS & ORÇAMENTO DEDICADO (Painel Financeiro das Manutenções) */}
      {/* ========================================================================= */}
      {showGlobalExpenses && macroTab === 'gastos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Mão de Obra Total</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                R$ {maintenanceStats.laborCost.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Prestadores e técnicos especializados contratados
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Peças & Materiais</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                R$ {maintenanceStats.materialsCost.toFixed(2).replace('.', ',')}
              </span>
              <p className="text-[11px] text-slate-400 mt-2">
                Calculado a partir de todos os subgrupos de materiais
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Investimento Total Previsto</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                R$ {maintenanceStats.totalBudget.toFixed(2).replace('.', ',')}
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                <span>Concluído: R$ {maintenanceStats.completedBudget.toFixed(0)}</span>
                <span>•</span>
                <span>Pendente: R$ {maintenanceStats.pendingBudget.toFixed(0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
              Distribuição Orçamentária por Manutenção
            </h3>

            <div className="space-y-3">
              {maintenances.filter(m => m.hasBudget).map(m => {
                const matCost = m.itemSubgroups?.reduce((sAcc, sg) => sAcc + sg.items.reduce((iAcc, item) => iAcc + (item.unitPrice * item.qty), 0), 0) || 0;
                const total = (m.laborCost || 0) + (m.otherCosts || 0) + matCost;
                const percent = maintenanceStats.totalBudget > 0 ? Math.round((total / maintenanceStats.totalBudget) * 100) : 0;

                return (
                  <div key={m.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {m.title} <span className="text-slate-400 font-normal">({m.sector})</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          R$ {total.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-[10px] text-slate-400">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full" 
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PARA ADICIONAR OU EDITAR MANUTENÇÃO (Com opções de Gastos e Subgrupos) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 my-8 animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingId ? 'Editar Manutenção' : 'Configurar Nova Manutenção'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure prazos, prestadores, gastos e subgrupos de materiais.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
              {/* Título */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Título da Manutenção *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Troca de Filtros do Purificador, Pintura da Fachada..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Setor, Tipo e Prioridade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Setor
                  </label>
                  {!isCreatingNewSector ? (
                    <select
                      value={sector}
                      onChange={(e) => {
                        if (e.target.value === 'NEW') {
                          setIsCreatingNewSector(true);
                          setSector('');
                        } else {
                          setSector(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      {dynamicSectors.filter(s => s !== 'Todos').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="NEW">+ Criar novo setor...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSectorName}
                        onChange={(e) => setNewSectorName(e.target.value)}
                        placeholder="Nome do setor"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingNewSector(false);
                          setSector('Climatização');
                        }}
                        className="text-slate-500 hover:text-rose-500 transition-colors"
                        title="Cancelar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tipo de Ação
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Preventiva">Preventiva</option>
                    <option value="Corretiva">Corretiva</option>
                    <option value="Melhoria">Melhoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Nível de Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Crítica">Crítica (Urgente)</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Status, Prazo e Periodicidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Status Atual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Data Prevista
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Periodicidade
                  </label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as MaintenancePeriodicity)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Única">Única vez</option>
                    <option value="Mensal">Mensal</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
              </div>

              {/* Responsável e Descrição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Responsável / Prestador
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: Faça Você Mesmo (DIY), Técnico João..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Descrição ou Observações
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Verificar vazamento no anel de vedação..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* ============================================================== */}
              {/* TOGGLE 1: CONTROLE DE GASTOS / ORÇAMENTO NESTA MANUTENÇÃO */}
              {/* ============================================================== */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Ativar Controle de Gastos nesta Manutenção?
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Ative se esta manutenção envolver custo de mão de obra ou contratação externa.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={hasBudget}
                    onChange={(e) => setHasBudget(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5 cursor-pointer"
                  />
                </div>

                {hasBudget && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Mão de Obra Estimada (R$)
                      </label>
                      <input
                        type="text"
                        value={laborCost}
                        onChange={(e) => setLaborCost(e.target.value)}
                        placeholder="Ex: 250,00"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                        Outros Custos / Taxas (R$)
                      </label>
                      <input
                        type="text"
                        value={otherCosts}
                        onChange={(e) => setOtherCosts(e.target.value)}
                        placeholder="Ex: 30,00"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* TOGGLE 2: SUBGRUPOS DE ITENS A SEREM COMPRADOS */}
              {/* ============================================================== */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Requer Subgrupos de Itens a serem Comprados?
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Crie grupos de materiais necessários (ex: &quot;Peças Principais&quot;, &quot;Materiais de Vedação&quot;).
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={hasItemsToBuy}
                    onChange={(e) => setHasItemsToBuy(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5 cursor-pointer"
                  />
                </div>

                {hasItemsToBuy && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/60 space-y-4">
                    {/* Criação de Novo Subgrupo */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubgroupTitle}
                        onChange={(e) => setNewSubgroupTitle(e.target.value)}
                        placeholder="Novo Subgrupo (ex: Tintas e Solventes, Conexões)"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubgroup}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 cursor-pointer transition-transform"
                      >
                        Criar Grupo
                      </button>
                    </div>

                    {/* Subgrupos Existentes */}
                    {subgroups.map((sg) => (
                      <div key={sg.id} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{sg.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubgroup(sg.id)}
                            className="text-xs text-rose-500 hover:text-rose-700 p-1"
                            title="Remover subgrupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Itens do Subgrupo */}
                        {sg.items.length > 0 && (
                          <div className="space-y-1.5">
                            {sg.items.map(item => (
                              <div key={item.id} className="flex items-center justify-between text-xs p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {item.name} ({item.qty}x)
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 dark:text-slate-100">
                                    R$ {(item.unitPrice * item.qty).toFixed(2).replace('.', ',')}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemFromSubgroup(sg.id, item.id)}
                                    className="text-slate-400 hover:text-rose-500"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Adicionar Item neste Subgrupo */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Adicionar peça a este subgrupo:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <input
                              type="text"
                              value={activeSubgroupForNewItem === sg.id ? newItemName : ''}
                              onChange={(e) => {
                                setActiveSubgroupForNewItem(sg.id);
                                setNewItemName(e.target.value);
                              }}
                              placeholder="Nome da peça"
                              className="sm:col-span-6 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="number"
                              min="1"
                              value={activeSubgroupForNewItem === sg.id ? newItemQty : '1'}
                              onChange={(e) => {
                                setActiveSubgroupForNewItem(sg.id);
                                setNewItemQty(e.target.value);
                              }}
                              placeholder="Qtd"
                              className="sm:col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="text"
                              value={activeSubgroupForNewItem === sg.id ? newItemPrice : ''}
                              onChange={(e) => {
                                setActiveSubgroupForNewItem(sg.id);
                                setNewItemPrice(e.target.value);
                              }}
                              placeholder="R$ un"
                              className="sm:col-span-2 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddItemToSubgroup(sg.id)}
                              className="sm:col-span-2 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
                            >
                              + Item
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ============================================================== */}
              {/* TOGGLE 3: CHECKLIST DE PASSOS DE EXECUÇÃO */}
              {/* ============================================================== */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Checklist de Execução
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Etapas práticas para guiar a realização do serviço.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={hasChecklist}
                    onChange={(e) => setHasChecklist(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-5 w-5 cursor-pointer"
                  />
                </div>

                {hasChecklist && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStepText}
                        onChange={(e) => setNewStepText(e.target.value)}
                        placeholder="Novo passo (ex: Desligar registro, Testar vazão)"
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddChecklistStep}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 cursor-pointer transition-transform"
                      >
                        + Passo
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {checklistSteps.map(step => (
                        <div key={step.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                          <span>{step.text}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistStep(step.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Manutenção'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AGENDAMENTO RÁPIDO NO CALENDÁRIO */}
      {scheduleModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Agendar Manutenção
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina ou altere a data de execução
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalItem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {scheduleModalItem.title}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                  <span>{scheduleModalItem.sector}</span>
                  <span>•</span>
                  <span>{scheduleModalItem.periodicity}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Atual: {scheduleModalItem.dueDate ? scheduleModalItem.dueDate.split('-').reverse().join('/') : 'Sem data'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nova Data de Vencimento
                </label>
                <input
                  type="date"
                  value={newScheduleDate}
                  onChange={(e) => setNewScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewScheduleDate(todayStr)}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                    setNewScheduleDate(nextWeek);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  +1 Semana
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
                    setNewScheduleDate(nextMonth);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-center"
                >
                  +30 Dias
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newScheduleDate) return;
                    rescheduleMaintenance(scheduleModalItem.id, newScheduleDate);
                    triggerToast(`Manutenção agendada para ${newScheduleDate.split('-').reverse().join('/')}`);
                    setScheduleModalItem(null);
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-sm"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
