import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import AdminLogin from '../components/Admin/AdminLogin';
import AdminStats from '../components/Admin/AdminStats';
import AdminFilters from '../components/Admin/AdminFilters';
import AdminLeadsTable from '../components/Admin/AdminLeadsTable';
import MemberDetailModal from '../components/Admin/MemberDetailModal';
import DietPlan from './DietPlan';
import Button from '../components/Button';

const BACKEND_URL = 'http://localhost:5000';

export default function AdminPortal({ onNavigateHome }) {
  const { t } = useLanguage();

  // Authentication state
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem('pulsefit_admin_token') || localStorage.getItem('pulsefit_admin_token') || null;
  });

  // Analytics Stats state
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Filter & Pagination state
  const [filters, setFilters] = useState({
    search: '',
    goal: 'all',
    diet: 'all',
    language: 'all',
    dateRange: 'all',
    page: 1,
  });

  // Leads list state
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPlans, setCustomerPlans] = useState([]);
  const [customerNotes, setCustomerNotes] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Full Diet Plan preview mode
  const [viewingPlanData, setViewingPlanData] = useState(null);

  // Handle Unauthorized / Session Expiry
  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem('pulsefit_admin_token');
    localStorage.removeItem('pulsefit_admin_token');
    setAdminToken(null);
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (token) => {
    sessionStorage.setItem('pulsefit_admin_token', token);
    localStorage.setItem('pulsefit_admin_token', token);
    setAdminToken(token);
  };

  // 1. Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!adminToken) return;

    try {
      setIsLoadingStats(true);
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, [adminToken, handleUnauthorized]);

  // 2. Fetch Customers with active filters
  const fetchCustomers = useCallback(async () => {
    if (!adminToken) return;

    try {
      setIsLoadingCustomers(true);
      setFetchError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.goal !== 'all') params.append('goal', filters.goal);
      if (filters.diet !== 'all') params.append('diet', filters.diet);
      if (filters.language !== 'all') params.append('language', filters.language);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      params.append('page', String(filters.page || 1));
      params.append('limit', '10');

      const res = await fetch(`${BACKEND_URL}/api/customers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setTotalCustomers(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to load leads');
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setFetchError(t('admin.errorLoading'));
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [adminToken, filters, handleUnauthorized, t]);

  // Initial load when adminToken is present
  useEffect(() => {
    if (adminToken) {
      fetchStats();
      fetchCustomers();
    }
  }, [adminToken, fetchStats, fetchCustomers]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter modification
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      goal: 'all',
      diet: 'all',
      language: 'all',
      dateRange: 'all',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  // Open member detail modal & load plans/notes
  const handleSelectCustomer = async (cust) => {
    if (!adminToken) return;

    setSelectedCustomer(cust);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/customers/${cust.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer) {
          setSelectedCustomer(data.customer);
          setCustomerPlans(data.customer.dietPlans || []);
          setCustomerNotes(data.customer.trainerNotes || []);
        }
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Helper to construct DietPlan data from customer + plan
  const buildPlanData = (planObj, custObj) => {
    const pData = planObj.planData || planObj.plan_data || {};
    return {
      name: custObj.name,
      age: custObj.age,
      gender: custObj.gender,
      height: custObj.height,
      weight: custObj.weight,
      goal: custObj.goal,
      activityLevel: custObj.activityLevel || custObj.activity_level,
      foodPreference: custObj.foodPreference || custObj.food_preference,
      favoriteFoods: custObj.favoriteFoods || custObj.favorite_foods,
      allergies: custObj.allergies,
      phone: custObj.phone,
      email: custObj.email,
      planLanguage: planObj.language || custObj.language || 'en',
      nutrition: {
        bmr: planObj.bmr,
        tdee: planObj.tdee,
        targetCalories: planObj.targetCalories || planObj.target_calories,
        proteinG: planObj.proteinG || planObj.protein_g,
        carbsG: planObj.carbsG || planObj.carbs_g,
        fatG: planObj.fatG || planObj.fat_g,
      },
      plan: pData,
    };
  };

  // Re-open saved plan directly from table action
  const handleQuickOpenDietPlan = async (cust) => {
    if (!adminToken) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/customers/${cust.id}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.customer?.dietPlans?.length > 0) {
          const latestPlan = data.customer.dietPlans[0];
          const fullData = buildPlanData(latestPlan, data.customer);
          setSelectedCustomer(null);
          setViewingPlanData(fullData);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Failed to open diet plan:', err);
    }
  };

  // Re-open saved plan from modal
  const handleOpenPlanFromModal = (planObj, custObj) => {
    const fullData = buildPlanData(planObj, custObj);
    setSelectedCustomer(null);
    setViewingPlanData(fullData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Note added callback
  const handleNoteAdded = (newNote) => {
    setCustomerNotes((prev) => [newNote, ...prev]);
    // update count in customers table
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer?.id
          ? { ...c, notesCount: (parseInt(c.notesCount || 0, 10) + 1) }
          : c
      )
    );
  };

  // Note deleted callback
  const handleNoteDeleted = (noteId) => {
    setCustomerNotes((prev) => prev.filter((n) => n.id !== noteId));
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer?.id
          ? { ...c, notesCount: Math.max(0, parseInt(c.notesCount || 1, 10) - 1) }
          : c
      )
    );
  };

  // UN-AUTHENTICATED VIEW: Admin Login Form
  if (!adminToken) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onNavigateHome={onNavigateHome} />;
  }

  // VIEW MODE: Saved Diet Plan Viewer
  if (viewingPlanData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Return Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-4 z-40 backdrop-blur-md">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
                ⚡
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Staff Inspection Mode
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white">
                  {viewingPlanData.name}&apos;s Saved 7-Day Plan
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setViewingPlanData(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto font-bold border-emerald-500/30 text-emerald-300 hover:bg-slate-800"
            >
              ← Back to Admin Portal
            </Button>
          </div>

          {/* Render Full Diet Plan with 0 Gemini Calls */}
          <DietPlan
            customerData={viewingPlanData}
            onReset={() => {
              setViewingPlanData(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </div>
    );
  }

  // STANDARD VIEW: Admin Portal Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & Navigation Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-wider uppercase">
                {t('admin.navPortal')}
              </span>
              <span className="text-xs text-slate-500">• Single Gym Deployment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('admin.title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t('admin.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => {
                fetchStats();
                fetchCustomers();
              }}
              aria-label="Refresh leads data"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-sm"
              title="Refresh Data"
            >
              🔄
            </button>

            {onNavigateHome && (
              <Button
                variant="secondary"
                size="md"
                onClick={onNavigateHome}
                className="font-bold text-xs sm:text-sm min-h-[42px]"
              >
                {t('admin.navMemberSite')}
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={handleUnauthorized}
              className="font-bold text-xs sm:text-sm min-h-[42px] text-rose-300 border-rose-500/30 hover:bg-rose-500/10"
            >
              🚪 {t('admin.btnLogout')}
            </Button>
          </div>
        </div>

        {/* 1. Real-time Lead Statistics Row */}
        <section aria-label="Gym Lead Analytics">
          <AdminStats stats={stats} isLoading={isLoadingStats} />
        </section>

        {/* 2. Filter & Search Controls */}
        <section aria-label="Lead Filters">
          <AdminFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </section>

        {/* 3. Error state */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{fetchError}</span>
            </div>
            <button
              type="button"
              onClick={fetchCustomers}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg font-bold text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* 4. Leads Data Table & Mobile Cards */}
        <section aria-label="Member Leads List">
          <AdminLeadsTable
            customers={customers}
            total={totalCustomers}
            page={filters.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onSelectCustomer={handleSelectCustomer}
            onOpenDietPlan={handleQuickOpenDietPlan}
            isLoading={isLoadingCustomers}
          />
        </section>

        {/* 5. Member Detail & Coaching Modal */}
        {selectedCustomer && (
          <MemberDetailModal
            customer={selectedCustomer}
            dietPlans={customerPlans}
            notes={customerNotes}
            token={adminToken}
            onClose={() => setSelectedCustomer(null)}
            onOpenDietPlan={handleOpenPlanFromModal}
            onNoteAdded={handleNoteAdded}
            onNoteDeleted={handleNoteDeleted}
          />
        )}
      </div>
    </div>
  );
}
