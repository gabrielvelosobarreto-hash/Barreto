"use client";

import { useState } from 'react';
import { TopBar, Sidebar, BottomNav } from '@/components/Navigation';
import DashboardView from '@/components/views/DashboardView';
import SectorsView from '@/components/views/SectorsView';
import ShoppingListView from '@/components/views/ShoppingListView';
import PrioritiesView from '@/components/views/PrioritiesView';
import MaintenanceView from '@/components/views/MaintenanceView';
import LoginScreen from '@/components/LoginScreen';
import BasicProfileSetup from '@/components/BasicProfileSetup';
import { AppProvider, useApp } from '@/lib/context/AppContext';
import { Lock } from 'lucide-react';

export type TabType = 'painel' | 'setores' | 'compras' | 'prioridades' | 'manutencao';
export type PriorityFilterType = 'Todas' | 'Alta' | 'Média' | 'Baixa';
export type MaintenanceMacroTab = 'lista' | 'calendario' | 'setores' | 'compras' | 'gastos';

function MainAppContent() {
  const { isAuthenticated, isAuthLoaded, isProfileCompleted } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('painel');
  const [selectedPriority, setSelectedPriority] = useState<PriorityFilterType>('Todas');
  const [maintenanceMacroTab, setMaintenanceMacroTab] = useState<MaintenanceMacroTab>('lista');
  const [targetSectorId, setTargetSectorId] = useState<number | null>(null);
  const [targetItemId, setTargetItemId] = useState<number | null>(null);
  const [lockedTabToast, setLockedTabToast] = useState<string | null>(null);

  const triggerLockedToast = (tabLabel?: string) => {
    setLockedTabToast(`A aba "${tabLabel || 'solicitada'}" só será liberada após cadastrar o Perfil Básico.`);
    setTimeout(() => {
      setLockedTabToast(null);
    }, 4000);
  };

  const handleNavigate = (
    tab: TabType, 
    priority?: PriorityFilterType, 
    mTab?: MaintenanceMacroTab, 
    sectorId?: number | null, 
    itemId?: number | null
  ) => {
    if (!isProfileCompleted && tab !== 'painel') {
      triggerLockedToast(tab.charAt(0).toUpperCase() + tab.slice(1));
      return;
    }
    setActiveTab(tab);
    if (priority) {
      setSelectedPriority(priority);
    }
    if (mTab) {
      setMaintenanceMacroTab(mTab);
    }
    if (sectorId !== undefined) {
      setTargetSectorId(sectorId);
    }
    if (itemId !== undefined) {
      setTargetItemId(itemId);
    }
  };

  // 1. Estado de carregamento do armazenamento local
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Carregando Barreto App...
        </p>
      </div>
    );
  }

  // 2. Não autenticado: Exibe a tela de login / criação de senha privativa
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // 3. Autenticado: renderiza a aplicação
  // Se o perfil básico não estiver preenchido, apenas a tela de cadastro do perfil básico fica liberada
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-100 dark:selection:bg-emerald-950/60 dark:selection:text-emerald-300 transition-colors">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => handleNavigate(tab)} 
        selectedPriority={selectedPriority}
        onSelectPriority={(p) => {
          if (!isProfileCompleted) {
            triggerLockedToast('Prioridades');
            return;
          }
          setSelectedPriority(p);
          setActiveTab('prioridades');
        }}
        onLockedTabClick={triggerLockedToast}
      />
      
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 h-screen overflow-y-auto relative">
        <TopBar />

        {/* Toast Notificação de Aba Bloqueada */}
        {lockedTabToast && (
          <div className="fixed top-20 right-4 z-50 max-w-sm p-4 rounded-2xl bg-amber-600 text-white shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-3 duration-200">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold block text-sm mb-0.5">Aba Bloqueada</span>
              {lockedTabToast}
            </div>
          </div>
        )}
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {!isProfileCompleted ? (
            <BasicProfileSetup onCompleted={() => setActiveTab('painel')} />
          ) : (
            <>
              {activeTab === 'painel' && <DashboardView onNavigate={handleNavigate} />}
              {activeTab === 'setores' && (
                <SectorsView 
                  targetSectorId={targetSectorId} 
                  targetItemId={targetItemId} 
                  onTargetHandled={() => {
                    setTargetSectorId(null);
                    setTargetItemId(null);
                  }} 
                />
              )}
              {activeTab === 'compras' && <ShoppingListView />}
              {activeTab === 'prioridades' && (
                <PrioritiesView 
                  initialPriority={selectedPriority} 
                  onPriorityChange={setSelectedPriority}
                  onNavigate={handleNavigate}
                />
              )}
              {activeTab === 'manutencao' && (
                <MaintenanceView 
                  initialMacroTab={maintenanceMacroTab}
                  onMacroTabChange={setMaintenanceMacroTab}
                />
              )}
            </>
          )}
        </main>
      </div>
      
      <BottomNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleNavigate(tab)} 
        selectedPriority={selectedPriority}
        onSelectPriority={(p) => {
          if (!isProfileCompleted) {
            triggerLockedToast('Prioridades');
            return;
          }
          setSelectedPriority(p);
          setActiveTab('prioridades');
        }}
        onLockedTabClick={triggerLockedToast}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

