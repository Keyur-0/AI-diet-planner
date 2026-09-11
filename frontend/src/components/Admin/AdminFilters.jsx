import { useLanguage } from '../../context/LanguageContext';

export default function AdminFilters({ filters, onFilterChange, onResetFilters }) {
  const { t } = useLanguage();

  const isFiltered = Boolean(
    filters.search ||
    filters.goal !== 'all' ||
    filters.diet !== 'all' ||
    filters.language !== 'all' ||
    filters.dateRange !== 'all'
  );

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-md">
      {/* 1. Search Input */}
      <div className="relative">
        <input
          type="text"
          id="admin-search-input"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder={t('admin.searchPlaceholder')}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
        <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" aria-hidden="true">
          🔍
        </div>
        {filters.search && (
          <button
            type="button"
            onClick={() => onFilterChange('search', '')}
            className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white text-xs font-bold px-1 py-0.5"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Filter Dropdowns Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Goal Filter */}
        <div>
          <select
            id="admin-filter-goal"
            value={filters.goal}
            onChange={(e) => onFilterChange('goal', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
          >
            <option value="all">{t('admin.filterAllGoals')}</option>
            <option value="loss">{t('form.goalOptions.weightLoss')}</option>
            <option value="muscle">{t('form.goalOptions.muscleGain')}</option>
            <option value="maintain">{t('form.goalOptions.maintain')}</option>
          </select>
        </div>

        {/* Diet Preference Filter */}
        <div>
          <select
            id="admin-filter-diet"
            value={filters.diet}
            onChange={(e) => onFilterChange('diet', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
          >
            <option value="all">{t('admin.filterAllDiets')}</option>
            <option value="vegetarian">{t('form.dietOptions.vegetarian')}</option>
            <option value="non-vegetarian">{t('form.dietOptions.nonVegetarian')}</option>
            <option value="vegan">{t('form.dietOptions.vegan')}</option>
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <select
            id="admin-filter-lang"
            value={filters.language}
            onChange={(e) => onFilterChange('language', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
          >
            <option value="all">{t('admin.filterAllLanguages')}</option>
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (HI)</option>
            <option value="gu">ગુજરાતી (GU)</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <select
            id="admin-filter-date"
            value={filters.dateRange}
            onChange={(e) => onFilterChange('dateRange', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
          >
            <option value="all">{t('admin.filterAllDates')}</option>
            <option value="today">{t('admin.dateToday')}</option>
            <option value="week">{t('admin.dateThisWeek')}</option>
            <option value="month">{t('admin.dateThisMonth')}</option>
          </select>
        </div>
      </div>

      {/* Reset Filters Option */}
      {isFiltered && (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>↺</span>
            <span>{t('admin.resetFilters')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
