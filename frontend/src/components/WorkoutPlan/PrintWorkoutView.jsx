import { useLanguage } from '../../context/LanguageContext';
import { gymConfig as defaultGymConfig } from '../../config/gymConfig';

export default function PrintWorkoutView({ customerData, gymConfig = defaultGymConfig }) {
  const { t } = useLanguage();

  if (!customerData) return null;

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
    email,
    phone,
    plan,
  } = customerData;

  const config = gymConfig || defaultGymConfig;
  const effectiveGoal = fitnessGoal || goal || 'General Fitness';

  const defaultDays = [
    'Monday (Day 1)',
    'Tuesday (Day 2)',
    'Wednesday (Day 3)',
    'Thursday (Day 4)',
    'Friday (Day 5)',
    'Saturday (Day 6)',
    'Sunday (Day 7)',
  ];

  const formattedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const daysList = plan && Array.isArray(plan.days) ? plan.days : [];

  return (
    <div id="workout-plan-print-view" className="print-workout-container hidden print:block text-slate-900 bg-white font-sans text-xs leading-normal">
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
                {t('workoutPlan.badge') || 'Personalized Workout Routine'}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">{config.phone}</p>
            <p>{config.email}</p>
            <p>{config.website}</p>
            <p className="text-slate-500 pt-1">
              <span className="font-semibold">{t('plan.pdfGeneratedOn') || 'Generated on'}:</span> {formattedDate}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 uppercase tracking-wide">
            OFFICIAL 7-DAY WORKOUT BLUEPRINT
          </div>
          <div className="text-[11px] text-slate-700">
            {t('plan.tailoredFor') || 'Tailored for'} <strong className="text-emerald-700 font-black">{name}</strong> • {t('workoutPlan.goal')}: <strong className="text-slate-900">{effectiveGoal}</strong>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MEMBER PROFILE & TRAINING BLUEPRINT SUMMARY */}
      {/* ========================================================================= */}
      <section className="mb-6 avoid-break">
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/60">
          <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              👤 {t('plan.pdfMemberProfile') || 'Member Profile & Baseline Metrics'}
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700">
              {config.gymName}
            </span>
          </div>

          <div className="p-3.5 grid grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.memberCardTitle') || 'Member'}</span>
              <span className="font-bold text-slate-900">{name}</span>
              <span className="text-slate-600 block text-[10px]">{gender}, {age} {t('form.ageUnit') || 'yrs'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('workoutPlan.goal')} & {t('workoutPlan.experience')}</span>
              <span className="font-bold text-emerald-700">{effectiveGoal}</span>
              <span className="text-slate-600 block text-[10px] capitalize">{experienceLevel || 'Beginner'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('plan.bodyStatsTitle') || 'Body Stats'}</span>
              <span className="font-bold text-slate-900">{weight} {t('form.weightUnit') || 'kg'}</span>
              <span className="text-slate-600 block text-[10px]">{t('plan.heightPrefix') || 'Ht: '}{height} {t('form.heightUnit') || 'cm'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">{t('workoutPlan.frequency')} & {t('workoutPlan.duration')}</span>
              <span className="font-bold text-slate-900">{daysPerWeek ? `${daysPerWeek} Days/Wk` : '4 Days/Wk'}</span>
              <span className="text-slate-600 block text-[10px]">{durationMins ? `${durationMins} Mins/Session` : '45 Mins'}</span>
            </div>
          </div>

          {(equipment || injuries || preferredExercises || email || phone) && (
            <div className="px-3.5 py-2.5 bg-slate-100/60 border-t border-slate-200 text-[10px] text-slate-700 space-y-1">
              {equipment && (
                <div>
                  <strong className="text-slate-900">Available Equipment:</strong> {equipment}
                </div>
              )}
              {injuries && injuries !== 'None' && injuries !== 'none' && injuries !== 'કોઈ નહીં' && injuries !== 'कोई नहीं' && (
                <div className="text-amber-800">
                  <strong className="text-amber-900">⚠️ Limitations / Injury Notes:</strong> {injuries}
                </div>
              )}
              {preferredExercises && (
                <div>
                  <strong className="text-slate-900">Preferred Movements:</strong> {preferredExercises}
                </div>
              )}
              {(email || phone) && (
                <div className="text-slate-500 pt-0.5">
                  <strong className="text-slate-700">{t('plan.contactRegistered') || 'Contact'}:</strong> {email} • {phone}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 7-DAY WORKOUT SCHEDULE (ALL 7 DAYS IN SEQUENCE) */}
      {/* ========================================================================= */}
      {daysList.length > 0 && (
        <section className="mb-6 space-y-5">
          <div className="border-b border-slate-300 pb-2 mb-3 flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              📋 {t('workoutPlan.title') || '7-Day Workout Routine'}
            </h2>
            <span className="text-[11px] font-bold text-emerald-700">
              7 {t('plan.daysList')?.length ? 'Days' : 'Days'} • {daysPerWeek || 4} Active Training Days
            </span>
          </div>

          {daysList.map((dayObj, dayIdx) => {
            const currentDayNum = dayObj.day || dayIdx + 1;
            const dayLabel = dayObj.day_name || dayObj.dayName || defaultDays[currentDayNum - 1] || `${t('workoutPlan.dayPrefix')} ${currentDayNum}`;
            const isRest = Boolean(
              dayObj.is_rest_day ||
              dayObj.isRestDay ||
              dayObj.focus?.toLowerCase().includes('rest') ||
              dayObj.focus?.toLowerCase().includes('recovery') ||
              dayObj.focus?.toLowerCase().includes('વિશ્રામ') ||
              dayObj.focus?.toLowerCase().includes('આરામ')
            );

            return (
              <div
                key={`print-workout-day-${currentDayNum}`}
                className="workout-day-print-card border border-slate-300 rounded-xl overflow-hidden bg-white mb-5"
              >
                {/* Day Header */}
                <div className="workout-day-header bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-md font-black text-xs flex items-center justify-center ${
                      isRest ? 'bg-amber-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {currentDayNum}
                    </span>
                    <div>
                      <h3 className="font-bold text-xs uppercase tracking-wide text-white">
                        {dayLabel}
                      </h3>
                      <p className="text-[10px] text-emerald-300 font-semibold">
                        🎯 {dayObj.focus}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/80 font-semibold text-slate-200">
                    {isRest ? `💤 ${t('workoutPlan.restDayBadge') || 'Rest & Recovery'}` : `⚡ ${dayObj.exercises?.length || 0} ${t('workoutPlan.exercisesCount', { count: dayObj.exercises?.length || 0 })}`}
                  </span>
                </div>

                <div className="p-3.5 space-y-3">
                  {/* Warm-up */}
                  {dayObj.warmup && (
                    <div className="avoid-break p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-[11px] text-teal-950">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-teal-800 block mb-0.5">
                        🔥 {t('workoutPlan.warmupTitle') || 'Warm-up'}
                      </span>
                      <p className="leading-relaxed">{dayObj.warmup}</p>
                    </div>
                  )}

                  {/* Rest Day Content */}
                  {isRest ? (
                    <div className="exercise-print-card avoid-break p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-center space-y-1">
                      <h4 className="font-bold text-xs text-amber-950">
                        🧘 {t('workoutPlan.restDayMessage') || 'Active Recovery & Rest Day'}
                      </h4>
                      <p className="text-[11px] text-amber-900 leading-relaxed max-w-xl mx-auto">
                        {dayObj.recoveryNote || t('workoutPlan.restDayTip') || 'Hydrate, prioritize quality sleep, and perform gentle mobility or light walking to facilitate muscle recovery.'}
                      </p>
                    </div>
                  ) : (
                    /* Active Workout Exercises List - Single Column */
                    <div className="space-y-2.5">
                      {dayObj.exercises?.map((exercise, exIdx) => (
                        <div
                          key={`print-ex-${currentDayNum}-${exIdx}`}
                          className="exercise-print-card avoid-break p-3 rounded-lg border border-slate-200 bg-slate-50/80 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                {exIdx + 1}
                              </span>
                              <h4 className="font-bold text-xs text-slate-900 leading-tight">
                                {exercise.name}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                                {exercise.sets} {t('workoutPlan.setsLabel') || 'Sets'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold border border-teal-300">
                                {exercise.reps} {t('workoutPlan.repsLabel') || 'Reps'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                                ⏱️ {exercise.rest}
                              </span>
                            </div>
                          </div>

                          {(exercise.instructions || exercise.cues) && (
                            <div className="text-[10.5px] text-slate-700 leading-relaxed pl-7">
                              <span className="font-bold text-emerald-800">💡 {t('workoutPlan.cuesLabel') || 'Form & Cues'}:</span> {exercise.instructions || exercise.cues}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cool-down */}
                  {dayObj.cooldown && (
                    <div className="avoid-break p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-950">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-800 block mb-0.5">
                        ❄️ {t('workoutPlan.cooldownTitle') || 'Cool-down'}
                      </span>
                      <p className="leading-relaxed">{dayObj.cooldown}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. PHYSICAL SAFETY & DISCLAIMER ADVISORY */}
      {/* ========================================================================= */}
      <section className="mb-6 avoid-break">
        <div className="border border-amber-300 rounded-xl p-3.5 bg-amber-50/60 text-slate-800 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
            <span>🛡️</span>
            <h4>{t('workoutPlan.safetyTitle') || 'Physical Safety & Form Advisory'}</h4>
          </div>
          <p className="text-[10.5px] text-slate-700 leading-relaxed">
            {plan?.safety_caution || t('workoutPlan.safetyNotice') || 'This workout plan is for general fitness guidance and is not medical advice. If you experience sharp pain or dizziness, stop immediately. Consult a physician or physical therapist before starting any new exercise routine.'}
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRAINER SUPPORT & DESK CONTACT FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t-2 border-slate-200 pt-3 text-[10px] text-slate-600 flex items-center justify-between avoid-break">
        <div>
          <strong className="text-slate-800">{config.gymName}</strong> • {config.deskLocation || 'Gym Front Desk & Trainer Station'}
        </div>
        <div>
          <strong className="text-emerald-700">{config.phone}</strong> • {config.hours || 'Mon - Sat: 6:00 AM - 10:00 PM'}
        </div>
      </footer>
    </div>
  );
}
