import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { gymConfig } from '../config/gymConfig';
import Button from '../components/Button';

export default function WorkoutPlan({ customerData, onReset }) {
  const { t } = useLanguage();
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'full'

  if (!customerData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-slate-400">{t('workoutPlan.noData')}</p>
        <Button onClick={onReset}>{t('workoutPlan.newWorkout')}</Button>
      </div>
    );
  }

  const {
    name,
    age,
    gender,
    height,
    weight,
    fitnessGoal,
    goal,
    experienceLevel,
    workoutLocation,
    equipment,
    daysPerWeek,
    durationMins,
    injuries,
    preferredExercises,
    plan,
    planLanguage,
  } = customerData;

  const effectiveGoal = fitnessGoal || goal || 'General Fitness';
  const hasGeneratedPlan = Boolean(plan && Array.isArray(plan.days) && plan.days.length === 7);

  const handlePrint = () => {
    window.print();
  };

  const defaultDays = [
    'Monday (Day 1)',
    'Tuesday (Day 2)',
    'Wednesday (Day 3)',
    'Thursday (Day 4)',
    'Friday (Day 5)',
    'Saturday (Day 6)',
    'Sunday (Day 7)',
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. DEDICATED PRINT HEADER (Only visible when printing) */}
      <div className="hidden print:block text-slate-900 mb-6 border-b border-slate-300 pb-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              PULSE<span className="text-emerald-600">FIT</span> GYM
            </h1>
            <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">
              Personalized 7-Day Workout Routine
            </p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-900">{name} ({age} yrs, {gender})</p>
            <p>{effectiveGoal} • {daysPerWeek || 4} Days/Week</p>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE SCREEN VIEW (Hidden when printing) */}
      <div className="screen-workout-view max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-8 text-left">
        {/* WORKOUT HEADER */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('workoutPlan.badge')}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {name}'s <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{t('workoutPlan.title')}</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {t('workoutPlan.subtitle')}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <Button
                variant="secondary"
                size="md"
                onClick={handlePrint}
                className="flex items-center gap-2 text-xs font-bold border border-slate-700 bg-slate-800/80 hover:bg-slate-700"
              >
                {t('workoutPlan.printButton')}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={onReset}
                className="flex items-center gap-2 text-xs font-bold"
              >
                {t('workoutPlan.newWorkout')}
              </Button>
            </div>
          </div>

          {/* Key Metrics Chips */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('workoutPlan.goal')}</p>
              <p className="text-sm font-bold text-white mt-0.5">{effectiveGoal}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('workoutPlan.experience')}</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{experienceLevel || 'Beginner'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('workoutPlan.frequency')}</p>
              <p className="text-sm font-bold text-white mt-0.5">{daysPerWeek ? `${daysPerWeek} Days/Wk` : '4 Days/Wk'}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-400">{t('workoutPlan.duration')}</p>
              <p className="text-sm font-bold text-teal-400 mt-0.5">{durationMins ? `${durationMins} Mins` : '45 Mins'}</p>
            </div>
          </div>
        </section>

        {/* PHYSICAL SAFETY & INJURY NOTICE */}
        {injuries && injuries !== 'None' && injuries !== 'none' && injuries !== 'કોઈ નહીં' && injuries !== 'कोई नहीं' && (
          <section className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-200 text-sm">
              <span>⚠️</span>
              <h4>{t('workoutPlan.safetyTitle')}</h4>
            </div>
            <p className="leading-relaxed">
              {plan?.safety_caution || `${t('workoutPlan.safetyNotice')} (Noted limitation: ${injuries})`}
            </p>
          </section>
        )}

        {/* 7-DAY WORKOUT SCHEDULE */}
        {hasGeneratedPlan ? (
          <section aria-label="7-Day Workout Routine" className="space-y-6">
            {/* Day Navigation Tabs & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
              {/* Day Pills Carousel */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
                {plan.days.map((dayObj, index) => {
                  const isSelected = activeDayIndex === index;
                  const isRest = Boolean(dayObj.is_rest_day || dayObj.focus?.toLowerCase().includes('rest') || dayObj.focus?.toLowerCase().includes('recovery') || dayObj.focus?.toLowerCase().includes('વિશ્રામ') || dayObj.focus?.toLowerCase().includes('આરામ'));

                  return (
                    <button
                      key={dayObj.day || index + 1}
                      type="button"
                      onClick={() => {
                        setActiveDayIndex(index);
                        if (viewMode === 'full') setViewMode('daily');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected && viewMode === 'daily'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{t('workoutPlan.dayPrefix')} {dayObj.day || index + 1}</span>
                      {isRest && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected && viewMode === 'daily' ? 'bg-slate-950' : 'bg-amber-400'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'daily'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('workoutPlan.viewDaily')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('full')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'full'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('workoutPlan.viewFull')}
                </button>
              </div>
            </div>

            {/* Days Container */}
            <div className="space-y-8">
              {(viewMode === 'daily'
                ? [plan.days[activeDayIndex] || plan.days[0]]
                : plan.days
              ).map((dayObj, dayIdx) => {
                const currentDayNum = dayObj.day || (viewMode === 'daily' ? activeDayIndex + 1 : dayIdx + 1);
                const dayLabel = dayObj.day_name || defaultDays[currentDayNum - 1] || `${t('workoutPlan.dayPrefix')} ${currentDayNum}`;
                const isRest = Boolean(dayObj.is_rest_day || dayObj.focus?.toLowerCase().includes('rest') || dayObj.focus?.toLowerCase().includes('recovery') || dayObj.focus?.toLowerCase().includes('વિશ્રામ') || dayObj.focus?.toLowerCase().includes('આરામ'));

                return (
                  <div
                    key={currentDayNum}
                    className="p-5 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-xl space-y-6 print:bg-white print:border-slate-300 print:shadow-none print:break-inside-avoid"
                  >
                    {/* Day Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 print:border-slate-300 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                          isRest
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 print:bg-amber-100 print:text-amber-800'
                            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:bg-emerald-100 print:text-emerald-800'
                        }`}>
                          {currentDayNum}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white print:text-slate-950">{dayLabel}</h3>
                          <p className="text-xs text-emerald-400 font-semibold mt-0.5 print:text-emerald-700">
                            🎯 {dayObj.focus}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-xs font-semibold text-slate-300 self-start sm:self-auto print:bg-slate-100 print:text-slate-700">
                        {isRest ? (
                          <span className="text-amber-400 font-bold print:text-amber-800">💤 {t('workoutPlan.restDayBadge')}</span>
                        ) : (
                          <span>⚡ {dayObj.exercises?.length || 0} {t('workoutPlan.exercisesCount', { count: dayObj.exercises?.length || 0 })}</span>
                        )}
                      </div>
                    </div>

                    {/* Warm-up Section */}
                    {dayObj.warmup && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
                        <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] block print:text-teal-700">
                          🔥 {t('workoutPlan.warmupTitle')}
                        </span>
                        <p className="leading-relaxed">{dayObj.warmup}</p>
                      </div>
                    )}

                    {/* Rest Day Design */}
                    {isRest ? (
                      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/40 to-slate-900/40 border border-amber-500/20 text-center space-y-3 print:bg-amber-50 print:border-amber-200">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-2xl flex items-center justify-center mx-auto">
                          🧘
                        </div>
                        <h4 className="text-base font-bold text-white print:text-slate-950">
                          {t('workoutPlan.restDayMessage')}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed print:text-slate-700">
                          {t('workoutPlan.restDayTip')}
                        </p>
                      </div>
                    ) : (
                      /* Active Workout Exercises List */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayObj.exercises?.map((exercise, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-3 flex flex-col justify-between print:bg-slate-50 print:border-slate-200 print:break-inside-avoid"
                          >
                            <div className="space-y-2">
                              {/* Exercise Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 print:bg-emerald-100 print:text-emerald-800">
                                    {exIdx + 1}
                                  </span>
                                  <h4 className="text-sm sm:text-base font-bold text-white print:text-slate-950 leading-tight">
                                    {exercise.name}
                                  </h4>
                                </div>
                              </div>

                              {/* Target Parameters Badges */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold print:bg-emerald-100 print:text-emerald-800">
                                  {exercise.sets} {t('workoutPlan.setsLabel')}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold print:bg-teal-100 print:text-teal-800">
                                  {exercise.reps} {t('workoutPlan.repsLabel')}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold print:bg-slate-200 print:text-slate-800">
                                  ⏱️ {exercise.rest}
                                </span>
                              </div>
                            </div>

                            {/* Form & Technique Tip */}
                            {exercise.instructions && (
                              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed print:bg-white print:text-slate-700 print:border-slate-200">
                                <span className="text-emerald-400 font-bold mr-1 print:text-emerald-700">💡</span>
                                {exercise.instructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cool-down Section */}
                    {dayObj.cooldown && (
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 space-y-1 print:bg-slate-50 print:border-slate-200 print:text-slate-800">
                        <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] block print:text-indigo-700">
                          ❄️ {t('workoutPlan.cooldownTitle')}
                        </span>
                        <p className="leading-relaxed">{dayObj.cooldown}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400">
            {t('workoutPlan.noData')}
          </div>
        )}

        {/* GYM SAFETY DISCLAIMER */}
        <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2 print:border-slate-300 print:bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
            🛡️ {t('workoutPlan.safetyTitle')}
          </h4>
          <p className="text-xs text-slate-400 max-w-2xl mx-auto leading-relaxed print:text-slate-600">
            {t('workoutPlan.safetyNotice')}
          </p>
        </section>
      </div>
    </div>
  );
}
