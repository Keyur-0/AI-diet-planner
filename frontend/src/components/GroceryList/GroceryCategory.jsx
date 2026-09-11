import { useLanguage } from '../../context/LanguageContext';
import GroceryItem from './GroceryItem';

export default function GroceryCategory({ category, checkedSet, onToggleItem }) {
  const { t } = useLanguage();

  if (!category || !Array.isArray(category.items) || category.items.length === 0) {
    return null;
  }

  const categoryTitle = t(category.translationKey) || category.id;
  const totalInCat = category.items.length;
  const checkedInCat = category.items.filter(item => checkedSet.has(item.id)).length;
  const isAllChecked = totalInCat > 0 && checkedInCat === totalInCat;

  return (
    <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6 space-y-4 shadow-lg">
      {/* Category Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl" aria-hidden="true">
            {category.icon}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {categoryTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              isAllChecked
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {checkedInCat > 0 ? `${checkedInCat}/${totalInCat}` : `${totalInCat}`}
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {category.items.map((item) => (
          <GroceryItem
            key={item.id}
            item={item}
            isChecked={checkedSet.has(item.id)}
            onToggle={onToggleItem}
          />
        ))}
      </div>
    </div>
  );
}
