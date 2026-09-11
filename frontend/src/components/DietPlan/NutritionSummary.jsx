import { useLanguage } from '../../context/LanguageContext';

export default function NutritionSummary({ nutrition, goal, activityLevel }) {
  const { t } = useLanguage();

  if (!nutrition) return null;

  return (
    <section 
      aria-label="Nutrition Summary"
      className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-2xl space-y-6 text-left"
    >
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            {t('plan.blueprintHeader')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t('plan.blueprintTitle')}
          </h2>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 self-start sm:self-auto">
          {t('plan.strategy')} <span className="text-emerald-400 font-bold">{nutrition.adjustmentType}</span>
        </div>
      </div>

      {/* 4 Key Target Cards (Calories, Protein, Carbs, Fat) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Daily Calories */}
        <div className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 flex flex-col justify-between shadow-lg shadow-emerald-950/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                🔥 {t('plan.dailyCaloriesLabel')}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {nutrition.targetCalories?.toLocaleString()}
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-semibold">kcal</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80 truncate">
            {t('plan.calibratedFor', { goal: goal?.toLowerCase() || '' })}
          </p>
        </div>

        {/* Protein */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">🍗 {t('plan.proteinLabel')}</span>
              <span className="text-xs font-bold text-slate-400">{nutrition.proteinPct}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{nutrition.proteinG}</span>
              <span className="text-sm font-bold text-slate-400">g</span>
              <span className="text-xs text-slate-500 ml-1">({nutrition.proteinKcal} kcal)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full"
                style={{ width: `${nutrition.proteinPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{t('plan.proteinDesc')}</p>
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">🍚 {t('plan.carbsLabel')}</span>
              <span className="text-xs font-bold text-slate-400">{nutrition.carbsPct}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{nutrition.carbsG}</span>
              <span className="text-sm font-bold text-slate-400">g</span>
              <span className="text-xs text-slate-500 ml-1">({nutrition.carbsKcal} kcal)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full"
                style={{ width: `${nutrition.carbsPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{t('plan.carbsDesc')}</p>
          </div>
        </div>

        {/* Fats */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400">🥑 {t('plan.fatLabel')}</span>
              <span className="text-xs font-bold text-slate-400">{nutrition.fatPct}%</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl sm:text-3xl font-black text-white">{nutrition.fatG}</span>
              <span className="text-sm font-bold text-slate-400">g</span>
              <span className="text-xs text-slate-500 ml-1">({nutrition.fatKcal} kcal)</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800/80">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-400 h-1.5 rounded-full"
                style={{ width: `${nutrition.fatPct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">{t('plan.fatDesc')}</p>
          </div>
        </div>
      </div>

      {/* Secondary Metabolic Baseline (BMR & TDEE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">{t('plan.bmrLabel')}</p>
            <p className="text-[11px] text-slate-500">{t('plan.bmrDesc')}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-white">{nutrition.bmr?.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-semibold ml-1">kcal</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/70 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">{t('plan.tdeeLabel')}</p>
            <p className="text-[11px] text-slate-500">{t('plan.tdeeDesc', { activity: activityLevel || '' })}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-teal-300">{nutrition.tdee?.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-semibold ml-1">kcal</span>
          </div>
        </div>
      </div>
    </section>
  );
}
