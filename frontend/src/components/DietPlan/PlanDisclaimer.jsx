import { useLanguage } from '../../context/LanguageContext';

export default function PlanDisclaimer() {
  const { t } = useLanguage();

  return (
    <aside 
      aria-label="Health & Nutrition Disclaimer"
      className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-left space-y-2"
    >
      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
        <span className="text-amber-400 text-sm">⚠️</span>
        <span className="uppercase tracking-wider text-[11px] text-slate-300">
          {t('plan.planDisclaimerTitle')}
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        {t('plan.planDisclaimerText')}
      </p>
    </aside>
  );
}
