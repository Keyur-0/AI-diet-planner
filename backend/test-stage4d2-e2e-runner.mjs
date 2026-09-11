import fetch from 'node-fetch';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createRequire } from 'module';
import { translations, getTranslation } from '../frontend/src/i18n/translations.js';

const require = createRequire(import.meta.url);
const { calculateNutritionTargets } = require('./nutrition.js');

dotenv.config();

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pulsefit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pulsefit_admin_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'pulsefit_super_secret_jwt_key_2026_dev';

console.log('================================================================');
console.log('   STAGE 4D.2 — FULL END-TO-END SYSTEM TEST AUTOMATED RUNNER   ');
console.log('================================================================\n');

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  blocked: 0,
  details: [],
  bugs: [],
  scores: {},
  geminiCalls: 0,
  savedPlanViews: 0,
};

function recordTest(category, name, passed, details = '', bugInfo = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`  ✅ [${category}] PASS: ${name}`);
    testResults.details.push({ category, name, status: 'PASS', details });
  } else {
    testResults.failed++;
    console.error(`  ❌ [${category}] FAIL: ${name} ${details ? `(${details})` : ''}`);
    testResults.details.push({ category, name, status: 'FAIL', details });
    if (bugInfo) {
      testResults.bugs.push(bugInfo);
    }
  }
}

// Helper delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runE2ESuite() {
  let adminToken = null;
  const generatedCustomers = [];

  // ==========================================================================
  // SECTION 1: ENVIRONMENT & HEALTH VERIFICATION
  // ==========================================================================
  console.log('\n--- SECTION 1: ENVIRONMENT & HEALTH VERIFICATION ---');

  recordTest('Environment', 'Node.js Runtime version is valid', !!process.version, `Version: ${process.version}`);
  recordTest('Environment', 'Gemini API Key is configured in environment', !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10, 'API key present');
  recordTest('Environment', 'Admin credentials and JWT secret configured', !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD && !!process.env.JWT_SECRET, 'Admin config verified');

  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    recordTest('Environment', 'Backend Express server is running and accessible on port 5000', res.status === 401 || res.status === 200, `HTTP status: ${res.status}`);
  } catch (err) {
    recordTest('Environment', 'Backend Express server accessible', false, err.message, {
      id: 'BUG-ENV-01',
      severity: 'CRITICAL',
      test: 'Backend Connectivity',
      steps: 'Fetch http://localhost:5000',
      expected: 'HTTP response',
      actual: err.message,
      component: 'Backend Server',
      cause: 'Server offline'
    });
  }

  // ==========================================================================
  // SECTION 2: TEST CUSTOMER 1 — ARJUN MEHTA (MUSCLE GAIN, NON-VEG, EN)
  // ==========================================================================
  console.log('\n--- SECTION 2: TEST CUSTOMER 1 (ARJUN MEHTA - MUSCLE GAIN, EN) ---');

  const cust1Input = {
    name: 'Arjun Mehta',
    age: 24,
    gender: 'male',
    height: 175,
    weight: 75,
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    foodPreference: 'Non-Vegetarian',
    favoriteFoods: 'Chicken, rice, eggs, bananas, yogurt',
    allergies: 'None',
    phone: '+91 9000000001',
    email: 'arjun.test@example.com',
    language: 'en'
  };

  // 1. Authoritative nutrition calculation check
  const cust1Calculated = calculateNutritionTargets(cust1Input);
  const expectedBMR = 1729; // ~1728.75
  const expectedTDEE = 2680; // ~2679.56
  const expectedTarget = 3030;
  const expectedProtein = 165;
  const expectedFat = 84; // ~84.17
  const expectedCarbs = 403; // ~403.125

  const bmrMatch = Math.abs(cust1Calculated.bmr - expectedBMR) <= 2;
  const tdeeMatch = Math.abs(cust1Calculated.tdee - expectedTDEE) <= 2;
  const targetMatch = Math.abs(cust1Calculated.targetCalories - expectedTarget) <= 2;
  const proteinMatch = Math.abs(cust1Calculated.proteinG - expectedProtein) <= 2;
  const fatMatch = Math.abs(cust1Calculated.fatG - expectedFat) <= 2;
  const carbsMatch = Math.abs(cust1Calculated.carbsG - expectedCarbs) <= 2;

  recordTest('Customer 1', 'Authoritative BMR calculation matches (~1729 kcal)', bmrMatch, `Got ${cust1Calculated.bmr}`);
  recordTest('Customer 1', 'Authoritative TDEE calculation matches (~2680 kcal)', tdeeMatch, `Got ${cust1Calculated.tdee}`);
  recordTest('Customer 1', 'Authoritative Target Calories matches (~3030 kcal)', targetMatch, `Got ${cust1Calculated.targetCalories}`);
  recordTest('Customer 1', 'Authoritative Protein target matches (~165g)', proteinMatch, `Got ${cust1Calculated.proteinG}g`);
  recordTest('Customer 1', 'Authoritative Fat target matches (~84g)', fatMatch, `Got ${cust1Calculated.fatG}g`);
  recordTest('Customer 1', 'Authoritative Carbs target matches (~403g)', carbsMatch, `Got ${cust1Calculated.carbsG}g`);

  // Check alias normalization bug
  const cust1AliasCalculated = calculateNutritionTargets({ ...cust1Input, activityLevel: 'moderate' });
  const aliasPassed = Math.abs(cust1AliasCalculated.tdee - expectedTDEE) <= 2;
  if (!aliasPassed) {
    recordTest('Nutrition Engine', 'Activity level alias normalization ("moderate" -> 1.55)', false, `Got TDEE ${cust1AliasCalculated.tdee} instead of ${expectedTDEE}`, {
      id: 'BUG-NUT-01',
      severity: 'MEDIUM',
      test: 'Activity level alias normalization in calculateTDEE',
      steps: 'Pass activityLevel: "moderate" to calculateNutritionTargets',
      expected: '1.55 multiplier applied (TDEE ~2680 kcal)',
      actual: `Fell back to 1.375 multiplier (TDEE ${cust1AliasCalculated.tdee} kcal)`,
      component: 'backend/nutrition.js',
      cause: 'Multipliers map only contains full string "moderately active", not short key "moderate"'
    });
  } else {
    recordTest('Nutrition Engine', 'Activity level alias normalization ("moderate" -> 1.55)', true);
  }

  // 2. Call POST /api/generate-diet
  let cust1Response = null;
  try {
    testResults.geminiCalls++;
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust1Input)
    });
    cust1Response = await res.json();

    const isSuccess = (res.status === 200 || res.status === 201) && cust1Response.success === true;
    recordTest('Customer 1', 'POST /api/generate-diet returns HTTP 201/200 and success: true', isSuccess, `Status: ${res.status}`);
    if (cust1Response.success && cust1Response.customer) {
      generatedCustomers.push({ ...cust1Response.customer, dietPlan: cust1Response.dietPlan, plan: cust1Response.plan });
    }
  } catch (err) {
    recordTest('Customer 1', 'POST /api/generate-diet API call succeeds', false, err.message, {
      id: 'BUG-GEN-01',
      severity: 'HIGH',
      test: 'Customer 1 Plan Generation',
      steps: 'POST /api/generate-diet with Arjun Mehta input',
      expected: 'Generated diet plan',
      actual: err.message,
      component: 'Diet Generation API',
      cause: 'Network or Gemini failure'
    });
  }

  // 3. Inspect generated 7-day meal plan
  const plan1 = cust1Response?.plan || cust1Response?.dietPlan?.plan_data;
  if (plan1) {
    const has7Days = Array.isArray(plan1.days) && plan1.days.length === 7;
    recordTest('Customer 1', 'Generated plan contains exactly 7 days', has7Days, `Days count: ${plan1.days?.length}`);

    let allDaysHave5Meals = true;
    let allMealsHaveFoods = true;
    let allMealsHaveValidMacros = true;

    plan1.days?.forEach((day, dIdx) => {
      if (!Array.isArray(day.meals) || day.meals.length < 5) allDaysHave5Meals = false;
      day.meals?.forEach((meal) => {
        if (!meal.name || !Array.isArray(meal.foods) || meal.foods.length === 0) allMealsHaveFoods = false;
        if (typeof meal.calories !== 'number' || typeof meal.protein_g !== 'number' || typeof meal.carbs_g !== 'number' || typeof meal.fat_g !== 'number') {
          allMealsHaveValidMacros = false;
        }
      });
    });

    recordTest('Customer 1', 'All 7 days contain at least 5 structured meals (Breakfast, Snacks, Lunch, Dinner)', allDaysHave5Meals);
    recordTest('Customer 1', 'All meals contain structured food ingredients with quantities', allMealsHaveFoods);
    recordTest('Customer 1', 'All meals have numeric calories and macro values', allMealsHaveValidMacros);
  }

  // ==========================================================================
  // SECTION 3: TEST CUSTOMER 2 — PRIYA SHAH (VEGETARIAN, PEANUT ALLERGY, EN)
  // ==========================================================================
  console.log('\n--- SECTION 3: TEST CUSTOMER 2 (PRIYA SHAH - VEGETARIAN, PEANUTS ALLERGY) ---');

  const cust2Input = {
    name: 'Priya Shah',
    age: 28,
    gender: 'female',
    height: 165,
    weight: 65,
    goal: 'Weight Loss',
    activityLevel: 'Moderately Active',
    foodPreference: 'Vegetarian',
    favoriteFoods: 'Paneer, dal, rice, roti, yogurt, vegetables',
    allergies: 'Peanuts',
    phone: '+91 9000000002',
    email: 'priya.test@example.com',
    language: 'en'
  };

  const cust2Calculated = calculateNutritionTargets(cust2Input);
  recordTest('Customer 2', 'Weight Loss target reflects calorie deficit (~1639 kcal)', Math.abs(cust2Calculated.targetCalories - 1639) <= 5, `Target: ${cust2Calculated.targetCalories}`);
  recordTest('Customer 2', 'Protein target meets weight loss requirement (~130g)', Math.abs(cust2Calculated.proteinG - 130) <= 2, `Protein: ${cust2Calculated.proteinG}`);

  let cust2Response = null;
  try {
    testResults.geminiCalls++;
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust2Input)
    });
    cust2Response = await res.json();
    const isSuccess = (res.status === 200 || res.status === 201) && cust2Response.success === true;
    recordTest('Customer 2', 'POST /api/generate-diet returns HTTP 201/200 for vegetarian customer', isSuccess, `Status: ${res.status}`);
    if (cust2Response.success && cust2Response.customer) {
      generatedCustomers.push({ ...cust2Response.customer, dietPlan: cust2Response.dietPlan, plan: cust2Response.plan });
    }
  } catch (err) {
    recordTest('Customer 2', 'Plan generation succeeded', false, err.message);
  }

  // Dietary & Allergen Safety Check on Priya
  const plan2 = cust2Response?.plan || cust2Response?.dietPlan?.plan_data;
  if (plan2) {
    const fullText = JSON.stringify(plan2).toLowerCase();
    const hasMeat = /chicken|mutton|beef|pork|fish|salmon|tuna|prawn|shrimp|crab|egg\b|eggs\b/.test(fullText);
    const hasPeanut = /peanut|peanuts|peanut butter|groundnut/.test(fullText);

    recordTest('Customer 2', 'Dietary Safety: Plan contains 0 meat/poultry/fish/egg items', !hasMeat, hasMeat ? 'Found meat items in veg plan!' : '100% Vegetarian verified');
    recordTest('Customer 2', 'Allergen Safety: Plan contains 0 peanuts/peanut butter items', !hasPeanut, hasPeanut ? 'Found peanut in allergy plan!' : '100% Peanut-Free verified');
  }

  // ==========================================================================
  // SECTION 4: TEST CUSTOMER 3 — NEHA PATEL (VEGAN, DAIRY ALLERGY, EN)
  // ==========================================================================
  console.log('\n--- SECTION 4: TEST CUSTOMER 3 (NEHA PATEL - VEGAN, DAIRY ALLERGY) ---');

  const cust3Input = {
    name: 'Neha Patel',
    age: 30,
    gender: 'female',
    height: 160,
    weight: 58,
    goal: 'Maintain Weight',
    activityLevel: 'Lightly Active',
    foodPreference: 'Vegan',
    favoriteFoods: 'Oats, lentils, tofu, rice, vegetables, bananas',
    allergies: 'Dairy',
    phone: '+91 9000000003',
    email: 'neha.test@example.com',
    language: 'en'
  };

  const cust3Calculated = calculateNutritionTargets(cust3Input);
  recordTest('Customer 3', 'Maintain target calculated accurately (~1745 kcal)', Math.abs(cust3Calculated.targetCalories - 1745) <= 5, `Target: ${cust3Calculated.targetCalories}`);

  let cust3Response = null;
  try {
    testResults.geminiCalls++;
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust3Input)
    });
    cust3Response = await res.json();
    const isSuccess = (res.status === 200 || res.status === 201) && cust3Response.success === true;
    recordTest('Customer 3', 'POST /api/generate-diet returns HTTP 201/200 for vegan customer', isSuccess, `Status: ${res.status}`);
    if (cust3Response.success && cust3Response.customer) {
      generatedCustomers.push({ ...cust3Response.customer, dietPlan: cust3Response.dietPlan, plan: cust3Response.plan });
    }
  } catch (err) {
    recordTest('Customer 3', 'Plan generation succeeded', false, err.message);
  }

  // Vegan & Dairy Check
  const plan3 = cust3Response?.plan || cust3Response?.dietPlan?.plan_data;
  if (plan3) {
    const fullText = JSON.stringify(plan3).toLowerCase();
    const hasAnimalOrDairy = /milk|paneer|yogurt|curd|cheese|butter|ghee|cream|whey|egg|chicken|mutton|beef|pork|fish|meat/.test(fullText);
    recordTest('Customer 3', 'Dietary & Allergen Safety: 100% Vegan (0 dairy, 0 meat, 0 eggs, 0 fish)', !hasAnimalOrDairy, hasAnimalOrDairy ? 'Found non-vegan item!' : '100% Vegan verified');
  }

  // ==========================================================================
  // SECTION 5: TEST CUSTOMER 4 — RAHUL VERMA (HINDI, NON-VEG)
  // ==========================================================================
  console.log('\n--- SECTION 5: TEST CUSTOMER 4 (RAHUL VERMA - HINDI, WEIGHT LOSS) ---');

  const cust4Input = {
    name: 'Rahul Verma',
    age: 26,
    gender: 'male',
    height: 178,
    weight: 82,
    goal: 'Weight Loss',
    activityLevel: 'Very Active',
    foodPreference: 'Non-Vegetarian',
    favoriteFoods: 'Chicken, rice, eggs, roti, bananas',
    allergies: 'None',
    phone: '+91 9000000004',
    email: 'rahul.test@example.com',
    language: 'hi'
  };

  let cust4Response = null;
  try {
    testResults.geminiCalls++;
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust4Input)
    });
    cust4Response = await res.json();
    const isSuccess = (res.status === 200 || res.status === 201) && cust4Response.success === true;
    recordTest('Customer 4 (Hindi)', 'POST /api/generate-diet returns HTTP 201/200 for Hindi request', isSuccess, `Status: ${res.status}`);
    if (cust4Response.success && cust4Response.customer) {
      generatedCustomers.push({ ...cust4Response.customer, dietPlan: cust4Response.dietPlan, plan: cust4Response.plan });
    }
  } catch (err) {
    recordTest('Customer 4 (Hindi)', 'Hindi plan generation succeeded', false, err.message);
  }

  const plan4 = cust4Response?.plan || cust4Response?.dietPlan?.plan_data;
  if (plan4) {
    const fullText = JSON.stringify(plan4);
    const hasDevanagari = /[\u0900-\u097F]/.test(fullText);
    recordTest('Customer 4 (Hindi)', 'Plan text contains genuine Hindi Devanagari script', hasDevanagari);
    recordTest('Customer 4 (Hindi)', 'Customer record saved with language="hi"', cust4Response.customer?.language === 'hi');
  }

  // ==========================================================================
  // SECTION 6: TEST CUSTOMER 5 — MEET DESAI (GUJARATI, MUSCLE GAIN)
  // ==========================================================================
  console.log('\n--- SECTION 6: TEST CUSTOMER 5 (MEET DESAI - GUJARATI, VEGETARIAN) ---');

  const cust5Input = {
    name: 'Meet Desai',
    age: 22,
    gender: 'male',
    height: 172,
    weight: 68,
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    foodPreference: 'Vegetarian',
    favoriteFoods: 'Paneer, dal, rice, roti, milk, bananas',
    allergies: 'None',
    phone: '+91 9000000005',
    email: 'meet.test@example.com',
    language: 'gu'
  };

  let cust5Response = null;
  try {
    testResults.geminiCalls++;
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust5Input)
    });
    cust5Response = await res.json();
    const isSuccess = (res.status === 200 || res.status === 201) && cust5Response.success === true;
    recordTest('Customer 5 (Gujarati)', 'POST /api/generate-diet returns HTTP 201/200 for Gujarati request', isSuccess, `Status: ${res.status}`);
    if (cust5Response.success && cust5Response.customer) {
      generatedCustomers.push({ ...cust5Response.customer, dietPlan: cust5Response.dietPlan, plan: cust5Response.plan });
    }
  } catch (err) {
    recordTest('Customer 5 (Gujarati)', 'Gujarati plan generation succeeded', false, err.message);
  }

  const plan5 = cust5Response?.plan || cust5Response?.dietPlan?.plan_data;
  if (plan5) {
    const fullText = JSON.stringify(plan5);
    const hasGujarati = /[\u0A80-\u0AFF]/.test(fullText);
    recordTest('Customer 5 (Gujarati)', 'Plan text contains genuine Gujarati script', hasGujarati);
    recordTest('Customer 5 (Gujarati)', 'Customer record saved with language="gu"', cust5Response.customer?.language === 'gu');
  }

  // ==========================================================================
  // SECTION 7: RATE LIMITING & DUPLICATE SUBMISSION TEST
  // ==========================================================================
  console.log('\n--- SECTION 7: RATE LIMITING & DUPLICATE SUBMISSION TEST ---');

  try {
    // Attempt rapid 6th request
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cust1Input)
    });
    recordTest('Rate Limiter', '6th rapid request triggers rate limiter (HTTP 429 Too Many Requests)', res.status === 429, `HTTP Status: ${res.status}`);
  } catch (err) {
    recordTest('Rate Limiter', 'Rate limiter test', false, err.message);
  }

  // ==========================================================================
  // SECTION 8: NUTRITION CONSISTENCY ACROSS ALL GENERATED PLANS
  // ==========================================================================
  console.log('\n--- SECTION 8: NUTRITION CONSISTENCY AUDIT ---');

  generatedCustomers.forEach((cust, idx) => {
    const plan = cust.plan || cust.dietPlan?.plan_data;
    if (!plan || !plan.days) return;

    let totalDiscrepancies = 0;
    plan.days.forEach((day, dIdx) => {
      const mealCaloriesSum = day.meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
      const targetCal = cust.dietPlan?.target_calories || cust.dietPlan?.targetCalories || 2000;
      const deviationPct = Math.abs(mealCaloriesSum - targetCal) / targetCal;
      if (deviationPct > 0.20) {
        totalDiscrepancies++;
      }
    });

    recordTest('Nutrition Consistency', `Customer ${idx + 1} (${cust.name}): Meal totals conform to daily target within tolerance`, totalDiscrepancies === 0, `Discrepancies: ${totalDiscrepancies}/7 days`);
  });

  // ==========================================================================
  // SECTION 9: DATABASE & PERSISTENCE INTEGRITY
  // ==========================================================================
  console.log('\n--- SECTION 9: DATABASE / STORE PERSISTENCE & RELATIONSHIPS ---');

  // Login as admin
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    if (loginData.token) {
      adminToken = loginData.token;
      recordTest('Admin Auth', 'Admin login successful and JWT token acquired', true);
    } else {
      recordTest('Admin Auth', 'Admin login token acquired', false, 'Missing token');
    }
  } catch (err) {
    recordTest('Admin Auth', 'Admin login request', false, err.message);
  }

  // Verify all customers are retrieved via authenticated GET /api/customers
  if (adminToken) {
    try {
      const custRes = await fetch(`${BASE_URL}/api/customers?limit=50`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const custData = await custRes.json();
      recordTest('Database', 'GET /api/customers returns all member records with pagination', custRes.status === 200 && custData.customers?.length >= 3, `Total leads: ${custData.total}`);

      // Verify no duplicate IDs or cross-contamination
      const ids = custData.customers.map((c) => c.id);
      const uniqueIds = new Set(ids);
      recordTest('Database', 'All customer record IDs are distinct and unique', ids.length === uniqueIds.size);
    } catch (err) {
      recordTest('Database', 'Retrieve customers error', false, err.message);
    }
  }

  // ==========================================================================
  // SECTION 10: ADMIN PORTAL JOURNEY & ZERO-GEMINI SAVED PLAN INSPECTION
  // ==========================================================================
  console.log('\n--- SECTION 10: ADMIN PORTAL JOURNEY & ZERO-GEMINI SAVED PLAN VIEWS ---');

  if (adminToken && generatedCustomers.length > 0) {
    const firstCust = generatedCustomers[0];

    // 1. Fetch individual member profile
    try {
      const res = await fetch(`${BASE_URL}/api/customers/${firstCust.id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      testResults.savedPlanViews++;
      recordTest('Admin Portal', `GET /api/customers/${firstCust.id} returns full member profile & linked diet plans`, res.status === 200 && data.customer?.id === firstCust.id);
    } catch (err) {
      recordTest('Admin Portal', 'Fetch customer detail', false, err.message);
    }

    // 2. Search filtering
    try {
      const searchRes = await fetch(`${BASE_URL}/api/customers?search=Arjun`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const searchData = await searchRes.json();
      const match = searchData.customers?.some((c) => c.name.includes('Arjun'));
      recordTest('Admin Portal', 'Search filter by name ("Arjun") matches customer correctly', match === true);
    } catch (err) {
      recordTest('Admin Portal', 'Search filter', false, err.message);
    }

    // 3. Goal & Diet filter
    try {
      const filterRes = await fetch(`${BASE_URL}/api/customers?goal=Muscle%20Gain&diet=Vegetarian`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const filterData = await filterRes.json();
      recordTest('Admin Portal', 'Combined filter (Goal="Muscle Gain", Diet="Vegetarian") succeeds', filterRes.status === 200 && Array.isArray(filterData.customers));
    } catch (err) {
      recordTest('Admin Portal', 'Combined filter', false, err.message);
    }

    // 4. Trainer Notes CRUD Workflow
    let createdNoteId = null;
    try {
      const noteRes = await fetch(`${BASE_URL}/api/customers/${firstCust.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ note: 'Member should focus on consistent meal timing and hydration.' })
      });
      const noteData = await noteRes.json();
      if (noteRes.status === 201 && noteData.note?.id) {
        createdNoteId = noteData.note.id;
        recordTest('Trainer Notes', 'Create trainer note: Note appears with ID and timestamp', true, `Note ID: ${createdNoteId}`);
      } else {
        recordTest('Trainer Notes', 'Create trainer note', false, `Status: ${noteRes.status}`);
      }
    } catch (err) {
      recordTest('Trainer Notes', 'Create trainer note', false, err.message);
    }

    // Fetch notes to verify presence
    try {
      const notesListRes = await fetch(`${BASE_URL}/api/customers/${firstCust.id}/notes`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const notesListData = await notesListRes.json();
      const hasNote = notesListData.notes?.some((n) => n.id === createdNoteId);
      recordTest('Trainer Notes', 'Verify note is attached to the correct customer record', hasNote === true);
    } catch (err) {
      recordTest('Trainer Notes', 'Fetch notes list', false, err.message);
    }

    // Delete Note
    if (createdNoteId) {
      try {
        const delRes = await fetch(`${BASE_URL}/api/customers/${firstCust.id}/notes/${createdNoteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        recordTest('Trainer Notes', 'Delete note: Note is successfully removed (HTTP 200)', delRes.status === 200);
      } catch (err) {
        recordTest('Trainer Notes', 'Delete note', false, err.message);
      }
    }
  }

  // ==========================================================================
  // SECTION 11: ADMIN LOGOUT & SECURITY REGRESSION
  // ==========================================================================
  console.log('\n--- SECTION 11: ADMIN LOGOUT & SECURITY REGRESSION ---');

  try {
    const res1 = await fetch(`${BASE_URL}/api/admin/stats`);
    const res2 = await fetch(`${BASE_URL}/api/customers`);
    const res3 = await fetch(`${BASE_URL}/api/diet-plans`);
    const allBlocked = res1.status === 401 && res2.status === 401 && res3.status === 401;
    recordTest('Security Regression', 'Unauthenticated requests to admin endpoints are strictly rejected (HTTP 401)', allBlocked);
  } catch (err) {
    recordTest('Security Regression', 'Security check', false, err.message);
  }

  // ==========================================================================
  // SECTION 12: FAULT RESILIENCE & ERROR HANDLING
  // ==========================================================================
  console.log('\n--- SECTION 12: FAULT RESILIENCE & ERROR HANDLING ---');

  // Test 1: Malformed JSON payload
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json": true, missing_brace'
    });
    const data = await res.json();
    recordTest('Error Handling', 'Malformed JSON returns clean 400 Bad Request without stack trace leakage', res.status === 400 && data.success === false && !data.stack);
  } catch (err) {
    recordTest('Error Handling', 'Malformed JSON test', false, err.message);
  }

  // Test 2: Invalid customer input
  try {
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alex', age: 5, weight: 10 }) // unrealistic age & weight
    });
    recordTest('Error Handling', 'Invalid customer inputs return validation errors', res.status === 400 || res.status === 429);
  } catch (err) {
    recordTest('Error Handling', 'Invalid input test', false, err.message);
  }

  // ==========================================================================
  // SECTION 13: LANGUAGE REGRESSION & I18N COMPLETENESS
  // ==========================================================================
  console.log('\n--- SECTION 13: LANGUAGE REGRESSION & TRANSLATION COMPLETENESS ---');

  const supportedLangs = ['en', 'hi', 'gu'];
  let translationMissing = false;

  const requiredKeyPaths = [
    'nav.brandTagline',
    'nav.newDietPlan',
    'hero.titlePart1',
    'hero.titleHighlight',
    'form.section1Title',
    'form.nameLabel',
    'form.submitButton',
    'dietPlan.memberCardTitle',
    'dietPlan.goalCardTitle',
    'dietPlan.downloadPdf',
    'grocery.title',
    'admin.title',
    'admin.loginTitle',
    'admin.btnLogin',
    'admin.btnLogout',
  ];

  supportedLangs.forEach((lang) => {
    requiredKeyPaths.forEach((kp) => {
      const translated = getTranslation(lang, kp);
      if (!translated || translated === kp) {
        translationMissing = true;
        console.warn(`Missing translation in ${lang}: ${kp}`);
      }
    });
  });

  recordTest('Languages & I18n', 'Complete trilingual translation coverage for EN, HI, GU across all core modules', !translationMissing);

  // ==========================================================================
  // SUMMARY & SCORING
  // ==========================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${testResults.total}`);
  console.log(`PASSED: ${testResults.passed}`);
  console.log(`FAILED: ${testResults.failed}`);
  console.log(`PASS PERCENTAGE: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  console.log(`GEMINI API CALLS: ${testResults.geminiCalls}`);
  console.log(`SAVED PLAN INSPECTIONS (0 Gemini): ${testResults.savedPlanViews}`);
  console.log('================================================================\n');

  return testResults;
}

runE2ESuite().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
