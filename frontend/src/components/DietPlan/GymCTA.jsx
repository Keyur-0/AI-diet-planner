import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { gymConfig as defaultGymConfig } from '../../config/gymConfig';
import Button from '../Button';

export default function GymCTA({ gymConfig = null }) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Central gym config with language-fallback defaults
  const config = gymConfig || defaultGymConfig;

  return (
    <>
      <section 
        aria-label="Gym Trainer Assistance"
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
      >
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>⚡ {config.gymName} Coach Support</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t('plan.gymCtaTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('plan.gymCtaDesc')}
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 shadow-lg shadow-emerald-500/20"
          >
            {t('plan.gymCtaBtn')} ➔
          </Button>
        </div>
      </section>

      {/* Gym Contact / Guidance Modal Dialog */}
      {isModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  {config.logo || '⚡'}
                </div>
                <h4 className="text-base font-bold text-white">
                  {t('plan.gymCtaModalTitle')}
                </h4>
              </div>
              <button
                type="button"
                aria-label="Close dialog"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t('plan.gymCtaModalDesc')}
            </p>

            {/* Gym Details Information Box */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">{t('plan.memberCardTitle')}:</span>
                <span className="text-white font-bold">{config.gymName}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 font-semibold">{t('plan.gymCtaModalDesk')}:</span>
                <span className="text-emerald-400 font-medium">{config.deskLocation}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 font-semibold">{t('plan.gymCtaModalHours')}:</span>
                <span className="text-slate-200">{config.hours}</span>
              </div>
              {config.phone && (
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400 font-semibold">Phone:</span>
                  <span className="text-slate-200">{config.phone}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsModalOpen(false)}
                className="w-full"
              >
                {t('plan.gymCtaModalClose')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
