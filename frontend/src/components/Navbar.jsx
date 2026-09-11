import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ onReset, isPlanView, isAdminView, onNavigateAdmin }) {
  const { language, setLanguage, t, languages } = useLanguage();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Gym Logo / Brand */}
        <div 
          onClick={onReset} 
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white block leading-none">
              PULSE<span className="text-emerald-400">FIT</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-slate-400 font-semibold block mt-0.5">
              {t('nav.brandTagline')}
            </span>
          </div>
        </div>

        {/* Right Section: Language Selector + Action Badge / Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              id="language-selector"
              aria-label="Select Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none cursor-pointer bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 text-xs sm:text-sm font-semibold pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1.5 rounded-lg border border-slate-700/80 hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-sm"
            >
              {Object.values(languages).map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-900 text-slate-200 py-1">
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 sm:right-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Admin Staff Portal Link / Reset Button */}
          {isAdminView ? (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('admin.navMemberSite') || '← Member Site'}
            </button>
          ) : isPlanView ? (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('nav.newDietPlan')}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {t('nav.assistantBadge')}
              </span>
              {onNavigateAdmin && (
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                  title="Gym Staff Portal"
                >
                  ⚡ Staff
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
