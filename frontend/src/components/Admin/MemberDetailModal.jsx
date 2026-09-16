import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import TrainerNotes from './TrainerNotes';
import Button from '../Button';

export default function MemberDetailModal({
  customer,
  dietPlans = [],
  workoutPlans = [],
  notes = [],
  token,
  onClose,
  onOpenDietPlan,
  onOpenWorkoutPlan,
  onNoteAdded,
  onNoteDeleted,
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'plans' | 'workoutPlans' | 'notes'

  if (!customer) return null;

  const latestPlan = dietPlans && dietPlans.length > 0 ? dietPlans[0] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-lg">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                  {customer.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                  {customer.language?.toUpperCase() || 'EN'}
                </span>
              </div>
              <p className="text-xs text-emerald-400 mt-0.5">
                {customer.goal} • {customer.weight} kg
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('admin.btnClose')}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-800 flex flex-wrap gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('admin.tabOverview')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('admin.tabDietPlans')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {dietPlans.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workoutPlans')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'workoutPlans'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('admin.tabWorkoutPlans')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {workoutPlans.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{t('admin.tabNotes')}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
              {notes.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* TAB 1: OVERVIEW & NUTRITION */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Profile Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('plan.memberCardTitle')}</span>
                  <span className="font-bold text-white block mt-0.5">{customer.gender}, {customer.age} yrs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('plan.bodyStatsTitle')}</span>
                  <span className="font-bold text-white block mt-0.5">{customer.height} cm • {customer.weight} kg</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">{t('plan.dietTypeTitle')}</span>
                  <span className="font-bold text-emerald-400 block mt-0.5 truncate">{customer.foodPreference}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Activity</span>
                  <span className="font-bold text-slate-200 block mt-0.5 truncate">{customer.activityLevel}</span>
                </div>
              </div>

              {/* Preferences & Contact Details */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 font-semibold">{t('plan.allergiesPrefix')}</span>
                  <span className="text-white font-medium text-right">{customer.allergies || 'None'}</span>
                </div>
                <div className="flex justify-between gap-2 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400 font-semibold">{t('plan.foodsUsuallyEaten')}</span>
                  <span className="text-white font-medium text-right truncate max-w-[280px]">{customer.favoriteFoods || 'None'}</span>
                </div>
                <div className="flex justify-between items-center gap-2 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400 font-semibold">Phone:</span>
                  <a href={`tel:${customer.phone}`} className="text-emerald-400 font-bold hover:underline">
                    {customer.phone}
                  </a>
                </div>
                <div className="flex justify-between items-center gap-2 border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400 font-semibold">Email:</span>
                  <a href={`mailto:${customer.email}`} className="text-emerald-400 font-bold hover:underline">
                    {customer.email}
                  </a>
                </div>
              </div>

              {/* Authoritative Nutrition Targets */}
              {latestPlan && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      🔥 {t('admin.nutritionBlueprintTitle')}
                    </span>
                    <span className="text-[11px] font-bold text-white bg-emerald-500/20 px-2 py-0.5 rounded-full">
                      {latestPlan.targetCalories} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('plan.proteinLabel')}</span>
                      <span className="text-base font-black text-emerald-400">{latestPlan.proteinG}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('plan.carbsLabel')}</span>
                      <span className="text-base font-black text-amber-400">{latestPlan.carbsG}g</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">{t('plan.fatLabel')}</span>
                      <span className="text-base font-black text-sky-400">{latestPlan.fatG}g</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span><strong>BMR:</strong> {latestPlan.bmr} kcal</span>
                    <span><strong>TDEE:</strong> {latestPlan.tdee} kcal</span>
                  </div>

                  {latestPlan.planData && (
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onOpenDietPlan(latestPlan, customer)}
                        className="w-full justify-center gap-2 font-bold"
                      >
                        <span>⚡</span>
                        <span>{t('admin.btnOpenPlan')}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED DIET PLANS HISTORY */}
          {activeTab === 'plans' && (
            <div className="space-y-3">
              {dietPlans.length > 0 ? (
                dietPlans.map((dp, idx) => {
                  const pDate = new Date(dp.createdAt || dp.created_at).toLocaleString();
                  const hasSchedule = Boolean(dp.planData && dp.planData.days);

                  return (
                    <div
                      key={dp.id || idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {t('admin.planItemTitle')} #{dietPlans.length - idx}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pDate}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold text-xs">
                          {dp.targetCalories} kcal
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-1.5 rounded-lg bg-slate-900 text-slate-300">
                          P: <strong className="text-emerald-400">{dp.proteinG}g</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900 text-slate-300">
                          C: <strong className="text-amber-400">{dp.carbsG}g</strong>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-900 text-slate-300">
                          F: <strong className="text-sky-400">{dp.fatG}g</strong>
                        </div>
                      </div>

                      {hasSchedule && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onOpenDietPlan(dp, customer)}
                            className="w-full justify-center gap-1.5"
                          >
                            <span>⚡</span>
                            <span>{t('admin.btnOpenPlan')}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {t('admin.noSavedPlans')}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED WORKOUT PLANS HISTORY */}
          {activeTab === 'workoutPlans' && (
            <div className="space-y-3">
              {workoutPlans.length > 0 ? (
                workoutPlans.map((wp, idx) => {
                  const pDate = new Date(wp.createdAt || wp.created_at).toLocaleString();
                  const hasSchedule = Boolean(wp.planData && wp.planData.days);

                  return (
                    <div
                      key={wp.id || idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {t('admin.workoutPlanItemTitle') || '7-Day Workout Plan'} #{workoutPlans.length - idx}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{pDate}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-extrabold text-xs">
                          {wp.fitnessGoal || wp.fitness_goal || customer.goal}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{t('workoutPlan.experience') || 'Experience'}</span>
                          <span className="font-semibold text-slate-200 capitalize">{wp.experienceLevel || wp.experience_level || 'N/A'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{t('workoutPlan.location') || 'Location'}</span>
                          <span className="font-semibold text-slate-200 capitalize">{wp.workoutLocation || wp.workout_location || 'Gym'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{t('workoutPlan.frequency') || 'Frequency'}</span>
                          <span className="font-semibold text-emerald-400">{wp.daysPerWeek || wp.days_per_week || 4} days/wk</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{t('workoutPlan.duration') || 'Duration'}</span>
                          <span className="font-semibold text-amber-400">{wp.durationMins || wp.duration_mins || 45} mins</span>
                        </div>
                      </div>

                      {(wp.equipment || wp.injuries) && (
                        <div className="text-[11px] text-slate-400 space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                          {wp.equipment && (
                            <div>
                              <strong className="text-slate-300">Equipment:</strong> {wp.equipment}
                            </div>
                          )}
                          {wp.injuries && (
                            <div>
                              <strong className="text-rose-400">Injuries / Limitations:</strong> {wp.injuries}
                            </div>
                          )}
                        </div>
                      )}

                      {hasSchedule && onOpenWorkoutPlan && (
                        <div className="pt-1">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => onOpenWorkoutPlan(wp, customer)}
                            className="w-full justify-center gap-1.5"
                          >
                            <span>⚡</span>
                            <span>{t('admin.btnOpenWorkoutPlan') || 'Open Full Workout Plan'}</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  {t('admin.noSavedPlans') || 'No saved plans'}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRAINER COACHING NOTES */}
          {activeTab === 'notes' && (
            <TrainerNotes
              customerId={customer.id}
              notes={notes}
              token={token}
              onNoteAdded={onNoteAdded}
              onNoteDeleted={onNoteDeleted}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            {t('admin.btnClose')}
          </Button>
        </div>
      </div>
    </div>
  );
}
