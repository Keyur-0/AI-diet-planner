import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DietPlan from './pages/DietPlan';
import DietForm from './components/DietForm';
import LoadingScreen from './components/LoadingScreen';
import AdminPortal from './pages/AdminPortal';

const BACKEND_URL = 'http://localhost:5000';

function AppContent() {
  const { language, t } = useLanguage();
  const [route, setRoute] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin') {
        return 'admin';
      }
    }
    return 'member';
  });

  const [currentPage, setCurrentPage] = useState('form'); // 'form' | 'plan'
  const [dietPlanData, setDietPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Sync route with browser history
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.startsWith('/admin') || hash === '#admin') {
        setRoute('admin');
      } else {
        setRoute('member');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (newRoute) => {
    setRoute(newRoute);
    if (newRoute === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      // Send the active language code along with form intake data
      const payload = {
        ...formData,
        language,
      };

      const response = await fetch(`${BACKEND_URL}/api/generate-diet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('common.somethingWentWrong'));
      }

      // Successful response from backend
      setDietPlanData({
        ...data.customer,
        nutrition: data.nutrition,
        plan: data.plan,
        aiStatus: data.aiStatus,
        aiNotice: data.aiNotice,
        planId: data.dietPlan?.id,
        planLanguage: data.language || language,
      });
      setCurrentPage('plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('API Error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setServerError(t('common.serverErrorDefault'));
      } else {
        setServerError(err.message || t('common.somethingWentWrong'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDietPlanData(null);
    setServerError(null);
    setCurrentPage('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. If viewing the Admin Portal
  if (route === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <Navbar
          onReset={() => navigateTo('member')}
          isPlanView={false}
          isAdminView={true}
          onNavigateAdmin={() => navigateTo('admin')}
        />
        <main className="flex-1 w-full">
          <AdminPortal onNavigateHome={() => navigateTo('member')} />
        </main>
        <Footer onNavigateAdmin={() => navigateTo('admin')} />
      </div>
    );
  }

  // 2. Standard Member Flow
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Gym Top Navigation */}
      <Navbar
        onReset={handleReset}
        isPlanView={currentPage === 'plan'}
        isAdminView={false}
        onNavigateAdmin={() => navigateTo('admin')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-10 space-y-8">
        {isLoading ? (
          <LoadingScreen />
        ) : currentPage === 'form' ? (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Short Introduction / Header Section */}
            <section className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('hero.badge')}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {t('hero.titlePart1')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {t('hero.titleHighlight')}
                </span>{' '}
                {t('hero.titlePart2') && <span>{t('hero.titlePart2')}</span>}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                {t('hero.subtitle')}
              </p>

              <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">{t('hero.chipTime')}</span>
                <span className="hidden sm:inline">•</span>
                <span>{t('hero.chipMacros')}</span>
                <span className="hidden sm:inline">•</span>
                <span>{t('hero.chipSafety')}</span>
              </div>
            </section>

            {/* Diet Form */}
            <DietForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              serverError={serverError}
            />
          </div>
        ) : (
          <DietPlan
            customerData={dietPlanData}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Gym Footer & Safety Disclaimer */}
      <Footer onNavigateAdmin={() => navigateTo('admin')} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
