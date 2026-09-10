"use client";

import { useState } from 'react';
import { 
  Home, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  LayoutGrid,
  ShoppingCart,
  Star,
  Wrench,
  Lock
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

const RESIDENCE_TYPES = [
  { id: 'Casa', label: 'Casa', icon: '🏡' },
  { id: 'Apartamento', label: 'Apartamento', icon: '🏢' },
  { id: 'Sobrado', label: 'Sobrado', icon: '🏠' },
  { id: 'Chácara / Sítio', label: 'Chácara / Sítio', icon: '🌳' },
  { id: 'Comercial', label: 'Comercial', icon: '💼' },
  { id: 'Outro', label: 'Outro', icon: '📍' },
];

interface BasicProfileSetupProps {
  onCompleted?: () => void;
}

export default function BasicProfileSetup({ onCompleted }: BasicProfileSetupProps) {
  const { authConfig, basicProfile, saveBasicProfile } = useApp();

  const [fullName, setFullName] = useState(basicProfile?.fullName || authConfig?.name || '');
  const [residenceName, setResidenceName] = useState(basicProfile?.residenceName || '');
  const [residenceType, setResidenceType] = useState(basicProfile?.residenceType || 'Casa');
  const [phone, setPhone] = useState(basicProfile?.phone || '');
  const [cityState, setCityState] = useState(basicProfile?.cityState || '');
  const [address, setAddress] = useState(basicProfile?.address || '');
  const [notes, setNotes] = useState(basicProfile?.notes || '');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor, informe seu nome completo ou do responsável pela residência.');
      return;
    }

    if (!residenceName.trim()) {
      setErrorMsg('Por favor, informe o nome ou identificação da residência (ex: Casa Barreto).');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      saveBasicProfile({
        fullName: fullName.trim(),
        residenceName: residenceName.trim(),
        residenceType,
        phone: phone.trim() || undefined,
        cityState: cityState.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setIsSaving(false);
      if (onCompleted) {
        onCompleted();
      }
    }, 350);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4 animate-in fade-in duration-300">
      
      {/* Banner de Aviso de Bloqueio das Demais Abas */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start sm:items-center gap-3 shadow-xs">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm">
          <span className="font-bold block text-slate-900 dark:text-slate-100 mb-0.5">
            Etapa Obrigatória de Liberação
          </span>
          As abas de <strong>Setores</strong>, <strong>Lista de Compras</strong>, <strong>Prioridades</strong> e <strong>Manutenção</strong> serão desbloqueadas automaticamente após o preenchimento do seu Perfil Básico abaixo.
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-300/40 dark:border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Configuração Residencial
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Cadastro do Perfil Básico
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Personalize o sistema com os dados da sua residência para gerenciar cômodos, itens e manutenções com precisão.
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <div className="text-left text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 block font-semibold text-[10px] uppercase tracking-wider">Perfil Único Cadastrado</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">
                {authConfig?.name || 'Gabriel Veloso Barreto'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="my-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-200">
            {errorMsg}
          </div>
        )}

        {/* Formulário de Perfil Básico */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome do Responsável */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Nome do Responsável / Proprietário <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Gabriel Veloso Barreto"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Nome da Residência */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Nome ou Identificação do Imóvel <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={residenceName}
                  onChange={(e) => setResidenceName(e.target.value)}
                  placeholder="Ex: Residência Barreto, Casa 01, Apartamento Jardins"
                  required
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <Home className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Tipo de Imóvel */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Tipo de Residência / Imóvel <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {RESIDENCE_TYPES.map((type) => {
                const isSelected = residenceType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setResidenceType(type.id)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Telefone e Cidade/UF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Telefone / WhatsApp de Contato
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Cidade e Estado (UF)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Ex: São Paulo / SP"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                />
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          {/* Endereço / Bairro */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Endereço Completo ou Bairro <span className="font-normal text-slate-400 lowercase">(opcional)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Amendoeiras, 250 - Jardim Paulista"
                className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
              <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Notas Adicionais */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Observações Gerais da Residência <span className="font-normal text-slate-400 lowercase">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Imóvel reformado recentemente; caixa d'água de 1.000L; voltagem 220V na cozinha."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Visual dos módulos que serão liberados */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Módulos liberados ao salvar o perfil:
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Setores</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Cômodos e Itens</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Compras</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Lista & Custos</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Star className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Prioridades</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Alta, Média, Baixa</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Manutenção</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Calendário & Ações</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Conclusão */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando Perfil e Liberando Acesso...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Cadastrar Perfil Básico e Liberar Demais Abas</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
