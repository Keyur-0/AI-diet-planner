import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { gymConfig } from '../../config/gymConfig';
import { generateGroceryList, getTotalGroceryCount } from '../../utils/groceryUtils';
import Button from '../Button';
import GroceryCategory from './GroceryCategory';
import PrintGroceryView from './PrintGroceryView';

export default function GroceryList({ customerData, onBackToPlan }) {
  const { t } = useLanguage();
  const [checkedSet, setCheckedSet] = useState(new Set());
  const [printError, setPrintError] = useState(null);

  // Derive consolidated grocery list dynamically from customer's 7-day plan
  const categorizedList = useMemo(() => {
    return generateGroceryList(customerData?.plan);
  }, [customerData?.plan]);

  const totalItems = useMemo(() => {
    return getTotalGroceryCount(categorizedList);
  }, [categorizedList]);

  const checkedCount = checkedSet.size;
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  const isAllComplete = totalItems > 0 && checkedCount === totalItems;

  const handleToggleItem = (itemId) => {
    setCheckedSet((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleUncheckAll = () => {
    setCheckedSet(new Set());
  };

  const handlePrint = () => {
    try {
      setPrintError(null);
      window.print();
    } catch (err) {
      console.error('Grocery print error:', err);
      setPrintError(t('plan.downloadError'));
    }
  };

  return (
    <>
      {/* 1. DEDICATED PRINT-ONLY GROCERY VIEW */}
      <PrintGroceryView
        customerData={customerData}
        categorizedList={categorizedList}
        gymConfig={gymConfig}
      />

      {/* 2. INTERACTIVE SCREEN GROCERY VIEW */}
      <div className="screen-grocery-view print:hidden max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 space-y-6 animate-fadeIn">
        {/* TOP NAVIGATION & ACTION BAR */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToPlan}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label={t('grocery.backToPlan')}
            >
              <span>{t('grocery.backToPlan')}</span>
            </button>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {t('grocery.title')}
              </h2>
              <p className="text-xs text-emerald-400 mt-0.5">
                {customerData?.name ? `${customerData.name} • ` : ''}{t('grocery.daysTag', { count: 7 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              className="flex-1 sm:flex-none justify-center gap-2 shadow-md shadow-emerald-500/20"
              aria-label={t('grocery.printList')}
              title={t('grocery.printListTooltip')}
            >
              <span aria-hidden="true">🖨️</span>
              <span>{t('grocery.printList')}</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {printError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
            <span>⚠️ {printError}</span>
            <button
              type="button"
              onClick={() => setPrintError(null)}
              className="text-amber-400 hover:text-white font-bold text-sm px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* STICKY / PROMINENT SHOPPING PROGRESS CARD */}
        <div className="sticky top-18 z-40 p-4 sm:p-5 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="text-lg" aria-hidden="true">🛒</span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {t('grocery.progressTitle')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('grocery.progressStats', {
                    checked: checkedCount,
                    total: totalItems,
                    pct: progressPct,
                  })}
                </p>
              </div>
            </div>

            {checkedCount > 0 && (
              <button
                type="button"
                onClick={handleUncheckAll}
                className="text-xs text-slate-400 hover:text-amber-400 underline font-semibold transition-colors cursor-pointer self-start sm:self-auto"
              >
                {t('grocery.uncheckAll')}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isAllComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {isAllComplete && (
            <p className="text-xs font-bold text-emerald-400 animate-fadeIn pt-0.5">
              {t('grocery.allItemsPurchased')}
            </p>
          )}
        </div>

        {/* CATEGORIES BREAKDOWN */}
        {totalItems > 0 ? (
          <div className="space-y-6">
            {categorizedList.map((category) => (
              <GroceryCategory
                key={category.id}
                category={category}
                checkedSet={checkedSet}
                onToggleItem={handleToggleItem}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
            <p className="text-slate-400 text-sm">{t('grocery.noItems')}</p>
            <Button variant="secondary" onClick={onBackToPlan}>
              {t('grocery.backToPlan')}
            </Button>
          </div>
        )}

        {/* BOTTOM RETURN ACTION */}
        <div className="text-center pt-4">
          <Button
            size="lg"
            variant="secondary"
            onClick={onBackToPlan}
            className="w-full sm:w-auto px-8 py-3.5"
          >
            {t('grocery.backToPlan')}
          </Button>
        </div>
      </div>
    </>
  );
}
