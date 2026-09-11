import { useLanguage } from '../../context/LanguageContext';
import { gymConfig as defaultGymConfig } from '../../config/gymConfig';

export default function PrintPlanView({ customerData, gymConfig = defaultGymConfig }) {
  const { t } = useLanguage();

  if (!customerData) return null;

  const {
    name,
    age,
    gender,
    height,
    weight,
    goal,
    activityLevel,
    foodPreference,
    favoriteFoods,
    allergies,
    email,
    phone,
    nutrition,
    plan,
  } = customerData;

  const config = gymConfig || defaultGymConfig;

  const defaultDays = t('plan.daysList') || [
    'Monday (Day 1)',
    'Tuesday (Day 2)',
    'Wednesday (Day 3)',
    'Thursday (Day 4)',
    'Friday (Day 5)',
    'Saturday (Day 6)',
    'Sunday (Day 7)',
  ];

  const mealIcons = {
    breakfast: '🍳',
    morning_snack: '🍎',
    lunch: '🥗',
    evening_snack: '🥜',
    dinner: '🍲',
  };

  const mealLabels = {
    breakfast: t('plan.meals.breakfast'),
    morning_snack: t('plan.meals.morning_snack'),
    lunch: t('plan.meals.lunch'),
    evening_snack: t('plan.meals.evening_snack'),
    dinner: t('plan.meals.dinner'),
  };

  const formattedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const daysList = plan && Array.isArray(plan.days) ? plan.days : [];

  return (
    <div id="diet-plan-print-view" className="print-plan-container hidden print:block text-slate-900 bg-white font-sans text-xs leading-normal">
      {/* ========================================================================= */}
      {/* 1. DOCUMENT BRANDED HEADER */}
      {/* ========================================================================= */}
      <header className="border-b-2 border-emerald-600 pb-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm">
              {config.logo || '⚡'}
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                {config.gymName}
              </h1>
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                {config.tagline || t('plan.pdfOfficialHeader')}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">{config.phone}</p>
            <p>{config.email}</p>
            <p>{config.website}</p>
            <p className="text-slate-500 pt-1">
              <span className="font-semibold">{t('plan.pdfGeneratedOn')}:</span> {formattedDate}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 uppercase tracking-wide">
            {t('plan.pdfOfficialHeader')}
          </div>
          <div className="text-[11px] text-slate-700">
            {t('plan.tailoredFor')} <strong className="text-emerald-700 font-black">{name}</strong> • {t('plan.goalCardTitle')}: <strong className="text-slate-900">{goal}</strong>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MEMBER PROFILE & BODY STATS */}
      {/* ========================================================================= */}
      <section className="mb-6 avoid-break">
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
          <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              👤 {t('plan.pdfMemberProfile')}
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700">
              {config.gymName}
            </span>
          </div>

          <div className="p-3.5 grid grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.memberCardTitle')}</span>
              <span className="font-bold text-slate-900">{name}</span>
              <span className="text-slate-600 block text-[10px]">{gender}, {age} {t('form.ageUnit')}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.goalCardTitle')}</span>
              <span className="font-bold text-emerald-700">{goal}</span>
              <span className="text-slate-600 block text-[10px] truncate">{activityLevel}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.bodyStatsTitle')}</span>
              <span className="font-bold text-slate-900">{weight} {t('form.weightUnit')}</span>
              <span className="text-slate-600 block text-[10px]">{t('plan.heightPrefix')}{height} {t('form.heightUnit')}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.dietTypeTitle')}</span>
              <span className="font-bold text-slate-900">{foodPreference}</span>
              <span className="text-slate-600 block text-[10px] truncate" title={allergies}>
                {t('plan.allergiesPrefix')}{allergies || t('plan.none')}
              </span>
            </div>
          </div>

          {(favoriteFoods || email || phone) && (
            <div className="px-3.5 py-2 bg-slate-100/50 border-t border-slate-200/80 text-[10px] text-slate-600 flex justify-between gap-4">
              <div>
                <strong className="text-slate-700">{t('plan.foodsUsuallyEaten')}</strong> {favoriteFoods || t('plan.noneSpecified')}
              </div>
              <div>
                <strong className="text-slate-700">{t('plan.contactRegistered')}</strong> {email} • {phone}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. AUTHORITATIVE NUTRITIONAL BLUEPRINT */}
      {/* ========================================================================= */}
      {nutrition && (
        <section className="mb-6 avoid-break">
          <div className="border-2 border-emerald-600/60 rounded-xl p-4 bg-emerald-50/20">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  {t('plan.blueprintHeader')}
                </span>
                <h2 className="text-base font-black text-slate-900">
                  {t('plan.pdfTargetsTitle')}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]">
                {t('plan.strategy')} {nutrition.adjustmentType}
              </span>
            </div>

            {/* 4 Targets Grid */}
            <div className="grid grid-cols-4 gap-3 text-center mb-3">
              <div className="p-2.5 rounded-lg bg-white border border-emerald-300 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                  🔥 {t('plan.dailyCaloriesLabel')}
                </span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  {nutrition.targetCalories?.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">kcal/day</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                  🍗 {t('plan.proteinLabel')}
                </span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  {nutrition.proteinG}g
                </span>
                <span className="text-[9px] text-slate-500">{nutrition.proteinPct}% • {nutrition.proteinKcal} kcal</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-amber-700 block">
                  🍚 {t('plan.carbsLabel')}
                </span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  {nutrition.carbsG}g
                </span>
                <span className="text-[9px] text-slate-500">{nutrition.carbsPct}% • {nutrition.carbsKcal} kcal</span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-sky-700 block">
                  🥑 {t('plan.fatLabel')}
                </span>
                <span className="text-xl font-black text-slate-900 block mt-0.5">
                  {nutrition.fatG}g
                </span>
                <span className="text-[9px] text-slate-500">{nutrition.fatPct}% • {nutrition.fatKcal} kcal</span>
              </div>
            </div>

            {/* Baseline BMR & TDEE */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200/80 text-[10px] text-slate-600">
              <div className="flex items-center justify-between px-2 py-1 bg-white/80 rounded border border-slate-200">
                <span><strong>{t('plan.bmrLabel')}:</strong> {t('plan.bmrDesc')}</span>
                <strong className="text-slate-900 text-[11px]">{nutrition.bmr?.toLocaleString()} kcal</strong>
              </div>
              <div className="flex items-center justify-between px-2 py-1 bg-white/80 rounded border border-slate-200">
                <span><strong>{t('plan.tdeeLabel')}:</strong> {t('plan.tdeeDesc', { activity: activityLevel || '' })}</span>
                <strong className="text-emerald-800 text-[11px]">{nutrition.tdee?.toLocaleString()} kcal</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. 7-DAY MEAL SCHEDULE (ALL 7 DAYS & ALL 5 MEALS) */}
      {/* ========================================================================= */}
      {daysList.length > 0 && (
        <section className="mb-6 space-y-6">
          <div className="border-b border-slate-300 pb-2 mb-4 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              📋 {t('plan.pdfScheduleTitle')}
            </h2>
            <span className="text-[11px] font-bold text-emerald-700">
              7 {t('plan.daysList')?.length ? 'Days' : 'Days'} • 35 {t('plan.dayMealsCount', { count: 35 })}
            </span>
          </div>

          {daysList.map((dayObj, dayIdx) => {
            const currentDayNum = dayObj.day || dayIdx + 1;
            const dayLabel = dayObj.day_name || defaultDays[currentDayNum - 1] || `${t('plan.dayPrefix')} ${currentDayNum}`;
            const totals = dayObj.daily_totals || {};
            const totCalories = totals.calories ?? totals.calories_total ?? nutrition?.targetCalories;
            const totProtein = totals.protein_g ?? totals.protein ?? nutrition?.proteinG;
            const totCarbs = totals.carbs_g ?? totals.carbs ?? nutrition?.carbsG;
            const totFat = totals.fat_g ?? totals.fat ?? nutrition?.fatG;

            return (
              <div
                key={`print-day-${currentDayNum}`}
                className="day-print-card border border-slate-300 rounded-xl overflow-hidden bg-white shadow-none mb-6 avoid-break"
              >
                {/* Day Header */}
                <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      {currentDayNum}
                    </span>
                    <h3 className="font-bold text-xs uppercase tracking-wide">
                      {dayLabel}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold">
                    {dayObj.meals?.length || 5} {t('plan.dayMealsCount', { count: dayObj.meals?.length || 5 })}
                  </span>
                </div>

                {/* 5 Meals Grid */}
                <div className="p-3 grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  {dayObj.meals?.map((meal, mIdx) => {
                    const icon = mealIcons[meal?.type] || '🍽️';
                    const label = mealLabels[meal?.type] || meal?.type || `${t('plan.meals.breakfast')} ${mIdx + 1}`;
                    const portionText = meal?.portion || t('plan.portionDefault');

                    return (
                      <div
                        key={`print-meal-${currentDayNum}-${mIdx}`}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-[10px] space-y-2 avoid-break"
                      >
                        <div className="space-y-1.5">
                          {/* Meal Slot & Calories */}
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                            <span className="font-black text-[9px] uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <span>{icon}</span>
                              <span>{label}</span>
                            </span>
                            <span className="font-black text-slate-800 text-[10px]">
                              {meal?.calories} <span className="text-[8px] font-normal text-slate-500">kcal</span>
                            </span>
                          </div>

                          {/* Meal Name */}
                          <p className="font-bold text-slate-900 text-[11px] leading-tight">
                            {meal?.name}
                          </p>

                          {/* Portion */}
                          <p className="text-[9px] text-slate-600">
                            <span className="font-semibold text-slate-500">{t('plan.portionLabel')}:</span> {portionText}
                          </p>

                          {/* Ingredients */}
                          {Array.isArray(meal?.foods) && meal.foods.length > 0 && (
                            <div className="border-t border-slate-200/80 pt-1 space-y-0.5">
                              <span className="text-[8px] font-bold uppercase text-slate-500 block">
                                {t('plan.ingredientsLabel')}:
                              </span>
                              <ul className="space-y-0.5 text-[9px] text-slate-700">
                                {meal.foods.map((food, fIdx) => (
                                  <li key={fIdx} className="flex justify-between items-start gap-1">
                                    <span className="leading-tight">• {food.name}</span>
                                    {food.quantity && (
                                      <span className="font-mono text-[8px] text-slate-500 shrink-0">
                                        {food.quantity}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Macros Footer */}
                        <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200 text-center font-bold text-[8px]">
                          <div className="bg-emerald-50 text-emerald-800 rounded py-0.5">
                            P: {meal?.protein_g}g
                          </div>
                          <div className="bg-amber-50 text-amber-800 rounded py-0.5">
                            C: {meal?.carbs_g}g
                          </div>
                          <div className="bg-sky-50 text-sky-800 rounded py-0.5">
                            F: {meal?.fat_g}g
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Daily Total Summary Bar */}
                <div className="bg-slate-100 px-3.5 py-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-700">
                    📊 {t('plan.dailyTotalSummary', { day: currentDayNum })}:
                  </span>
                  <div className="flex items-center gap-3 font-extrabold text-slate-900">
                    <span>{totCalories?.toLocaleString()} <span className="text-[9px] font-normal text-slate-600">kcal</span></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-700">{totProtein}g <span className="text-[9px] font-normal text-slate-600">{t('plan.proteinLabel')}</span></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-amber-700">{totCarbs}g <span className="text-[9px] font-normal text-slate-600">{t('plan.carbsLabel')}</span></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sky-700">{totFat}g <span className="text-[9px] font-normal text-slate-600">{t('plan.fatLabel')}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. GYM CTA & ASSISTANCE */}
      {/* ========================================================================= */}
      <section className="mb-4 p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/40 avoid-break flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide">
            ⚡ {config.gymName} — {t('plan.pdfGymDeskContact')}
          </h4>
          <p className="text-[10px] text-slate-600 mt-0.5">
            {config.deskLocation} • {config.hours}
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-700 shrink-0">
          <p className="font-bold text-emerald-800">{config.phone}</p>
          <p>{config.email}</p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GENERAL NUTRITION & HEALTH DISCLAIMER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-tight space-y-1 avoid-break">
        <p className="font-bold text-slate-700">
          ⚠️ {t('plan.planDisclaimerTitle')}:
        </p>
        <p>
          {t('plan.planDisclaimerText')}
        </p>
        <p className="pt-1 text-slate-400">
          © {new Date().getFullYear()} {config.gymName}. {t('footer.copyright')}
        </p>
      </footer>
    </div>
  );
}
