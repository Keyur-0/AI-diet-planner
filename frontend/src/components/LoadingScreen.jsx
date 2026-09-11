import { useLanguage } from '../context/LanguageContext';

export default function LoadingScreen() {
  const { t } = useLanguage();

  return (
    <div className="py-12 sm:py-20 px-4 max-w-xl mx-auto text-center space-y-8 animate-fadeIn">
      {/* Animated Pulse Ring */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
            ⚡
          </div>
        </div>
      </div>

      {/* Main Heading */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('plan.loadingTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          {t('plan.loadingSubtitle')}
        </p>
      </div>

      {/* Step Progress Checklist */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 text-left space-y-3.5 shadow-xl">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
            ✓
          </span>
          <span>{t('plan.loadingStep1')}</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
            ✓
          </span>
          <span>{t('plan.loadingStep2')}</span>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black shrink-0 animate-spin">
            ⟳
          </span>
          <span className="font-semibold text-emerald-300">{t('plan.loadingStep3')}</span>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {t('plan.loadingWait')}
      </p>
    </div>
  );
}
