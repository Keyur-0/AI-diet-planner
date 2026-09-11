import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onNavigateAdmin }) {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Medical & Nutrition Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs leading-relaxed text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-300 mb-1">
            <span className="text-amber-400">⚠️</span>
            <span>{t('footer.disclaimerTitle')}</span>
          </div>
          <p>
            {t('footer.disclaimerText')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 pt-2">
          <p>© {new Date().getFullYear()} {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.privacyPolicy')}</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.termsOfService')}</span>
            <span>•</span>
            {onNavigateAdmin && (
              <>
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="hover:text-emerald-400 text-slate-400 font-semibold cursor-pointer transition-colors"
                >
                  ⚡ Staff Portal
                </button>
                <span>•</span>
              </>
            )}
            <span className="hover:text-slate-400 cursor-pointer">{t('footer.gymMemberSupport')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
