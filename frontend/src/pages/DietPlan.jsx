import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gymConfig } from '../config/gymConfig';
import Button from '../components/Button';
import PlanHeader from '../components/DietPlan/PlanHeader';
import NutritionSummary from '../components/DietPlan/NutritionSummary';
import DayNavigation from '../components/DietPlan/DayNavigation';
import MealCard from '../components/DietPlan/MealCard';
import DailyTotalCard from '../components/DietPlan/DailyTotalCard';
import GymCTA from '../components/DietPlan/GymCTA';
import PlanDisclaimer from '../components/DietPlan/PlanDisclaimer';
import PrintPlanView from '../components/DietPlan/PrintPlanView';
import GroceryList from '../components/GroceryList/GroceryList';

export default function DietPlan({ customerData, onReset }) {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState('plan'); // 'plan' | 'grocery'
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'full'

  if (!customerData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-400">{t('plan.noData')}</p>
        <Button onClick={onReset}>{t('plan.createPlan')}</Button>
      </div>
    );
  }

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
    planLanguage,
  } = customerData;

  const defaultDays = t('plan.daysList') || [
    'Monday (Day 1)',
    'Tuesday (Day 2)',
    'Wednesday (Day 3)',
    'Thursday (Day 4)',
    'Friday (Day 5)',
    'Saturday (Day 6)',
    'Sunday (Day 7)',
  ];

  const hasGeneratedPlan = Boolean(plan && Array.isArray(plan.days) && plan.days.length === 7);

  // If viewing the consolidated Grocery List
  if (activeView === 'grocery') {
    return (
      <GroceryList
        customerData={customerData}
        onBackToPlan={() => {
          setActiveView('plan');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DEDICATED PRINT-FRIENDLY PDF VIEW (Hidden on screen, active on print) */}
      {/* ========================================================================= */}
      <PrintPlanView customerData={customerData} gymConfig={gymConfig} />

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SCREEN VIEW (Active on screen, hidden on print) */}
      {/* ========================================================================= */}
      <div className="screen-plan-view print:hidden max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-8 animate-fadeIn">
        {/* PLAN HEADER WITH DOWNLOAD / PRINT PDF & GROCERY LIST ACTIONS */}
        <PlanHeader
          name={name}
          goal={goal}
          hasGeneratedPlan={hasGeneratedPlan}
          planLanguage={planLanguage}
          onReset={onReset}
          onOpenGroceryList={() => {
            setActiveView('grocery');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* AUTHORITATIVE NUTRITION SUMMARY */}
        {nutrition && (
          <NutritionSummary
            nutrition={nutrition}
            goal={goal}
            activityLevel={activityLevel}
          />
        )}

        {/* 7-DAY MEAL SCHEDULE & MEAL CARDS & DAILY TOTALS */}
        {hasGeneratedPlan ? (
          <section aria-label="7-Day Meal Schedule" className="space-y-6 text-left">
            {/* Day Navigation Tabs & View Mode Switcher */}
            <DayNavigation
              days={plan.days}
              activeDayIndex={activeDayIndex}
              onSelectDay={setActiveDayIndex}
              viewMode={viewMode}
              onToggleViewMode={setViewMode}
            />

            {/* Days Container */}
            <div className="space-y-8">
              {(viewMode === 'daily'
                ? [plan.days[activeDayIndex] || plan.days[0]]
                : plan.days
              ).map((dayObj, dayIdx) => {
                const currentDayNum = dayObj.day || (viewMode === 'daily' ? activeDayIndex + 1 : dayIdx + 1);
                const dayLabel = dayObj.day_name || defaultDays[currentDayNum - 1] || `${t('plan.dayPrefix')} ${currentDayNum}`;
                const totals = dayObj.daily_totals || {};

                return (
                  <div
                    key={currentDayNum}
                    className="p-5 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6"
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base">
                          {currentDayNum}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">{dayLabel}</h3>
                          <p className="text-xs text-slate-400">{t('plan.daySubtext')}</p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-xs font-semibold text-slate-300 self-start sm:self-auto">
                        <span>{t('plan.dayMealsCount', { count: dayObj.meals?.length || 5 })}</span>
                      </div>
                    </div>

                    {/* 5 Meal Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayObj.meals?.map((meal, mIdx) => (
                        <MealCard
                          key={`${currentDayNum}-${meal.type || mIdx}`}
                          meal={meal}
                          index={mIdx}
                        />
                      ))}
                    </div>

                    {/* Daily Total Summary Card */}
                    <DailyTotalCard
                      totals={totals}
                      targetNutrition={nutrition}
                      dayNumber={currentDayNum}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          /* Fallback Notice when GEMINI_API_KEY is not configured */
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-emerald-500/30 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  {t('plan.apiKeyNotice.badge')}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {t('plan.apiKeyNotice.title')}
                </h3>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold self-start sm:self-auto">
                {t('plan.apiKeyNotice.status')}
              </div>
            </div>

            <div className="py-8 px-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl mx-auto shadow-inner">
                🤖
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {t('plan.apiKeyNotice.desc')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Your daily targets of <strong className="text-emerald-400">{nutrition?.targetCalories?.toLocaleString()} kcal</strong> ({nutrition?.proteinG}g Protein, {nutrition?.carbsG}g Carbs, {nutrition?.fatG}g Fat) have been calculated and saved.
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-left text-slate-300 font-mono">
                  <code>GEMINI_API_KEY=your_key_here</code> in <code>backend/.env</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER PROFILE SUMMARY CARDS */}
        <section aria-label="Customer Profile Summary" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-left">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{t('plan.memberCardTitle')}</p>
              <p className="text-base sm:text-lg font-black text-white mt-1 truncate">{name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{gender}, {age} {t('form.ageUnit')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-left">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{t('plan.goalCardTitle')}</p>
              <p className="text-base sm:text-lg font-black text-emerald-400 mt-1 truncate">{goal}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{activityLevel}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-left">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{t('plan.bodyStatsTitle')}</p>
              <p className="text-base sm:text-lg font-black text-white mt-1">{weight} {t('form.weightUnit')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('plan.heightPrefix')}{height} {t('form.heightUnit')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-left">
              <p className="text-xs uppercase font-bold tracking-wider text-slate-400">{t('plan.dietTypeTitle')}</p>
              <p className="text-base sm:text-lg font-black text-white mt-1 truncate">{foodPreference}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate" title={allergies}>
                {t('plan.allergiesPrefix')}{allergies || t('plan.none')}
              </p>
            </div>
          </div>

          {/* Preferences & Contact Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div>
              <span className="font-semibold text-slate-300">{t('plan.foodsUsuallyEaten')}</span>
              <span>{favoriteFoods || t('plan.noneSpecified')}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-300">{t('plan.contactRegistered')}</span>
              <span>{email} • {phone}</span>
            </div>
          </div>
        </section>

        {/* GYM CALL TO ACTION */}
        <GymCTA gymConfig={gymConfig} />

        {/* NON-MEDICAL DISCLAIMER */}
        <PlanDisclaimer />

        {/* Bottom Reset / New Plan Button */}
        <div className="text-center pt-2">
          <Button size="lg" variant="secondary" onClick={onReset} className="w-full sm:w-auto px-8 py-3.5">
            {t('plan.generateAnother')}
          </Button>
        </div>
      </div>
    </>
  );
}
