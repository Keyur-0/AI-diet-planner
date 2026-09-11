import { useLanguage } from '../../context/LanguageContext';
import { gymConfig as defaultGymConfig } from '../../config/gymConfig';

export default function PrintGroceryView({
  customerData,
  categorizedList,
  gymConfig = defaultGymConfig,
}) {
  const { t } = useLanguage();

  if (!customerData || !categorizedList) return null;

  const config = gymConfig || defaultGymConfig;
  const formattedDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const activeCategories = categorizedList.filter(
    (cat) => Array.isArray(cat.items) && cat.items.length > 0
  );

  return (
    <div id="grocery-print-view" className="print-plan-container hidden print:block text-slate-900 bg-white font-sans text-xs leading-normal">
      {/* 1. DOCUMENT HEADER */}
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
                {t('grocery.pdfOfficialHeader')}
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">{config.phone}</p>
            <p>{config.email}</p>
            <p>{config.website}</p>
            <p className="text-slate-500 pt-1">
              <span className="font-semibold">{t('plan.pdfGeneratedOn')}:</span> {formattedDate}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 uppercase tracking-wide">
            {t('grocery.title')}
          </div>
          <div className="text-[11px] text-slate-700">
            {t('plan.tailoredFor')} <strong className="text-emerald-700 font-black">{customerData.name}</strong> • {t('plan.goalCardTitle')}: <strong className="text-slate-900">{customerData.goal}</strong>
          </div>
        </div>
      </header>

      {/* 2. CATEGORIZED GROCERY ITEMS GRID */}
      <section className="mb-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {activeCategories.map((category) => {
            const categoryTitle = t(category.translationKey) || category.id;

            return (
              <div
                key={`print-cat-${category.id}`}
                className="border border-slate-300 rounded-xl overflow-hidden bg-white avoid-break shadow-none"
              >
                {/* Category Header */}
                <div className="bg-slate-800 text-white px-3.5 py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{category.icon}</span>
                    <span className="uppercase tracking-wide">{categoryTitle}</span>
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold">
                    {category.items.length} items
                  </span>
                </div>

                {/* Items Checklist */}
                <ul className="p-3 space-y-1.5 text-[10px] text-slate-800 divide-y divide-slate-100">
                  {category.items.map((item) => (
                    <li
                      key={`print-item-${item.id}`}
                      className="flex items-center justify-between pt-1.5 first:pt-0 gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-sm leading-none">☐</span>
                        <span className="font-semibold text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-bold text-emerald-800 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. GYM FOOTER & DISCLAIMER */}
      <footer className="border-t border-slate-300 pt-3 text-[9px] text-slate-500 leading-tight space-y-1 avoid-break">
        <p className="font-bold text-slate-700">
          ⚡ {config.gymName} • {config.deskLocation} • {config.hours}
        </p>
        <p>
          ⚠️ {t('plan.planDisclaimerTitle')}: {t('plan.planDisclaimerText')}
        </p>
        <p className="pt-1 text-slate-400">
          © {new Date().getFullYear()} {config.gymName}. {t('footer.copyright')}
        </p>
      </footer>
    </div>
  );
}
