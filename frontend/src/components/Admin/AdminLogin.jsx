import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';

const BACKEND_URL = 'http://localhost:5000';

export default function AdminLogin({ onLoginSuccess, onNavigateHome }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('admin.invalidCredentials'));
      }

      if (data.token) {
        onLoginSuccess(data.token, data.admin);
      } else {
        throw new Error(t('admin.invalidCredentials'));
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setErrorMessage(err.message || t('admin.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xl font-black shadow-lg shadow-emerald-500/10 mb-2">
            🛡️
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
              {t('admin.loginBadge')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('admin.loginTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10 text-left">
            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
              >
                <span className="text-base shrink-0">⚠️</span>
                <span className="flex-1 font-medium">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                {t('admin.emailLabel')}
              </label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('admin.emailPlaceholder')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-slate-300 uppercase tracking-wider"
              >
                {t('admin.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('admin.passwordPlaceholder')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-bold px-1.5 py-1 rounded bg-slate-800/60 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="w-full font-bold shadow-lg shadow-emerald-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-sm">⏳</span>
                    <span>{t('admin.btnLoggingIn')}</span>
                  </span>
                ) : (
                  <span>{t('admin.btnLogin')} →</span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Back to Member Site Link */}
        {onNavigateHome && (
          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-emerald-400 font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>{t('admin.navMemberSite')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
