import { useLanguage } from '../../context/LanguageContext';

export default function DailyTotalCard({ totals = {}, targetNutrition = {}, dayNumber }) {
  const { t } = useLanguage();

  const calories = totals.calories ?? totals.calories_total ?? targetNutrition?.targetCalories;
  const protein = totals.protein_g ?? totals.protein ?? targetNutrition?.proteinG;
  const carbs = totals.carbs_g ?? totals.carbs ?? targetNutrition?.carbsG;
  const fat = totals.fat_g ?? totals.fat ?? targetNutrition?.fatG;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/25 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            📊 {t('plan.dailyTotalLabel')}
          </span>
          <h4 className="text-sm sm:text-base font-extrabold text-white">
            {t('plan.dailyTotalSummary', { day: dayNumber || '1' })}
          </h4>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {t('plan.scheduledMealsNote')}
        </span>
      </div>

      {/* 4 Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
        {/* Total Calories */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
            {t('plan.dailyCaloriesLabel')}
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            {calories?.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 ml-1">kcal</span>
        </div>

        {/* Total Protein */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-0.5">
            {t('plan.proteinLabel')}
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            {protein}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 ml-1">g</span>
        </div>

        {/* Total Carbs */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-amber-400 block mb-0.5">
            {t('plan.carbsLabel')}
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            {carbs}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 ml-1">g</span>
        </div>

        {/* Total Fat */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-sky-400 block mb-0.5">
            {t('plan.fatLabel')}
          </span>
          <span className="text-base sm:text-lg font-black text-white">
            {fat}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 ml-1">g</span>
        </div>
      </div>
    </div>
  );
}
