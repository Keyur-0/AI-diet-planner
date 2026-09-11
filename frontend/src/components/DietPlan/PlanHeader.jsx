import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';

export default function PlanHeader({
  name,
  goal,
  hasGeneratedPlan,
  planLanguage,
  onReset,
  onOpenGroceryList,
}) {
  const { t, languages } = useLanguage();
  const [printError, setPrintError] = useState(null);

  const langLabel = languages[planLanguage]?.nativeLabel || planLanguage?.toUpperCase();

  const handlePrint = () => {
    try {
      setPrintError(null);
      window.print();
    } catch (err) {
      console.error('PDF / Print Error:', err);
      setPrintError(t('plan.downloadError'));
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md shadow-emerald-500/30">
            ✓
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {hasGeneratedPlan ? t('plan.planSuccess') : t('plan.targetsCalculated')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                7 {t('plan.daysList')?.length ? 'Days' : 'Days'}
              </span>
              {langLabel && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                  {langLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-400 mt-0.5">
              {t('plan.badgeGymMember')}
            </p>
          </div>
        </div>

        {/* Action Buttons: Shopping List, Download PDF & Reset */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0 w-full sm:w-auto">
          {hasGeneratedPlan && onOpenGroceryList && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenGroceryList}
              className="flex-1 sm:flex-none justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
              aria-label={t('grocery.viewButton')}
            >
              <span aria-hidden="true">🛒</span>
              <span>{t('grocery.viewButton')}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="flex-1 sm:flex-none justify-center gap-2"
            aria-label={t('plan.downloadPdf')}
            title={t('plan.downloadPdfSubtitle')}
          >
            <span aria-hidden="true">📄</span>
            <span>{t('plan.downloadPdf')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            className="flex-1 sm:flex-none justify-center"
          >
            {t('plan.newRequest')}
          </Button>
        </div>
      </div>

      {/* Friendly error alert if print fails */}
      {printError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <span>⚠️ {printError}</span>
          <button
            type="button"
            onClick={() => setPrintError(null)}
            className="text-amber-400 hover:text-white font-bold text-sm px-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Title Section */}
      <div className="text-center space-y-2 py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-semibold">
          <span>⚡ {t('plan.badgeGymMember')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {hasGeneratedPlan ? t('plan.headingFull') : t('plan.headingTargetsOnly')}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          {t('plan.tailoredFor')}{' '}
          <span className="text-emerald-400 font-bold">{name}</span>{' '}
          {t('plan.toAchieve')}{' '}
          <span className="text-white font-semibold">{goal}</span>.
        </p>
      </div>
    </div>
  );
}
