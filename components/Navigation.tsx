"use client"

import { LayoutDashboard, Layers, ShoppingCart, ListTodo, Package2, LogOut, Settings, User, X, ChevronDown, ChevronRight, Check, Sun, Moon, Wrench } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import type { TabType, PriorityFilterType } from '@/app/page';
import { useApp } from '@/lib/context/AppContext';

const PROFILE_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBQuxdECxV9_7wF_LweItdq3AY0VoB94mEyonlGifFgMjtIf78GuRjxjaCU6N8hWMG7CQsp6seDFvoazjSlow1rfRuGrFrXSpTHvW9Zhik_RM9WcSzLzodxq7owysvJN_24Ws-uapkLkB06XVrwLIsR8ml8gokUk6btOfL8dpRev3qS7Tw27K-g3N0qttG3hQDz0pLMW8o_xWxe5FWuyojPe-l_cfL0tfevOB4DW70LvDWI_bwJ46aicw";

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'setores', label: 'Setores', icon: Layers },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'prioridades', label: 'Prioridades', icon: ListTodo },
  { id: 'manutencao', label: 'Manutenção', icon: Wrench },
];

export const PRIORITY_OPTIONS: { id: PriorityFilterType; label: string; dotColor: string; badgeColor: string }[] = [
  { id: 'Todas', label: 'Todas as Prioridades', dotColor: 'bg-slate-400', badgeColor: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'Alta', label: 'Alta Prioridade', dotColor: 'bg-rose-500', badgeColor: 'text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300' },
  { id: 'Média', label: 'Média Prioridade', dotColor: 'bg-amber-500', badgeColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300' },
  { id: 'Baixa', label: 'Baixa Prioridade', dotColor: 'bg-blue-500', badgeColor: 'text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300' },
];

export function TopBar() {
  const { theme, toggleTheme } = useApp();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: string) => {
    setIsProfileOpen(false);
    setActiveAction(action);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-md md:px-8 transition-colors">
        <div className="flex items-center gap-2 md:hidden">
          <Package2 className="h-6 w-6 text-slate-900 dark:text-slate-100" />
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Barreto App</span>
        </div>
        <div className="hidden md:block">
          {/* Espaço do cabeçalho desktop */}
        </div>
        <div className="flex items-center gap-3">
          {/* Botão Prático de Troca de Tema (Claro / Escuro) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            title={theme === 'dark' ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 animate-in spin-in-180 duration-200" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 cursor-pointer hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 dark:hover:ring-offset-slate-900 transition-all"
            >
              <Image src={PROFILE_IMG} alt="Profile" width={32} height={32} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            </div>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Opção rápida de tema no menu de perfil */}
                <button 
                  onClick={() => {
                    toggleTheme();
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors border-b border-slate-100 dark:border-slate-800 mb-1"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Moon className="h-4 w-4 text-slate-400" />
                    )}
                    <span>Modo Escuro</span>
                  </div>
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </button>

                <button 
                  onClick={() => handleAction('Meu Perfil')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <User className="h-4 w-4 text-slate-400" /> Meu Perfil
                </button>
                <button 
                  onClick={() => handleAction('Configurações')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-400" /> Configurações
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2"></div>
                <button 
                  onClick={() => handleAction('Sair da conta')}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" /> Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Ação Genérica */}
      {activeAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{activeAction}</h3>
              <button 
                onClick={() => setActiveAction(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Esta ação ({activeAction}) está pronta para integração com sua conta pessoal de compras.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button 
                onClick={() => setActiveAction(null)}
                className="px-6 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar({ 
  activeTab, 
  onTabChange,
  selectedPriority = 'Todas',
  onSelectPriority,
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
  selectedPriority?: PriorityFilterType;
  onSelectPriority?: (p: PriorityFilterType) => void;
}) {
  const { priorityStats, shoppingStats, maintenanceStats, theme, toggleTheme } = useApp();
  const [userToggled, setUserToggled] = useState<boolean | null>(null);
  const isPrioritiesSubmenuOpen = userToggled !== null ? userToggled : activeTab === 'prioridades';

  const getPriorityCount = (id: PriorityFilterType) => {
    switch(id) {
      case 'Alta': return priorityStats.highCount;
      case 'Média': return priorityStats.medCount;
      case 'Baixa': return priorityStats.lowCount;
      case 'Todas':
      default: return priorityStats.totalItemsCount;
    }
  };

  return (
    <nav className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:flex h-screen sticky top-0 shrink-0 z-20 transition-colors">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Package2 className="h-8 w-8 text-slate-900 dark:text-slate-100" />
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Barreto App</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPrioritiesItem = item.id === 'prioridades';
          const isShoppingItem = item.id === 'compras';
          const isMaintenanceItem = item.id === 'manutencao';

          return (
            <li key={item.id} className="flex flex-col">
              <button
                onClick={() => {
                  if (isPrioritiesItem) {
                    if (activeTab === 'prioridades') {
                      setUserToggled(!isPrioritiesSubmenuOpen);
                    } else {
                      onTabChange('prioridades');
                      setUserToggled(true);
                    }
                  } else {
                    setUserToggled(null);
                    onTabChange(item.id);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                
                {isShoppingItem && shoppingStats.pendingCount > 0 && (
                  <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {shoppingStats.pendingCount}
                  </span>
                )}

                {isMaintenanceItem && maintenanceStats.pendingCount > 0 && (
                  <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {maintenanceStats.pendingCount}
                  </span>
                )}

                {isPrioritiesItem && (
                  <div className="flex items-center gap-1.5">
                    {isActive && selectedPriority !== 'Todas' && (
                      <span className={`w-2 h-2 rounded-full ${
                        selectedPriority === 'Alta' ? 'bg-rose-500' : selectedPriority === 'Média' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                    )}
                    {isPrioritiesSubmenuOpen ? (
                      <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                )}
              </button>

              {/* Submenu de opções de prioridade */}
              {isPrioritiesItem && isPrioritiesSubmenuOpen && (
                <div className="mt-1 ml-4 pl-3 border-l-2 border-slate-100 dark:border-slate-800 flex flex-col gap-1 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  <span className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Filtrar por Prioridade
                  </span>
                  {PRIORITY_OPTIONS.map((opt) => {
                    const isSelected = activeTab === 'prioridades' && selectedPriority === opt.id;
                    const count = getPriorityCount(opt.id);

                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          if (onSelectPriority) onSelectPriority(opt.id);
                          onTabChange('prioridades');
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-slate-800 text-white font-semibold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                          <span>{opt.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                            isSelected 
                              ? 'bg-slate-800 dark:bg-slate-700 text-slate-200' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {count}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-3">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-100 dark:border-slate-800/60">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Uso Pessoal</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Gerenciamento de aquisições</p>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav({ 
  activeTab, 
  onTabChange,
  selectedPriority = 'Todas',
  onSelectPriority,
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
  selectedPriority?: PriorityFilterType;
  onSelectPriority?: (p: PriorityFilterType) => void;
}) {
  const { priorityStats, shoppingStats, maintenanceStats } = useApp();
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  const getPriorityCount = (id: PriorityFilterType) => {
    switch(id) {
      case 'Alta': return priorityStats.highCount;
      case 'Média': return priorityStats.medCount;
      case 'Baixa': return priorityStats.lowCount;
      case 'Todas':
      default: return priorityStats.totalItemsCount;
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md md:hidden px-1 transition-colors">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPrioritiesItem = item.id === 'prioridades';
          const isShoppingItem = item.id === 'compras';
          const isMaintenanceItem = item.id === 'manutencao';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isPrioritiesItem) {
                  // Abre opção para escolher a prioridade
                  setIsPriorityModalOpen(true);
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-1 flex-1 max-w-[68px] transition-colors relative ${
                isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''}`}>
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
              </div>
              <span className="text-[9px] font-semibold truncate max-w-full">{item.label}</span>
              
              {isShoppingItem && shoppingStats.pendingCount > 0 && (
                <span className="absolute top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">
                  {shoppingStats.pendingCount}
                </span>
              )}

              {isMaintenanceItem && maintenanceStats.pendingCount > 0 && (
                <span className="absolute top-0.5 right-2 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center">
                  {maintenanceStats.pendingCount}
                </span>
              )}

              {isPrioritiesItem && selectedPriority !== 'Todas' && isActive && (
                <span className={`absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full ${
                  selectedPriority === 'Alta' ? 'bg-rose-500' : selectedPriority === 'Média' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Modal / Bottom Sheet Mobile para Escolher a Prioridade */}
      {isPriorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs p-0 md:hidden animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl w-full p-6 pb-8 border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Escolher Prioridade</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Selecione para visualizar os produtos</p>
              </div>
              <button 
                onClick={() => setIsPriorityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const isSelected = activeTab === 'prioridades' && selectedPriority === opt.id;
                const count = getPriorityCount(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (onSelectPriority) onSelectPriority(opt.id);
                      onTabChange('prioridades');
                      setIsPriorityModalOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-slate-900 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${opt.dotColor}`} />
                      <span className="font-semibold text-sm">{opt.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-slate-800 dark:bg-slate-700 text-slate-200' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {count} {count === 1 ? 'item' : 'itens'}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

