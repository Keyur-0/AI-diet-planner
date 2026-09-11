import { useLanguage } from '../../context/LanguageContext';
import Button from '../Button';

export default function AdminLeadsTable({
  customers = [],
  total = 0,
  page = 1,
  totalPages = 1,
  onPageChange,
  onSelectCustomer,
  onOpenDietPlan,
  isLoading = false,
}) {
  const { t } = useLanguage();

  const getGoalBadge = (goal) => {
    const g = String(goal || '').toLowerCase();
    if (g.includes('loss') || g.includes('fat')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <span>🔥</span> {goal}
        </span>
      );
    }
    if (g.includes('muscle') || g.includes('gain')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          <span>💪</span> {goal}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/20">
        <span>⚖️</span> {goal || 'Maintain'}
      </span>
    );
  };

  const getDietBadge = (diet) => {
    const d = String(diet || '').toLowerCase();
    if (d.includes('veg') && !d.includes('non')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[11px] font-medium border border-emerald-800/60">
          🌱 {diet}
        </span>
      );
    }
    if (d.includes('non')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 text-[11px] font-medium border border-rose-800/60">
          🍗 {diet}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 text-[11px] font-medium border border-purple-800/60">
        🥑 {diet || 'Standard'}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-950/80 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center text-2xl mx-auto mb-4">
          🔍
        </div>
        <h4 className="text-base sm:text-lg font-bold text-white">
          {t('admin.noLeadsTitle')}
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          {t('admin.noLeadsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* DESKTOP TABLE VIEW (md and up) */}
      <div className="hidden md:block overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3.5 px-4 lg:px-6">{t('admin.tableHeaderName')}</th>
                <th className="py-3.5 px-3 lg:px-4">{t('admin.tableHeaderGoal')}</th>
                <th className="py-3.5 px-3 lg:px-4">{t('admin.tableHeaderDiet')}</th>
                <th className="py-3.5 px-3 lg:px-4">{t('admin.tableHeaderStats')}</th>
                <th className="py-3.5 px-3 lg:px-4">{t('admin.tableHeaderContact')}</th>
                <th className="py-3.5 px-3 lg:px-4 text-center">{t('admin.tableHeaderPlans')}</th>
                <th className="py-3.5 px-3 lg:px-4">{t('admin.tableHeaderDate')}</th>
                <th className="py-3.5 px-4 lg:px-6 text-right">{t('admin.tableHeaderActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-xs">
              {customers.map((c) => {
                const plansCount = parseInt(c.plansCount || c.plans_count || 0, 10);
                const notesCount = parseInt(c.notesCount || c.notes_count || 0, 10);

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectCustomer(c)}
                  >
                    {/* 1. Member Name & Tags */}
                    <td className="py-4 px-4 lg:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-emerald-300 transition-colors text-sm">
                              {c.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700/60">
                              {c.language?.toUpperCase() || 'EN'}
                            </span>
                          </div>
                          {notesCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                              <span>📝</span> {notesCount} {notesCount === 1 ? 'note' : 'notes'}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Goal */}
                    <td className="py-4 px-3 lg:px-4">
                      {getGoalBadge(c.goal)}
                    </td>

                    {/* 3. Diet */}
                    <td className="py-4 px-3 lg:px-4">
                      {getDietBadge(c.foodPreference)}
                    </td>

                    {/* 4. Body Stats */}
                    <td className="py-4 px-3 lg:px-4 text-slate-300">
                      <div>
                        <span className="font-medium text-white">{c.weight} kg</span> • {c.height} cm
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.gender}, {c.age} yrs
                      </div>
                    </td>

                    {/* 5. Contact */}
                    <td className="py-4 px-3 lg:px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <a
                          href={`tel:${c.phone}`}
                          className="text-slate-300 hover:text-emerald-400 font-medium block truncate max-w-[140px] transition-colors"
                          title={c.phone}
                        >
                          📞 {c.phone}
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-slate-400 hover:text-emerald-400 text-[11px] block truncate max-w-[140px] transition-colors"
                          title={c.email}
                        >
                          ✉️ {c.email}
                        </a>
                      </div>
                    </td>

                    {/* 6. Plans Count */}
                    <td className="py-4 px-3 lg:px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          plansCount > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {plansCount}
                      </span>
                    </td>

                    {/* 7. Date */}
                    <td className="py-4 px-3 lg:px-4 text-slate-400 text-[11px]">
                      {formatDate(c.createdAt || c.created_at)}
                    </td>

                    {/* 8. Actions */}
                    <td className="py-4 px-4 lg:px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(c)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          {t('admin.btnViewDetails')}
                        </button>
                        {plansCount > 0 && onOpenDietPlan && (
                          <button
                            type="button"
                            onClick={() => onOpenDietPlan(c)}
                            title={t('admin.btnOpenPlanTooltip')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                          >
                            ⚡
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (under md) */}
      <div className="md:hidden space-y-3">
        {customers.map((c) => {
          const plansCount = parseInt(c.plansCount || c.plans_count || 0, 10);
          const notesCount = parseInt(c.notesCount || c.notes_count || 0, 10);

          return (
            <div
              key={c.id}
              className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3 text-left"
              onClick={() => onSelectCustomer(c)}
            >
              {/* Header: Name, Lang & Goal */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm">
                        {c.name}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700">
                        {c.language?.toUpperCase() || 'EN'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(c.createdAt || c.created_at)}
                    </p>
                  </div>
                </div>

                {getGoalBadge(c.goal)}
              </div>

              {/* Stats & Diet row */}
              <div className="grid grid-cols-2 gap-2 text-xs p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Body Stats</span>
                  <span className="text-slate-200 font-medium">
                    {c.weight}kg • {c.height}cm
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Diet Style</span>
                  <span className="text-emerald-400 font-medium truncate block">
                    {c.foodPreference}
                  </span>
                </div>
              </div>

              {/* Contact Links */}
              <div
                className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 text-emerald-400 font-bold hover:bg-slate-700 min-h-[44px] flex items-center gap-1.5 transition-colors"
                >
                  <span>📞</span>
                  <span>{c.phone}</span>
                </a>
                <a
                  href={`mailto:${c.email}`}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 text-slate-300 font-medium hover:bg-slate-700 min-h-[44px] flex items-center gap-1.5 transition-colors truncate max-w-[160px]"
                >
                  <span>✉️</span>
                  <span className="truncate">{c.email}</span>
                </a>
              </div>

              {/* Bottom Action Row */}
              <div
                className="flex items-center justify-between gap-2 pt-2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-bold">
                    {plansCount} {t('admin.tabDietPlans')?.toLowerCase()}
                  </span>
                  {notesCount > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-bold border border-amber-500/20">
                      📝 {notesCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(c)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs min-h-[44px] flex items-center justify-center hover:bg-emerald-400 transition-colors cursor-pointer shadow-md"
                  >
                    {t('admin.btnViewDetails')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-center sm:text-left">
            <span>
              {t('admin.paginationPage')
                ?.replace('{page}', String(page))
                ?.replace('{totalPages}', String(totalPages))}
            </span>
            <span className="mx-2 text-slate-600">•</span>
            <span>
              {t('admin.paginationTotal')?.replace('{total}', String(total))}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="min-h-[40px] px-3.5"
            >
              ← {t('admin.btnPrev')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="min-h-[40px] px-3.5"
            >
              {t('admin.btnNext')} →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
