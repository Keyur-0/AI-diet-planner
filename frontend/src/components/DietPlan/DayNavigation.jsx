import { useLanguage } from '../../context/LanguageContext';

export default function DayNavigation({
  days = [],
  activeDayIndex = 0,
  onSelectDay,
  viewMode = 'daily',
  onToggleViewMode,
}) {
  const { t } = useLanguage();

  const defaultDayNames = t('plan.daysList') || [
    'Monday (Day 1)',
    'Tuesday (Day 2)',
    'Wednesday (Day 3)',
    'Thursday (Day 4)',
    'Friday (Day 5)',
    'Saturday (Day 6)',
    'Sunday (Day 7)',
  ];

  return (
    <div className="space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {t('plan.scheduleTitle')}
          </h3>
        </div>

        {/* View Mode Switcher */}
        <div 
          role="radiogroup" 
          aria-label="View Mode" 
          className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 self-start sm:self-auto shrink-0 shadow-inner"
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'daily'}
            onClick={() => onToggleViewMode('daily')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('plan.dayView')}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'full'}
            onClick={() => onToggleViewMode('full')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
              viewMode === 'full'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{t('plan.fullWeek')}</span>
          </button>
        </div>
      </div>

      {/* 7-Day Horizontal Navigation Tabs (Only in Daily View) */}
      {viewMode === 'daily' && (
        <nav 
          aria-label="7-Day Schedule Navigation"
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent snap-x"
        >
          {days.map((dayItem, index) => {
            const isActive = activeDayIndex === index;
            const dayNum = dayItem.day || index + 1;
            const fallbackName = defaultDayNames[index] || `${t('plan.dayPrefix')} ${dayNum}`;
            const label = dayItem.day_name || fallbackName;

            return (
              <button
                key={dayNum}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectDay(index)}
                className={`min-h-[44px] px-4 py-2.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all cursor-pointer snap-start flex items-center gap-2 select-none ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30 font-extrabold scale-[1.02]'
                    : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {dayNum}
                </span>
                <span>{t('plan.dayPrefix')} {dayNum}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
