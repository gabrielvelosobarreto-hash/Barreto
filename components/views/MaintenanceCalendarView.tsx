"use client"
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  CalendarDays, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Check, 
  User, 
  RotateCcw, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { 
  useApp, 
  type MaintenanceItem, 
  type MaintenanceStatus 
} from '@/lib/context/AppContext';

interface MaintenanceCalendarViewProps {
  onOpenEditModal: (item: MaintenanceItem) => void;
  onOpenNewModalWithDate: (dateStr: string) => void;
  onOpenScheduleModal: (item: MaintenanceItem) => void;
  showExpenses?: boolean;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function MaintenanceCalendarView({
  onOpenEditModal,
  onOpenNewModalWithDate,
  onOpenScheduleModal,
  showExpenses = true
}: MaintenanceCalendarViewProps) {
  const { 
    maintenances, 
    updateMaintenance, 
    deleteMaintenance, 
    toggleMaintenanceStatus, 
    rescheduleMaintenance,
    maintenanceStats 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  // Format today's string YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCompletedList, setShowCompletedList] = useState(false);

  const upcomingRef = React.useRef<HTMLDivElement>(null);
  const completedRef = React.useRef<HTMLDivElement>(null);

  const handleScrollToUpcoming = () => {
    upcomingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollToCompleted = () => {
    setShowCompletedList(true);
    setTimeout(() => {
      completedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Year and Month of current calendar view
  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth(); // 0 to 11

  // Navigate calendar month
  const prevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(todayStr);
  };

  // Build calendar matrix days
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      items: MaintenanceItem[];
      hasOverdue: boolean;
      hasPending: boolean;
      hasCompleted: boolean;
    }[] = [];

    // Previous month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(viewYear, viewMonth - 1, dayNum);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = maintenances.filter(m => m.dueDate === dateStr);

      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: dayItems,
        hasOverdue: dayItems.some(m => m.status !== 'Concluída' && dateStr < todayStr),
        hasPending: dayItems.some(m => m.status !== 'Concluída' && dateStr >= todayStr),
        hasCompleted: dayItems.some(m => m.status === 'Concluída'),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = maintenances.filter(m => m.dueDate === dateStr);

      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        items: dayItems,
        hasOverdue: dayItems.some(m => m.status !== 'Concluída' && dateStr < todayStr),
        hasPending: dayItems.some(m => m.status !== 'Concluída' && dateStr >= todayStr),
        hasCompleted: dayItems.some(m => m.status === 'Concluída'),
      });
    }

    // Next month padding to fill out 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextDate = new Date(viewYear, viewMonth + 1, dayNum);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = maintenances.filter(m => m.dueDate === dateStr);

      days.push({
        dayNumber: dayNum,
        dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        items: dayItems,
        hasOverdue: dayItems.some(m => m.status !== 'Concluída' && dateStr < todayStr),
        hasPending: dayItems.some(m => m.status !== 'Concluída' && dateStr >= todayStr),
        hasCompleted: dayItems.some(m => m.status === 'Concluída'),
      });
    }

    return days;
  }, [viewYear, viewMonth, maintenances, todayStr]);

  // Maintenances for selected date
  const selectedDateItems = useMemo(() => {
    return maintenances.filter(m => m.dueDate === selectedDate);
  }, [maintenances, selectedDate]);

  // Format date helper for display
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return 'Sem data';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Calculate day differences for countdown/overdue label
  const getDaysDiffLabel = (dateStr: string) => {
    if (!dateStr) return { text: '', isOverdue: false, isToday: false, isUpcoming: false, days: 0 };
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const days = Math.abs(diffDays);
      return { text: `Atrasada há ${days} ${days === 1 ? 'dia' : 'dias'}`, isOverdue: true, isToday: false, isUpcoming: false, days };
    }
    if (diffDays === 0) {
      return { text: 'Hoje', isOverdue: false, isToday: true, isUpcoming: false, days: 0 };
    }
    if (diffDays === 1) {
      return { text: 'Amanhã', isOverdue: false, isToday: false, isUpcoming: true, days: 1 };
    }
    return { text: `Em ${diffDays} dias`, isOverdue: false, isToday: false, isUpcoming: true, days: diffDays };
  };

  // Quick reschedule presets helper
  const handleQuickReschedule = (itemId: string, addDays: number) => {
    const base = new Date();
    base.setDate(base.getDate() + addDays);
    const newDueDate = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`;
    rescheduleMaintenance(itemId, newDueDate);
  };

  return (
    <div className="space-y-6">
      {/* 1. Barra de Indicadores do Calendário */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card Atrasadas */}
        <div 
          onClick={() => {
            if (maintenanceStats.overdueMaintenances.length > 0) {
              setSelectedDate(maintenanceStats.overdueMaintenances[0].dueDate);
            }
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            maintenanceStats.overdueCount > 0 
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 hover:shadow-md' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Em Atraso
            </span>
            {maintenanceStats.overdueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {maintenanceStats.overdueCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {maintenanceStats.overdueCount > 0 ? 'Requerem reagendamento imediato' : 'Tudo em dia'}
          </p>
        </div>

        {/* Card Hoje */}
        <div 
          onClick={goToToday}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              Para Hoje
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {maintenanceStats.todayCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Programadas para este dia
          </p>
        </div>

        {/* Card Próximas */}
        <div 
          onClick={handleScrollToUpcoming}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Próximas
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {maintenanceStats.upcomingCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Agendadas para as próximas semanas
          </p>
        </div>

        {/* Card Concluídas */}
        <div 
          onClick={handleScrollToCompleted}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Concluídas
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {maintenanceStats.completedCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Manutenções realizadas com sucesso
          </p>
        </div>
      </div>

      {/* 2. Calendário Interativo + Painel do Dia Selecionado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Grade do Calendário Mensal */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs">
          {/* Header do Mês e Navegação */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Clique no dia para visualizar ou agendar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goToToday}
                className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors mr-1"
                title="Ir para o dia de hoje"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEK_DAYS.map((wd, idx) => (
              <div 
                key={wd} 
                className={`text-[11px] font-bold uppercase tracking-wider py-1.5 ${
                  idx === 0 || idx === 6 
                    ? 'text-slate-400 dark:text-slate-500' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Grade de Células dos Dias */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cDay, idx) => {
              const isSelected = cDay.dateStr === selectedDate;
              return (
                <button
                  key={`${cDay.dateStr}-${idx}`}
                  type="button"
                  onClick={() => setSelectedDate(cDay.dateStr)}
                  className={`min-h-[68px] sm:min-h-[76px] p-2 rounded-2xl flex flex-col justify-between text-left transition-all relative group border ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : cDay.isToday
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/60 dark:border-emerald-500/50 text-slate-900 dark:text-slate-100'
                      : cDay.isCurrentMonth
                      ? 'bg-slate-50/70 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'bg-slate-100/40 dark:bg-slate-900/30 border-transparent text-slate-300 dark:text-slate-600 hover:text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-black ${
                      isSelected ? 'text-white' : cDay.isToday ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : ''
                    }`}>
                      {cDay.dayNumber}
                    </span>
                    {cDay.isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    )}
                  </div>

                  {/* Indicadores de Manutenções no Dia */}
                  <div className="mt-1 flex flex-wrap gap-1 items-center">
                    {cDay.items.slice(0, 3).map((item) => {
                      const isItemOverdue = item.status !== 'Concluída' && item.dueDate < todayStr;
                      const isItemCompleted = item.status === 'Concluída';
                      return (
                        <span
                          key={item.id}
                          title={`${item.title} (${item.status})`}
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : isItemOverdue
                              ? 'bg-rose-500 ring-2 ring-rose-300 dark:ring-rose-900'
                              : isItemCompleted
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                          }`}
                        />
                      );
                    })}
                    {cDay.items.length > 3 && (
                      <span className={`text-[9px] font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        +{cDay.items.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legenda do Calendário */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Em Atraso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span>Pendente / Agendada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Concluída</span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Detalhe do Dia Selecionado */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Data Selecionada
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formatDateBR(selectedDate)} {selectedDate === todayStr ? '(Hoje)' : ''}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewModalWithDate(selectedDate)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agendar Aqui</span>
              </button>
            </div>

            {/* Lista de Manutenções da Data Selecionada */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {selectedDateItems.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <CalendarCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Nenhuma manutenção agendada para {formatDateBR(selectedDate)}.
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Clique no botão &quot;Agendar Aqui&quot; acima para registrar uma tarefa.
                  </p>
                </div>
              ) : (
                selectedDateItems.map((item) => {
                  const diffInfo = getDaysDiffLabel(item.dueDate);
                  const isMenuOpen = openMenuId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        item.status === 'Concluída'
                          ? 'bg-slate-50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 opacity-80'
                          : diffInfo.isOverdue
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                          : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleMaintenanceStatus(item.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              item.status === 'Concluída'
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                            }`}
                            title={item.status === 'Concluída' ? 'Reabrir manutenção' : 'Concluir manutenção'}
                          >
                            {item.status === 'Concluída' && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="min-w-0">
                            <h5 className={`text-xs font-bold leading-snug truncate ${
                              item.status === 'Concluída' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {item.title}
                            </h5>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                              <span className="px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                {item.sector}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md font-bold ${
                                item.priority === 'Crítica' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                item.priority === 'Alta' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {item.priority}
                              </span>
                              {diffInfo.isOverdue && item.status !== 'Concluída' && (
                                <span className="px-2 py-0.5 rounded-md font-bold bg-rose-500 text-white">
                                  {diffInfo.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Menu 3 pontos sem transparência */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : item.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Opções do item"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div 
                              className="absolute right-0 top-7 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-slate-950/10 dark:ring-white/10 opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenScheduleModal(item);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                              >
                                <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                                Reagendar Data
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onOpenEditModal(item);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                Editar Manutenção
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  deleteMaintenance(item.id);
                                }}
                                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões Rápidos de Reagendamento se estiver em atraso */}
                      {diffInfo.isOverdue && item.status !== 'Concluída' && (
                        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-900/40">
                          <button
                            type="button"
                            onClick={() => handleQuickReschedule(item.id, 0)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 transition-colors"
                          >
                            Para Hoje
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickReschedule(item.id, 7)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            +7 Dias
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickReschedule(item.id, 30)}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            +30 Dias
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Responsável / Período configurável por item</span>
            <button
              type="button"
              onClick={goToToday}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Voltar para Hoje →
            </button>
          </div>
        </div>
      </div>

      {/* 3. DETALHAMENTO DAS MANUTENÇÕES POR PRAZO: EM ATRASO & PRÓXIMAS */}
      <div className="space-y-6 pt-2">
        {/* Seção 3.1: Manutenções em Atraso */}
        {maintenanceStats.overdueCount > 0 && (
          <div className="bg-rose-50/70 dark:bg-rose-950/20 rounded-3xl border-2 border-rose-200 dark:border-rose-900/60 p-5 md:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-rose-200 dark:border-rose-900/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500 text-white font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">
                    Manutenções em Atraso ({maintenanceStats.overdueCount})
                  </h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    Serviços cujo prazo planejado expirou e ainda não foram concluídos.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {maintenanceStats.overdueMaintenances.map((item) => {
                const diff = getDaysDiffLabel(item.dueDate);
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white uppercase tracking-wider">
                          {diff.text}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Data prevista: {formatDateBR(item.dueDate)}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {item.title}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description || 'Sem descrição.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {item.sector}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {item.responsible}
                        </span>
                      </div>
                    </div>

                    {/* Ações de Reagendamento Rápido */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickReschedule(item.id, 0)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-opacity"
                          title="Reagendar para o dia de hoje"
                        >
                          Para Hoje
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickReschedule(item.id, 7)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Adiar por 7 dias"
                        >
                          +7 Dias
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenScheduleModal(item)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Escolher nova data"
                        >
                          Outra Data...
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMaintenanceStatus(item.id)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Concluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Seção 3.2: Próximas Manutenções Agendadas */}
        <div ref={upcomingRef} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-xs scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                <span>Próximas Manutenções Agendadas ({maintenanceStats.upcomingCount})</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cronograma detalhado em ordem cronológica de vencimento.
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 self-start sm:self-auto">
              {maintenanceStats.upcomingCount} programadas
            </span>
          </div>

          {maintenanceStats.upcomingMaintenances.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhuma manutenção agendada para os próximos períodos.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {maintenanceStats.upcomingMaintenances.map((item) => {
                const diff = getDaysDiffLabel(item.dueDate);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-50/60 dark:bg-slate-850/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-xs transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          diff.isToday 
                            ? 'bg-emerald-600 text-white animate-pulse' 
                            : diff.days <= 3 
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {diff.text}
                        </span>

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatDateBR(item.dueDate)}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {item.title}
                      </h5>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description || 'Sem descrição.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {item.sector}
                        </span>
                        <span>•</span>
                        <span>{item.periodicity}</span>
                        <span>•</span>
                        <span>{item.responsible}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => onOpenScheduleModal(item)}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reagendar</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleMaintenanceStatus(item.id)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                          title="Concluir"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção 3.3: Manutenções Concluídas Recentemente (Colapsável) */}
        <div ref={completedRef} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs scroll-mt-6">
          <div 
            onClick={() => setShowCompletedList(!showCompletedList)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Manutenções Concluídas Recentemente ({maintenanceStats.completedCount})
                </h4>
                <p className="text-xs text-slate-400">
                  Histórico de serviços já finalizados na residência.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCompletedList(!showCompletedList)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              {showCompletedList ? 'Ocultar' : 'Exibir Concluídas'}
            </button>
          </div>

          {showCompletedList && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {maintenanceStats.completedMaintenances.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 line-through">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {item.sector}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{formatDateBR(item.dueDate)}</span>
                    <button
                      type="button"
                      onClick={() => toggleMaintenanceStatus(item.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      title="Reabrir tarefa"
                    >
                      Reabrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
