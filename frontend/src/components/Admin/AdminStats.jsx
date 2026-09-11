import { useLanguage } from '../../context/LanguageContext';

export default function AdminStats({ stats, isLoading }) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-900/80 border border-slate-800" />
        ))}
      </div>
    );
  }

  const s = stats || {
    totalLeads: 0,
    todayLeads: 0,
    weekLeads: 0,
    totalPlans: 0,
    goals: { weightLoss: 0, muscleGain: 0, maintain: 0 },
    languages: { en: 0, hi: 0, gu: 0 },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Total Leads */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex flex-col justify-between shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
            {t('admin.statsTotalLeads')}
          </span>
          <span className="text-base" aria-hidden="true">👥</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-4xl font-black text-white">
            {s.totalLeads}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            {s.totalPlans} {t('admin.statsPlansGenerated')?.toLowerCase()}
          </span>
        </div>
      </div>

      {/* 2. Today's Leads */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            {t('admin.statsTodayLeads')}
          </span>
          <span className="text-base" aria-hidden="true">⚡</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-4xl font-black text-emerald-400">
            {s.todayLeads}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {t('admin.tagToday')}
          </span>
        </div>
      </div>

      {/* 3. This Week's Leads */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            {t('admin.statsWeekLeads')}
          </span>
          <span className="text-base" aria-hidden="true">📅</span>
        </div>
        <div className="mt-2">
          <span className="text-2xl sm:text-4xl font-black text-white">
            {s.weekLeads}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {t('admin.dateThisWeek')}
          </span>
        </div>
      </div>

      {/* 4. Goal Distribution Split */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            {t('admin.statsGoalsSplit')}
          </span>
          <span className="text-base" aria-hidden="true">🎯</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-xs">
          <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-emerald-400 font-bold block">{s.goals?.weightLoss || 0}</span>
            <span className="text-[9px] text-slate-400">{t('admin.statsGoalLoss')}</span>
          </div>
          <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-amber-400 font-bold block">{s.goals?.muscleGain || 0}</span>
            <span className="text-[9px] text-slate-400">{t('admin.statsGoalGain')}</span>
          </div>
          <div className="p-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-sky-400 font-bold block">{s.goals?.maintain || 0}</span>
            <span className="text-[9px] text-slate-400">{t('admin.statsGoalMaintain')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
