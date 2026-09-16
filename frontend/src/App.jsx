import { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DietPlan from './pages/DietPlan';
import DietForm from './components/DietForm';
import WorkoutPlan from './pages/WorkoutPlan';
import WorkoutForm from './components/WorkoutForm';
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

  const [activeTab, setActiveTab] = useState('diet'); // 'diet' | 'workout'
  const [currentPage, setCurrentPage] = useState('form'); // 'form' | 'diet_plan' | 'workout_plan'
  const [dietPlanData, setDietPlanData] = useState(null);
  const [workoutPlanData, setWorkoutPlanData] = useState(null);
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

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setServerError(null);
    setCurrentPage('form');
  };

  const handleDietFormSubmit = async (formData) => {
    setIsLoading(true);
    setServerError(null);

    try {
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

      setDietPlanData({
        ...data.customer,
        nutrition: data.nutrition,
        plan: data.plan,
        aiStatus: data.aiStatus,
        aiNotice: data.aiNotice,
        planId: data.dietPlan?.id,
        planLanguage: data.language || language,
      });
      setCurrentPage('diet_plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Diet API Error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setServerError(t('common.serverErrorDefault'));
      } else {
        setServerError(err.message || t('common.somethingWentWrong'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutFormSubmit = async (formData) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const payload = {
        ...formData,
        language,
      };

      const response = await fetch(`${BACKEND_URL}/api/generate-workout`, {
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

      setWorkoutPlanData({
        ...data.customer,
        ...data.workout,
        plan: data.plan,
        aiStatus: data.aiStatus,
        aiNotice: data.aiNotice,
        workoutPlanId: data.workoutPlan?.id,
        planLanguage: data.language || language,
      });
      setCurrentPage('workout_plan');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Workout API Error:', err);
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

  const isPlanView = currentPage === 'diet_plan' || currentPage === 'workout_plan';

  // 2. Standard Member Flow
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Gym Top Navigation */}
      <Navbar
        onReset={handleReset}
        isPlanView={isPlanView}
        isAdminView={false}
        onNavigateAdmin={() => navigateTo('admin')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-10 space-y-8">
        {isLoading ? (
          <LoadingScreen />
        ) : currentPage === 'form' ? (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Top Tab Switcher: [ Diet Plan ] [ Workout Plan ] */}
            <div className="flex items-center justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('diet')}
                  className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === 'diet'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🥗</span>
                  <span>{t('tabs.dietTab') || 'Diet Plan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('workout')}
                  className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    activeTab === 'workout'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🏋️</span>
                  <span>{t('tabs.workoutTab') || 'Workout Plan'}</span>
                </button>
              </div>
            </div>

            {/* Diet Plan Intake View */}
            {activeTab === 'diet' ? (
              <div className="space-y-8">
                {/* Diet Hero Header */}
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

                <DietForm
                  onSubmit={handleDietFormSubmit}
                  isLoading={isLoading}
                  serverError={serverError}
                />
              </div>
            ) : (
              /* Workout Plan Intake View */
              <div className="space-y-8">
                {/* Workout Hero Header */}
                <section className="text-center space-y-4 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {t('workoutHero.badge')}
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    {t('workoutHero.titlePart1')}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                      {t('workoutHero.titleHighlight')}
                    </span>{' '}
                    {t('workoutHero.titlePart2') && <span>{t('workoutHero.titlePart2')}</span>}
                  </h1>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
                    {t('workoutHero.subtitle')}
                  </p>

                  <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                    <span className="text-emerald-400 font-semibold">{t('workoutHero.chipTime')}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{t('workoutHero.chipSplit')}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{t('workoutHero.chipSafety')}</span>
                  </div>
                </section>

                <WorkoutForm
                  onSubmit={handleWorkoutFormSubmit}
                  isLoading={isLoading}
                  serverError={serverError}
                />
              </div>
            )}
          </div>
        ) : currentPage === 'diet_plan' ? (
          <DietPlan
            customerData={dietPlanData}
            onReset={handleReset}
          />
        ) : (
          <WorkoutPlan
            customerData={workoutPlanData}
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

