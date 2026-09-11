import { useLanguage } from '../../context/LanguageContext';

export default function MealCard({ meal, index }) {
  const { t } = useLanguage();

  const mealIcons = {
    breakfast: '🍳',
    morning_snack: '🍎',
    lunch: '🥗',
    evening_snack: '🥜',
    dinner: '🍲'
  };

  const mealLabels = {
    breakfast: t('plan.meals.breakfast'),
    morning_snack: t('plan.meals.morning_snack'),
    lunch: t('plan.meals.lunch'),
    evening_snack: t('plan.meals.evening_snack'),
    dinner: t('plan.meals.dinner')
  };

  const icon = mealIcons[meal?.type] || '🍽️';
  const label = mealLabels[meal?.type] || meal?.type || `${t('plan.meals.breakfast')} ${index + 1}`;

  // If the meal object has top-level portion field or foods with quantities
  const portionText = meal?.portion || t('plan.portionDefault');

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-md hover:shadow-emerald-500/5">
      <div className="space-y-3">
        {/* Header: Meal Slot Badge + Calories */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <span>{icon}</span>
            <span>{label}</span>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-black text-white">
            {meal?.calories} <span className="text-[10px] font-semibold text-slate-400">kcal</span>
          </span>
        </div>

        {/* Meal Name */}
        <div>
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
            {meal?.name}
          </h4>
          {portionText && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-400">{t('plan.portionLabel')}:</span>
              <span className="text-slate-300 font-medium">{portionText}</span>
            </div>
          )}
        </div>

        {/* Ingredients & Quantities List */}
        {Array.isArray(meal?.foods) && meal.foods.length > 0 && (
          <div className="border-t border-slate-800/80 pt-2.5 space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {t('plan.ingredientsLabel')}:
            </p>
            <ul className="space-y-1 text-xs text-slate-300">
              {meal.foods.map((food, fIdx) => (
                <li key={fIdx} className="flex items-start justify-between gap-2 leading-tight">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="font-medium text-slate-200">{food.name}</span>
                  </div>
                  {food.quantity && (
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {food.quantity}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Macro Split Footer */}
      <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-800/80 text-[11px] text-center font-bold">
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/70 text-emerald-400">
          <span className="text-[9px] text-slate-400 block font-normal">{t('plan.proteinLabel')}</span>
          <span>{meal?.protein_g}g</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/70 text-amber-400">
          <span className="text-[9px] text-slate-400 block font-normal">{t('plan.carbsLabel')}</span>
          <span>{meal?.carbs_g}g</span>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800/70 text-sky-400">
          <span className="text-[9px] text-slate-400 block font-normal">{t('plan.fatLabel')}</span>
          <span>{meal?.fat_g}g</span>
        </div>
      </div>
    </div>
  );
}
