"use client"

import { useState } from 'react';
import { TopBar, Sidebar, BottomNav } from '@/components/Navigation';
import DashboardView from '@/components/views/DashboardView';
import SectorsView from '@/components/views/SectorsView';
import ShoppingListView from '@/components/views/ShoppingListView';
import PrioritiesView from '@/components/views/PrioritiesView';
import MaintenanceView from '@/components/views/MaintenanceView';
import { AppProvider } from '@/lib/context/AppContext';

export type TabType = 'painel' | 'setores' | 'compras' | 'prioridades' | 'manutencao';
export type PriorityFilterType = 'Todas' | 'Alta' | 'Média' | 'Baixa';
export type MaintenanceMacroTab = 'lista' | 'calendario' | 'setores' | 'compras' | 'gastos';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('painel');
  const [selectedPriority, setSelectedPriority] = useState<PriorityFilterType>('Todas');
  const [maintenanceMacroTab, setMaintenanceMacroTab] = useState<MaintenanceMacroTab>('lista');
  const [targetSectorId, setTargetSectorId] = useState<number | null>(null);
  const [targetItemId, setTargetItemId] = useState<number | null>(null);

  const handleNavigate = (tab: TabType, priority?: PriorityFilterType, mTab?: MaintenanceMacroTab, sectorId?: number | null, itemId?: number | null) => {
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

  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans text-slate-900 dark:text-slate-100 selection:bg-emerald-100 dark:selection:bg-emerald-950/60 dark:selection:text-emerald-300 transition-colors">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => handleNavigate(tab)} 
          selectedPriority={selectedPriority}
          onSelectPriority={(p) => {
            setSelectedPriority(p);
            setActiveTab('prioridades');
          }}
        />
        
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0 h-screen overflow-y-auto relative">
          <TopBar />
          
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
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
          </main>
        </div>
        
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={(tab) => handleNavigate(tab)} 
          selectedPriority={selectedPriority}
          onSelectPriority={(p) => {
            setSelectedPriority(p);
            setActiveTab('prioridades');
          }}
        />
      </div>
    </AppProvider>
  );
}
