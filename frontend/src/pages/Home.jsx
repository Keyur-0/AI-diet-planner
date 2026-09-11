import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';

export default function Home({ onStartForm }) {
  const { t } = useLanguage();

  const benefits = [
    {
      icon: '🎯',
      title: t('home.benefit1Title'),
      description: t('home.benefit1Desc'),
    },
    {
      icon: '🥗',
      title: t('home.benefit2Title'),
      description: t('home.benefit2Desc'),
    },
    {
      icon: '🛡️',
      title: t('home.benefit3Title'),
      description: t('home.benefit3Desc'),
    },
    {
      icon: '⚡',
      title: t('home.benefit4Title'),
      description: t('home.benefit4Desc'),
    },
  ];

  return (
    <div className="space-y-20 py-6 sm:py-12">
      {/* HERO SECTION */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        {/* Glow backdrop effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('home.heroBadge')}
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
          {t('home.heroTitlePart1')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            {t('home.heroTitleHighlight')}
          </span>{' '}
          {t('home.heroTitlePart2')}
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('home.heroSubtitle')}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={onStartForm}
            className="w-full sm:w-auto text-base font-extrabold px-8 py-4 uppercase tracking-wider"
          >
            {t('home.ctaButton')}
          </Button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto text-sm font-semibold text-slate-400 hover:text-white px-6 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors text-center"
          >
            {t('home.howItWorks')}
          </a>
        </div>

        {/* Quick Highlights */}
        <div className="pt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-800/80 max-w-2xl mx-auto text-center">
          <div>
            <p className="text-xl sm:text-2xl font-black text-white">{t('home.stat1Num')}</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">{t('home.stat1Label')}</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">{t('home.stat2Num')}</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">{t('home.stat2Label')}</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-white">{t('home.stat3Num')}</p>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">{t('home.stat3Label')}</p>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION GRID */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('home.sectionTitle')}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {t('home.sectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-0.5 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 p-8 sm:p-12 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('home.bottomCtaTitle')}
            </h3>
            <p className="text-sm text-slate-300">
              {t('home.bottomCtaDesc')}
            </p>
          </div>

          <Button
            size="lg"
            onClick={onStartForm}
            className="w-full sm:w-auto font-black px-8 py-4 whitespace-nowrap uppercase tracking-wider"
          >
            {t('home.bottomCtaBtn')}
          </Button>
        </div>
      </section>
    </div>
  );
}
