import { useLanguage } from '../../context/LanguageContext';

export default function GroceryItem({ item, isChecked, onToggle }) {
  const { t } = useLanguage();

  if (!item) return null;

  return (
    <div
      onClick={() => onToggle(item.id)}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle(item.id);
        }
      }}
      className={`group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer min-h-[52px] select-none ${
        isChecked
          ? 'bg-slate-950/60 border-emerald-500/20 text-slate-500'
          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-emerald-500/40 text-slate-100 shadow-sm'
      }`}
    >
      {/* Left side: Touch-friendly Checkbox & Item Name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors border ${
            isChecked
              ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-xs'
              : 'border-slate-700 bg-slate-950 group-hover:border-emerald-500/60 text-transparent'
          }`}
        >
          ✓
        </div>

        <div className="min-w-0">
          <p
            className={`text-sm sm:text-base font-semibold leading-snug truncate ${
              isChecked ? 'line-through text-slate-500' : 'text-white group-hover:text-emerald-300'
            }`}
          >
            {item.name}
          </p>

          {item.daysCount > 1 && (
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
              {t('grocery.daysTag', { count: item.daysCount })}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Aggregated Quantity Pill */}
      <div className="shrink-0 text-right">
        <span
          className={`inline-block px-2.5 py-1 rounded-xl text-xs sm:text-sm font-bold tracking-tight border ${
            isChecked
              ? 'bg-slate-900/60 text-slate-500 border-slate-800 line-through'
              : 'bg-slate-950 border-slate-700 text-emerald-400 font-mono shadow-xs'
          }`}
        >
          {item.quantity}
        </span>
      </div>
    </div>
  );
}
