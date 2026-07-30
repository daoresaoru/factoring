import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  lang: 'ru' | 'en';
}

export function AuthScreen({ lang }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const t = (ru: string, en: string) => (lang === 'ru' ? ru : en);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfoMessage(
          t(
            'Проверьте почту и подтвердите регистрацию, затем войдите.',
            'Check your email to confirm your account, then log in.'
          )
        );
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message ?? t('Произошла ошибка', 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">
          {t('Факторинг Дашборд', 'Factoring Dashboard')}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'login'
            ? t('Войдите в свой аккаунт', 'Log in to your account')
            : t('Создайте новый аккаунт', 'Create a new account')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('Email', 'Email')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('Пароль', 'Password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {infoMessage && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {infoMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition"
          >
            {loading
              ? t('Подождите...', 'Please wait...')
              : mode === 'login'
              ? t('Войти', 'Log In')
              : t('Зарегистрироваться', 'Sign Up')}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-500">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('signup');
                setError(null);
                setInfoMessage(null);
              }}
              className="text-emerald-600 hover:underline"
            >
              {t('Нет аккаунта? Зарегистрироваться', "Don't have an account? Sign up")}
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError(null);
                setInfoMessage(null);
              }}
              className="text-emerald-600 hover:underline"
            >
              {t('Уже есть аккаунт? Войти', 'Already have an account? Log in')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
