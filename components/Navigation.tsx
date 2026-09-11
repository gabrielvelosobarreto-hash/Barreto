"use client"

import { 
  LayoutDashboard, 
  Layers, 
  ShoppingCart, 
  ListTodo, 
  Package2, 
  LogOut, 
  User, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  Sun, 
  Moon, 
  Wrench,
  ShieldCheck,
  KeyRound,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Home,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { TabType, PriorityFilterType } from '@/app/page';
import { useApp } from '@/lib/context/AppContext';

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
  const { 
    theme, 
    toggleTheme, 
    authConfig, 
    logout, 
    changePassword, 
    resetAllData,
    basicProfile,
    updateBasicProfile,
    isProfileCompleted
  } = useApp();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [modalType, setModalType] = useState<'profile' | 'password' | 'reset' | null>(null);
  
  // Profile modal state
  const [profileFullName, setProfileFullName] = useState(basicProfile?.fullName || authConfig?.name || '');
  const [profileResidenceName, setProfileResidenceName] = useState(basicProfile?.residenceName || '');
  const [profileResidenceType, setProfileResidenceType] = useState(basicProfile?.residenceType || 'Casa');
  const [profilePhone, setProfilePhone] = useState(basicProfile?.phone || '');
  const [profileCityState, setProfileCityState] = useState(basicProfile?.cityState || '');
  const [profileAddress, setProfileAddress] = useState(basicProfile?.address || '');
  const [profileNotes, setProfileNotes] = useState(basicProfile?.notes || '');

  // Password modal state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [newHint, setNewHint] = useState(authConfig?.hint || '');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Limpar Dados security modal state
  const [resetPin, setResetPin] = useState('');
  const [resetError, setResetError] = useState('');
  const [showResetPin, setShowResetPin] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const openProfileModal = () => {
    setProfileFullName(basicProfile?.fullName || authConfig?.name || '');
    setProfileResidenceName(basicProfile?.residenceName || '');
    setProfileResidenceType(basicProfile?.residenceType || 'Casa');
    setProfilePhone(basicProfile?.phone || '');
    setProfileCityState(basicProfile?.cityState || '');
    setProfileAddress(basicProfile?.address || '');
    setProfileNotes(basicProfile?.notes || '');
    setModalType('profile');
    setIsProfileOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileFullName.trim() || !profileResidenceName.trim()) return;
    updateBasicProfile({
      fullName: profileFullName.trim(),
      residenceName: profileResidenceName.trim(),
      residenceType: profileResidenceType,
      phone: profilePhone.trim() || undefined,
      cityState: profileCityState.trim() || undefined,
      address: profileAddress.trim() || undefined,
      notes: profileNotes.trim() || undefined,
    });
    setModalType(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPin.trim() || !newPin.trim()) {
      setPwdError('Por favor, preencha os campos obrigatórios.');
      return;
    }
    if (newPin.length < 3) {
      setPwdError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }
    if (newPin !== confirmNewPin) {
      setPwdError('A confirmação da nova senha não confere.');
      return;
    }

    const success = await changePassword(currentPin.trim(), newPin.trim(), newHint.trim());
    if (!success) {
      setPwdError('Senha atual incorreta. Tente novamente.');
      return;
    }

    setPwdSuccess('Senha alterada com sucesso!');
    setTimeout(() => {
      setModalType(null);
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
      setPwdError('');
      setPwdSuccess('');
    }, 800);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetPin.trim()) {
      setResetError('Digite sua senha para confirmar.');
      return;
    }

    if (authConfig && authConfig.pin !== resetPin.trim()) {
      setResetError('Senha incorreta. Não foi possível limpar os dados.');
      return;
    }

    setIsResetting(true);
    setTimeout(() => {
      resetAllData();
      setIsResetting(false);
      setModalType(null);
      setResetPin('');
      setResetError('');
    }, 300);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 backdrop-blur-md md:px-8 transition-colors">
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Package2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Barreto App</span>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isProfileCompleted ? 'Acesso Seguro • Perfil Ativo' : 'Acesso Seguro • Perfil Pendente'}
          </span>
          {basicProfile?.residenceName && (
            <>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {basicProfile.residenceName}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                {basicProfile.residenceType}
              </span>
            </>
          )}
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

          {/* Menu do Perfil do Usuário */}
          <div className="relative" ref={menuRef}>
            <button 
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {basicProfile?.fullName ? basicProfile.fullName.charAt(0).toUpperCase() : authConfig?.name ? authConfig.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate hidden sm:inline">
                {basicProfile?.residenceName || authConfig?.name || 'Acesso Privativo'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Cabeçalho do Menu */}
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {basicProfile?.fullName || authConfig?.name || 'Família Barreto'}
                    </p>
                    {authConfig?.username && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        @{authConfig.username}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {basicProfile?.residenceName || 'Residência Não Configurada'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${isProfileCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {isProfileCompleted ? 'Perfil Cadastrado • Abas Liberadas' : 'Perfil Pendente'}
                    </span>
                  </div>
                </div>

                {/* Opções do Menu */}
                <div className="py-1">
                  <button 
                    onClick={openProfileModal}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <User className="h-4 w-4 text-slate-400" /> Meu Perfil Residencial
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentPin('');
                      setNewPin('');
                      setConfirmNewPin('');
                      setNewHint(authConfig?.hint || '');
                      setPwdError('');
                      setPwdSuccess('');
                      setModalType('password');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4 text-slate-400" /> Alterar Senha
                  </button>

                  <button 
                    onClick={() => {
                      setResetPin('');
                      setResetError('');
                      setShowResetPin(false);
                      setModalType('reset');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-amber-500" /> Limpar Dados
                  </button>
                </div>

                <div className="h-px bg-slate-100 dark:border-slate-800 my-1 mx-2" />

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-rose-500 dark:text-rose-400" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal: Meu Perfil Residencial */}
      {modalType === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Perfil Básico da Residência</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Dados do imóvel e do responsável</p>
                </div>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Responsável <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileFullName}
                  onChange={(e) => setProfileFullName(e.target.value)}
                  placeholder="Ex: Gabriel Veloso Barreto"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome ou Identificação do Imóvel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileResidenceName}
                  onChange={(e) => setProfileResidenceName(e.target.value)}
                  placeholder="Ex: Casa Principal Barreto, Apto 502"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tipo de Residência
                  </label>
                  <select
                    value={profileResidenceType}
                    onChange={(e) => setProfileResidenceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Sobrado">Sobrado</option>
                    <option value="Chácara / Sítio">Chácara / Sítio</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    value={profileCityState}
                    onChange={(e) => setProfileCityState(e.target.value)}
                    placeholder="Ex: São Paulo / SP"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Endereço / Bairro
                  </label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    placeholder="Ex: Rua das Amendoeiras, 250"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Observações da Residência
                </label>
                <textarea
                  rows={2}
                  value={profileNotes}
                  onChange={(e) => setProfileNotes(e.target.value)}
                  placeholder="Ex: Detalhes específicos, voltagem, caixa d'água..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  Atualizar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Alterar Senha */}
      {modalType === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Alterar Senha de Acesso</h3>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-3.5">
              {pwdError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pwdError}</span>
                </div>
              )}
              {pwdSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Senha Atual
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Digite sua senha atual"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nova Senha ou PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPwd ? 'Ocultar' : 'Ver'}</span>
                  </button>
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Dica de Senha <span className="font-normal text-slate-400">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="Ex: Ano especial"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Limpar Dados com Confirmação por Senha */}
      {modalType === 'reset' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-rose-50/50 dark:bg-rose-950/30">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">Limpar Dados</h3>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleConfirmReset}>
              <div className="p-6 space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="leading-relaxed">
                  Esta ação apagará todos os <strong>setores</strong>, <strong>manutenções</strong>, <strong>itens de compra</strong> e <strong>prioridades</strong> cadastrados para que você possa iniciar o controle limpo do zero.
                </p>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Seu <strong>login</strong>, <strong>senha</strong> e <strong>perfil único</strong> são mantidos e continuarão protegidos.</span>
                </div>

                <div className="pt-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Digite sua senha para autorizar:
                  </label>
                  <div className="relative">
                    <input 
                      type={showResetPin ? 'text' : 'password'}
                      value={resetPin}
                      onChange={(e) => {
                        setResetPin(e.target.value);
                        if (resetError) setResetError('');
                      }}
                      placeholder="••••••••"
                      autoFocus
                      required
                      className="w-full px-3 py-2 pl-9 pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium tracking-wider placeholder:tracking-normal"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowResetPin(!showResetPin)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-2.5 cursor-pointer"
                    >
                      {showResetPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{resetError}</span>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex gap-2">
                <button 
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isResetting || !resetPin.trim()}
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isResetting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Limpando...</span>
                    </>
                  ) : (
                    <span>Confirmar Limpeza</span>
                  )}
                </button>
              </div>
            </form>
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
  onLockedTabClick,
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
  selectedPriority?: PriorityFilterType;
  onSelectPriority?: (p: PriorityFilterType) => void;
  onLockedTabClick?: (tabLabel: string) => void;
}) {
  const { 
    priorityStats, 
    shoppingStats, 
    maintenanceStats, 
    authConfig, 
    logout, 
    basicProfile, 
    isProfileCompleted 
  } = useApp();
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
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
          <Package2 className="h-6 w-6" />
        </div>
        <div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 block leading-tight">Barreto App</span>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isPrioritiesItem = item.id === 'prioridades';
          const isShoppingItem = item.id === 'compras';
          const isMaintenanceItem = item.id === 'manutencao';
          const isLocked = !isProfileCompleted && item.id !== 'painel';

          return (
            <li key={item.id} className="flex flex-col">
              <button
                onClick={() => {
                  if (isLocked) {
                    onLockedTabClick?.(item.label);
                    return;
                  }
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
                disabled={isLocked}
                title={isLocked ? 'Cadastre o Perfil Básico para liberar' : undefined}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isLocked
                    ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500 hover:bg-transparent'
                    : isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isLocked ? 'text-slate-400' : isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                
                {isLocked ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                    <Lock className="w-3 h-3" />
                  </span>
                ) : (
                  <>
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
                  </>
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

      {/* Perfil e Trava de Acesso na base da Sidebar */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
            {basicProfile?.fullName ? basicProfile.fullName.charAt(0).toUpperCase() : authConfig?.name ? authConfig.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {basicProfile?.residenceName || authConfig?.name || 'Família Barreto'}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {isProfileCompleted ? 'Perfil Ativo' : 'Perfil Pendente'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Sair"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

export function BottomNav({ 
  activeTab, 
  onTabChange,
  selectedPriority = 'Todas',
  onSelectPriority,
  onLockedTabClick,
}: { 
  activeTab: TabType; 
  onTabChange: (tab: TabType) => void;
  selectedPriority?: PriorityFilterType;
  onSelectPriority?: (p: PriorityFilterType) => void;
  onLockedTabClick?: (tabLabel: string) => void;
}) {
  const { priorityStats, shoppingStats, maintenanceStats, isProfileCompleted } = useApp();
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
          const isLocked = !isProfileCompleted && item.id !== 'painel';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isLocked) {
                  onLockedTabClick?.(item.label);
                  return;
                }
                if (isPrioritiesItem) {
                  setIsPriorityModalOpen(true);
                } else {
                  onTabChange(item.id);
                }
              }}
              disabled={isLocked}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-1 flex-1 max-w-[68px] transition-colors relative ${
                isLocked
                  ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                  : isActive
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/50' : ''}`}>
                <Icon className={`h-4.5 w-4.5 ${isLocked ? 'text-slate-400' : isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
              </div>
              <span className="text-[9px] font-semibold truncate max-w-full">{item.label}</span>
              
              {isLocked ? (
                <span className="absolute top-1 right-2 text-slate-400 dark:text-slate-500">
                  <Lock className="w-2.5 h-2.5" />
                </span>
              ) : (
                <>
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
                </>
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
                <p className="text-xs text-slate-500 dark:text-slate-400">Selecione para filtrar produtos</p>
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
