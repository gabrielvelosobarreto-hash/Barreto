"use client";

import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, Sun, Moon, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function LoginScreen() {
  const { login, theme, toggleTheme } = useApp();

  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!pin.trim()) {
      setErrorMessage('Digite sua senha para continuar.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = login(pin.trim(), rememberMe);
      setIsSubmitting(false);
      if (!success) {
        setErrorMessage('Senha incorreta. Tente novamente.');
      }
    }, 200);
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
        
        {/* Cabeçalho Minimalista sem dados pessoais */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Acesso Privativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Digite sua senha para acessar o painel
          </p>
        </div>

        {/* Mensagem de Erro Discreta */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário Seguro */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 pl-10 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all tracking-wider font-medium placeholder:tracking-normal"
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
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Acessar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Rodapé Minimalista */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Área Restrita e Protegida
          </span>
        </div>
      </div>
    </div>
  );
}
