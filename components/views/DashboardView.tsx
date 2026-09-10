"use client"
import { 
  Wallet, 
  PieChart, 
  ListOrdered, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  ShieldCheck, 
  CalendarDays, 
  ShieldAlert,
  Package,
  Home,
  Building2,
  MapPin,
  User
} from 'lucide-react';
import Image from 'next/image';
import type { TabType, PriorityFilterType, MaintenanceMacroTab } from '@/app/page';
import { useApp } from '@/lib/context/AppContext';
import { getSectorColorTheme } from '@/lib/sectorThemeData';
import { useMemo } from 'react';

const VACUUM_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBKtA3FlkYa7E2kGmw4kmi3_3cuI2_mc9YANL6N43g1O5OXbkZUAxFf4U4oU8D_jHje8fxo9oaSCQvzHtfAxsAB6rkPgp2Jyf8KeJMJ_Z6tyLpNDbSR-mFSs4BDgOUL4OjO1sz5JUKrsTOKqjOgK3XlRHIp8g3WVmQC-MtArQzeIyxgf291VQ0PQlIL2Ps0nJwNyAI0r4rEVo7cWV1LjYcxwtJ3gcSoij0LWE0XYXuj-2far8-mnNNosg";

export default function DashboardView({ onNavigate }: { onNavigate: (t: TabType, priority?: PriorityFilterType, mTab?: MaintenanceMacroTab) => void }) {
  const { sectors, sectorItemsMap, shoppingStats, maintenanceStats, priorityItems, basicProfile } = useApp();

  // Detalhamento e gastos estimados em tempo real vinculados diretamente à aba Setores
  const sectorFinancials = useMemo(() => {
    const sectorData = sectors.map((sector) => {
      const items = sectorItemsMap[sector.id] || [];
      const count = items.length;
      const costNum = items.reduce((acc, it) => {
        const val = parseFloat(String(it.price).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        return acc + val;
      }, 0);
      const theme = getSectorColorTheme(sector.colorId, sector.iconId);
      return {
        id: sector.id,
        name: sector.name,
        count,
        cost: costNum,
        costFormatted: `R$ ${costNum.toFixed(2).replace('.', ',')}`,
        theme,
      };
    });

    const totalEstimatedCost = sectorData.reduce((acc, sec) => acc + sec.cost, 0);
    const totalItemsCount = sectorData.reduce((acc, sec) => acc + sec.count, 0);

    const breakdown = sectorData.map((sec) => {
      let percent = 0;
      if (totalEstimatedCost > 0) {
        percent = Math.round((sec.cost / totalEstimatedCost) * 100);
      } else if (totalItemsCount > 0) {
        percent = Math.round((sec.count / totalItemsCount) * 100);
      } else if (sectorData.length > 0) {
        percent = Math.round(100 / sectorData.length);
      }
      return {
        ...sec,
        percent,
      };
    });

    return {
      totalEstimatedCost,
      totalItemsCount,
      sectorsCount: sectors.length,
      breakdown,
    };
  }, [sectors, sectorItemsMap]);

  // Encontra o item de maior valor com Alta Prioridade
  const nextBigBuy = useMemo(() => {
    const highItems = priorityItems.filter(i => i.priority === 'Alta');
    if (highItems.length > 0) {
      return [...highItems].sort((a, b) => (b.numPrice * b.qty) - (a.numPrice * a.qty))[0];
    }
    return priorityItems[0] || null;
  }, [priorityItems]);

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header com Botão de Destaque para Manutenções */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              {basicProfile?.residenceName ? `${basicProfile.residenceName} • ${basicProfile.residenceType}` : 'Residência Privativa'}
            </span>
            {basicProfile?.fullName && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                por {basicProfile.fullName}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Painel Principal</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Resumo executivo, controle de compras e status das abas da casa em tempo real.</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('manutencao')}
          className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto group"
          title="Acessar painel completo de manutenções"
        >
          <Wrench className="h-4 w-4 transition-transform group-hover:rotate-12" />
          <span>Manutenções da Casa</span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-700/90 text-xs font-bold">
            {maintenanceStats.healthRate}% em dia
          </span>
        </button>
      </div>

      {/* Grid Principal do Painel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Card 1: Gasto Estimado da Aba Setores */}
        <div 
          onClick={() => onNavigate('setores')}
          className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md cursor-pointer group active:scale-[0.98]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Gasto Estimado</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total calculado dos setores</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-100">
                R$ {sectorFinancials.totalEstimatedCost.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                em {sectorFinancials.totalItemsCount} {sectorFinancials.totalItemsCount === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {sectorFinancials.sectorsCount} {sectorFinancials.sectorsCount === 1 ? 'setor cadastrado' : 'setores cadastrados'}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Ver setores →
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Detalhamento por Setor em tempo real da Aba Setores */}
        <div 
          onClick={() => onNavigate('setores')}
          className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Detalhamento por Setor</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Divisão de custos por ambiente</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {sectorFinancials.breakdown.length} {sectorFinancials.breakdown.length === 1 ? 'setor' : 'setores'}
              </span>
            </div>
            
            {/* Barra de distribuição proporcional com cores temáticas dos setores */}
            {sectorFinancials.breakdown.length > 0 ? (
              <>
                <div className="w-full flex h-6 rounded-full overflow-hidden mb-3.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
                  {sectorFinancials.breakdown.map((sector) => (
                    <div 
                      key={sector.id} 
                      className={`${sector.theme.barBg} h-full border-r border-white/60 dark:border-slate-900/60 hover:opacity-90 transition-opacity`}
                      style={{ width: `${Math.max(4, sector.percent)}%` }}
                      title={`${sector.name}: ${sector.costFormatted} (${sector.percent}%)`}
                    />
                  ))}
                </div>

                {/* Legenda dos setores */}
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-start text-xs font-medium text-slate-600 dark:text-slate-300 max-h-16 overflow-y-auto">
                  {sectorFinancials.breakdown.map((sector) => (
                    <div key={sector.id} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${sector.theme.dotBg}`}></div>
                      <span className="truncate max-w-[125px]">{sector.name} ({sector.percent}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nenhum setor cadastrado ainda. Cadastre seus ambientes para ver a divisão de custos.
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Detalhar ambientes →
            </span>
          </div>
        </div>

        {/* Card 3: Card Resumo de Manutenções da Casa - POSIÇÃO DE DESTAQUE */}
        <div 
          onClick={() => onNavigate('manutencao')}
          className="col-span-1 md:col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-500/40 dark:border-emerald-500/50 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer active:scale-[0.98] group relative"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Manutenções da Casa</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Controle preventivo e corretivo</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                {maintenanceStats.healthRate}% em dia
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 block">
                  {maintenanceStats.pendingCount}
                </span>
                <span className="text-[10px] text-slate-400">Pendentes</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400 block">
                  {maintenanceStats.itemsToBuyPending}
                </span>
                <span className="text-[10px] text-slate-400">Peças a Comprar</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block">
                  {maintenanceStats.completedCount}
                </span>
                <span className="text-[10px] text-slate-400">Concluídas</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              {maintenanceStats.totalCount} manutenções mapeadas
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
              Abrir Manutenções →
            </span>
          </div>
        </div>

        {/* Card 4: Quantitativo de Itens da Lista */}
        <div 
          onClick={() => onNavigate('compras')}
          className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer active:scale-95 group"
        >
          <div>
            <div className="flex items-center justify-between mb-3 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Total de Itens</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {shoppingStats.totalCount} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">itens</span>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {shoppingStats.completedCount} comprados
            </span>
            <span className="font-semibold text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
              Ver lista →
            </span>
          </div>
        </div>

        {/* Card 5: Próxima Grande Compra / Alta Prioridade */}
        <div 
          onClick={() => onNavigate('prioridades', 'Alta')}
          className="col-span-1 md:col-span-1 lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Próxima Grande Compra</h3>
            <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Alta Prioridade
            </span>
          </div>
          {nextBigBuy ? (
            <div className="flex items-center gap-4 mt-auto">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                {nextBigBuy.img ? (
                  <Image 
                    src={nextBigBuy.img} 
                    alt={nextBigBuy.name} 
                    width={64} 
                    height={64} 
                    className="h-full w-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <Package className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {nextBigBuy.name}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {nextBigBuy.category ? `Categoria ${nextBigBuy.category}` : 'Planejado para este ciclo'} • {nextBigBuy.qty} unidade(s)
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  R$ {(nextBigBuy.numPrice * nextBigBuy.qty).toFixed(2).replace('.', ',')}
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Investimento estimado</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto py-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Nenhuma compra prioritária pendente
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adicione itens com Alta Prioridade para planejar suas aquisições.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                Definir prioridades →
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO ESPECÍFICA NO DASHBOARD: PRÉVIA DE AGENDAMENTO E PRÓXIMAS MANUTENÇÕES */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Cronograma de Manutenções
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prévia vinculada ao Calendário de Agendamentos da aba Manutenção
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Coluna 1: Manutenções em Atraso */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    Manutenções em Atraso ({maintenanceStats.overdueCount})
                  </h4>
                </div>
                {maintenanceStats.overdueCount > 0 ? (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    Ação Necessária
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Em Dia
                  </span>
                )}
              </div>

              {maintenanceStats.overdueMaintenances.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                  Parabéns! Nenhuma manutenção está em atraso no momento.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {maintenanceStats.overdueMaintenances.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigate('manutencao', undefined, 'calendario')}
                      className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40 hover:shadow-xs transition-shadow cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shrink-0">
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{item.sector}</span>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            Prazo: {item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'Sem data'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 shrink-0 hover:underline">
                        Reagendar →
                      </span>
                    </div>
                  ))}
                  {maintenanceStats.overdueMaintenances.length > 3 && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 text-right font-semibold">
                      +{maintenanceStats.overdueMaintenances.length - 3} outras manutenções em atraso
                    </p>
                  )}
                </div>
              )}
            </div>

            {maintenanceStats.overdueCount > 0 && (
              <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-end text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('manutencao', undefined, 'calendario')}
                  className="font-bold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
                >
                  Ver no Calendário →
                </button>
              </div>
            )}
          </div>

          {/* Coluna 2: Próximas Manutenções */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Próximas Manutenções Agendadas ({maintenanceStats.upcomingCount})
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900">
                  Cronograma
                </span>
              </div>

              {maintenanceStats.upcomingMaintenances.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Nenhuma manutenção agendada para as próximas datas.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {maintenanceStats.upcomingMaintenances.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onNavigate('manutencao', undefined, 'calendario')}
                      className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:shadow-xs transition-shadow cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                            {item.sector}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.dueDate ? item.dueDate.split('-').reverse().join('/') : 'Sem data'}
                          </span>
                          <span>•</span>
                          <span>{item.periodicity}</span>
                          <span>•</span>
                          <span>{item.responsible}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0">
                        Ver →
                      </span>
                    </div>
                  ))}
                  {maintenanceStats.upcomingMaintenances.length > 3 && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 text-right font-semibold">
                      +{maintenanceStats.upcomingMaintenances.length - 3} outras agendadas
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                {maintenanceStats.todayCount > 0 && `${maintenanceStats.todayCount} manutenções para hoje`}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('manutencao', undefined, 'calendario')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Acessar Calendário Completo →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

