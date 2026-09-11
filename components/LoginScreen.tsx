"use client";

import { useState, useEffect } from 'react';
import { Lock, User, KeyRound, Eye, EyeOff, Sun, Moon, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2, X, Home, UserPlus } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function LoginScreen() {
  const { login, registerOrResetUser, resetPassword, theme, toggleTheme } = useApp();

  const [username, setUsername] = useState<string>('');
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de cadastro ou redefinição de perfil/senha
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'reset' | 'register'>('reset');
  const [modalUsername, setModalUsername] = useState('');
  const [modalFullName, setModalFullName] = useState('');
  const [modalResidenceName, setModalResidenceName] = useState('');
  const [modalResidenceType, setModalResidenceType] = useState('Casa');
  const [modalPin, setModalPin] = useState('');
  const [modalConfirmPin, setModalConfirmPin] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Informe o nome de usuário.');
      return;
    }

    if (!pin.trim()) {
      setErrorMessage('Digite sua senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(username.trim(), pin.trim(), rememberMe);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.message || 'Usuário ou senha incorretos.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Erro ao validar acesso com o servidor. Tente novamente.');
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (!modalUsername.trim()) {
      setModalError('Informe o nome de usuário.');
      return;
    }

    if (modalPin.trim().length < 4) {
      setModalError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (modalPin !== modalConfirmPin) {
      setModalError('As senhas digitadas não coincidem.');
      return;
    }

    setIsModalSubmitting(true);
    try {
      if (modalMode === 'reset') {
        const success = await resetPassword(
          modalPin.trim(),
          '',
          modalUsername.trim().toLowerCase()
        );
        if (success) {
          setModalSuccess(true);
          setTimeout(() => {
            setIsModalOpen(false);
            setModalSuccess(false);
          }, 700);
        } else {
          setModalError('Não foi possível redefinir a senha. Verifique o usuário.');
        }
      } else {
        const res = await registerOrResetUser({
          username: modalUsername.trim().toLowerCase(),
          pin: modalPin.trim(),
          fullName: modalFullName.trim() || undefined,
          residenceName: modalResidenceName.trim() || undefined,
          residenceType: modalResidenceType,
        });

        if (res.success) {
          setModalSuccess(true);
          setTimeout(() => {
            setIsModalOpen(false);
            setModalSuccess(false);
          }, 700);
        } else {
          setModalError(res.message || 'Não foi possível cadastrar o usuário. Tente novamente.');
        }
      }
    } catch {
      setModalError('Erro na comunicação com o servidor.');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const openResetModal = () => {
    setModalMode('reset');
    setModalError('');
    setModalUsername(username.trim());
    setModalPin('');
    setModalConfirmPin('');
    setIsModalOpen(true);
  };

  const openRegisterModal = () => {
    setModalMode('register');
    setModalError('');
    setModalUsername(username.trim());
    setModalFullName('');
    setModalResidenceName('');
    setModalResidenceType('Casa');
    setModalPin('');
    setModalConfirmPin('');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative select-none">
      
      {/* Botão de Tema Discreto no Topo */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-500" />
          )}
        </button>
      </div>

      {/* Card Minimalista de Acesso Privativo */}
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho Minimalista */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Acesso Privativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Informe seu usuário e senha vinculados ao app
          </p>
        </div>

        {/* Mensagem de Erro Discreta */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Formulário Seguro com Usuário e Senha Vinculados */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo Usuário */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Usuário de Acesso
            </label>
            <div className="relative">
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
                className="w-full px-3.5 py-2.5 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium placeholder:font-normal placeholder:text-slate-400"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all tracking-wider font-medium placeholder:tracking-normal placeholder:text-slate-400"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3.5 top-3 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Manter conectado */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400 font-medium">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <span>Manter conectado</span>
            </label>
          </div>

          {/* Botão de Entrar */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Carregando dados...</span>
              </>
            ) : (
              <>
                <span>Acessar Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links de Suporte e Acesso */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-center">
          <button
            id="login-reset-password-button"
            type="button"
            onClick={openResetModal}
            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Redefinir senha de acesso</span>
          </button>
          
          <button
            id="login-register-user-button"
            type="button"
            onClick={openRegisterModal}
            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar novo perfil de morador</span>
          </button>
        </div>

        {/* Rodapé Minimalista */}
        <div className="mt-3 text-center">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Dados e permissões vinculados ao usuário ativo
          </span>
        </div>
      </div>

      {/* Modal de Redefinição ou Cadastro de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            {/* Fechar Modal */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {modalMode === 'reset' ? 'Redefinir Senha de Acesso' : 'Cadastrar Novo Perfil'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {modalMode === 'reset' 
                  ? 'Informe seu usuário e defina uma nova senha para recuperar o acesso.'
                  : 'Configure as credenciais e dados da residência que serão carregados neste acesso.'}
              </p>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess ? (
              <div className="py-6 text-center text-emerald-600 dark:text-emerald-400 flex flex-col items-center">
                <CheckCircle2 className="w-10 h-10 mb-2 animate-bounce" />
                <span className="text-sm font-semibold">
                  {modalMode === 'reset' ? 'Senha atualizada com sucesso! Entrando...' : 'Perfil cadastrado com sucesso! Entrando...'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    value={modalUsername}
                    onChange={(e) => setModalUsername(e.target.value)}
                    placeholder="ex: usuario"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {modalMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={modalFullName}
                        onChange={(e) => setModalFullName(e.target.value)}
                        placeholder="ex: Nome Sobrenome"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Residência
                        </label>
                        <input
                          type="text"
                          value={modalResidenceName}
                          onChange={(e) => setModalResidenceName(e.target.value)}
                          placeholder="ex: Residência"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tipo
                        </label>
                        <select
                          value={modalResidenceType}
                          onChange={(e) => setModalResidenceType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        >
                          <option value="Casa">Casa</option>
                          <option value="Apartamento">Apartamento</option>
                          <option value="Chácara">Chácara</option>
                          <option value="Sobrado">Sobrado</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {modalMode === 'reset' ? 'Nova Senha de Acesso' : 'Senha de Acesso'}
                  </label>
                  <div className="relative">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      value={modalPin}
                      onChange={(e) => setModalPin(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="w-full px-3 py-2 pr-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-2.5 top-2.5 transition-colors cursor-pointer"
                    >
                      {showModalPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={modalConfirmPin}
                    onChange={(e) => setModalConfirmPin(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isModalSubmitting}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-70 flex items-center justify-center gap-1.5"
                  >
                    {isModalSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      modalMode === 'reset' ? 'Salvar Nova Senha e Entrar' : 'Cadastrar e Entrar'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
