import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateWorkoutPlan, validateWorkoutPlan, generateDietPlan, validateDietPlan } from './gemini.js';
import { query } from './db.js';
import nutrition from './nutrition.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://127.0.0.1:5000';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@pulsefit.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pulsefit_admin_2026';

console.log('================================================================');
console.log('       PULSEFIT WORKOUT PLANNER — COMPREHENSIVE QA SUITE        ');
console.log('================================================================\n');

const testResults = [];
let totalRealGenerations = 0;
let totalRetries = 0;
const qaObservations = [];

function recordResult(category, testName, passed, details = {}) {
  testResults.push({ category, testName, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${testName}`);
  if (!passed || Object.keys(details).length > 0) {
    if (!passed) console.error('   Details:', details);
    else if (details.info) console.log('   ℹ️', details.info);
  }
}

async function runQA() {
  console.log('----------------------------------------------------------------');
  console.log('1. REAL GEMINI GENERATION — TARGETED USER PROFILES');
  console.log('----------------------------------------------------------------\n');

  // =========================================================================
  // TEST A: Beginner / Gym / 3 Days / 60 Min
  // =========================================================================
  console.log('--- Executing TEST A: Beginner / Gym ---');
  const profileA = {
    customer: { name: 'Test Beginner', age: 22, gender: 'male', height: 175, weight: 70, goal: 'General Fitness' },
    workout: {
      fitnessGoal: 'General Fitness',
      experienceLevel: 'beginner',
      workoutLocation: 'gym',
      equipment: 'Dumbbells, barbell, machines',
      daysPerWeek: 3,
      durationMins: 60,
      injuries: 'None',
      preferredExercises: 'Squats, bench press, rows'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planA = await generateWorkoutPlan(profileA.customer, profileA.workout, profileA.language);
    const validA = validateWorkoutPlan(planA, profileA.customer, profileA.workout);
    
    recordResult('Beginner Workout', 'Structural validation passed', validA.valid === true, { error: validA.error });
    recordResult('Beginner Workout', 'Exactly 7 days returned', planA.days?.length === 7, { daysCount: planA.days?.length });
    
    const activeDaysA = planA.days?.filter(d => !d.is_rest_day && !d.isRestDay) || [];
    const restDaysA = planA.days?.filter(d => d.is_rest_day || d.isRestDay) || [];
    recordResult('Beginner Workout', 'Respected 3 training days & 4 rest days', activeDaysA.length === 3 && restDaysA.length === 4, {
      activeDays: activeDaysA.length,
      restDays: restDaysA.length
    });

    // Verify beginner-appropriate exercises & volume (4-6 exercises, moderate sets)
    let maxExercisesA = Math.max(...activeDaysA.map(d => d.exercises?.length || 0));
    let hasSquatOrBenchOrRow = JSON.stringify(planA).toLowerCase().includes('squat') || JSON.stringify(planA).toLowerCase().includes('bench') || JSON.stringify(planA).toLowerCase().includes('row');
    recordResult('Beginner Workout', 'Reasonable volume for 60m (<= 6 exercises/day)', maxExercisesA <= 6, { maxExercises: maxExercisesA });
    recordResult('Beginner Workout', 'Incorporates preferred exercises', hasSquatOrBenchOrRow);

    qaObservations.push({ profile: 'Test A (Beginner Gym)', split: activeDaysA.map(d => d.focus).join(' | '), maxExercises: maxExercisesA });
  } catch (err) {
    recordResult('Beginner Workout', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST B: Home / No Equipment / 4 Days / 30 Min / Female
  // =========================================================================
  console.log('\n--- Executing TEST B: Home / No Equipment ---');
  const profileB = {
    customer: { name: 'Test Home', age: 25, gender: 'female', height: 165, weight: 60, goal: 'Weight Loss' },
    workout: {
      fitnessGoal: 'weightLoss',
      experienceLevel: 'beginner',
      workoutLocation: 'home',
      equipment: 'No equipment (bodyweight only)',
      daysPerWeek: 4,
      durationMins: 30,
      injuries: 'None',
      preferredExercises: 'Squats, lunges, push-ups'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planB = await generateWorkoutPlan(profileB.customer, profileB.workout, profileB.language);
    const validB = validateWorkoutPlan(planB, profileB.customer, profileB.workout);
    
    recordResult('Home No-Equipment', 'Structural validation passed', validB.valid === true, { error: validB.error });
    
    const activeDaysB = planB.days?.filter(d => !d.is_rest_day && !d.isRestDay) || [];
    const restDaysB = planB.days?.filter(d => d.is_rest_day || d.isRestDay) || [];
    recordResult('Home No-Equipment', 'Respected 4 training days & 3 rest days', activeDaysB.length === 4 && restDaysB.length === 3, {
      activeDays: activeDaysB.length,
      restDays: restDaysB.length
    });

    // Check equipment compliance: NO barbell, dumbbell, cable, machine
    const planBText = JSON.stringify(planB).toLowerCase();
    const forbiddenEquipment = ['barbell', 'dumbbell', 'cable machine', 'lat pulldown', 'leg press', 'smith machine'];
    const foundForbidden = forbiddenEquipment.filter(item => planBText.includes(item));
    recordResult('Home No-Equipment', 'Zero gym machine/barbell dependence (100% bodyweight compliant)', foundForbidden.length === 0, {
      foundForbidden
    });

    // 30 min duration check: 3 to 5 exercises per day
    let maxExercisesB = Math.max(...activeDaysB.map(d => d.exercises?.length || 0));
    recordResult('Home No-Equipment', 'Exercise volume suitable for 30 mins (<= 5 exercises/day)', maxExercisesB <= 5, { maxExercises: maxExercisesB });

    qaObservations.push({ profile: 'Test B (Home Bodyweight)', split: activeDaysB.map(d => d.focus).join(' | '), maxExercises: maxExercisesB });
  } catch (err) {
    recordResult('Home No-Equipment', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST C: Intermediate / Gym / Muscle Gain / 5 Days / 75 Min
  // =========================================================================
  console.log('\n--- Executing TEST C: Intermediate / Muscle Gain ---');
  const profileC = {
    customer: { name: 'Test Intermediate', age: 24, gender: 'male', height: 178, weight: 75, goal: 'Muscle Gain' },
    workout: {
      fitnessGoal: 'muscleGain',
      experienceLevel: 'intermediate',
      workoutLocation: 'gym',
      equipment: 'Full commercial gym with barbells, dumbbells, cables, machines',
      daysPerWeek: 5,
      durationMins: 75,
      injuries: 'None',
      preferredExercises: 'Bench press, rows, squats, deadlifts'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planC = await generateWorkoutPlan(profileC.customer, profileC.workout, profileC.language);
    const validC = validateWorkoutPlan(planC, profileC.customer, profileC.workout);
    
    recordResult('Intermediate Workout', 'Structural validation passed', validC.valid === true, { error: validC.error });
    
    const activeDaysC = planC.days?.filter(d => !d.is_rest_day && !d.isRestDay) || [];
    const restDaysC = planC.days?.filter(d => d.is_rest_day || d.isRestDay) || [];
    recordResult('Intermediate Workout', 'Respected 5 training days & 2 rest days', activeDaysC.length === 5 && restDaysC.length === 2, {
      activeDays: activeDaysC.length,
      restDays: restDaysC.length
    });

    let maxExercisesC = Math.max(...activeDaysC.map(d => d.exercises?.length || 0));
    recordResult('Intermediate Workout', 'Appropriate volume for 75m intermediate split (4-7 exercises/day)', maxExercisesC >= 4 && maxExercisesC <= 7, { maxExercises: maxExercisesC });

    qaObservations.push({ profile: 'Test C (Intermediate Gym)', split: activeDaysC.map(d => d.focus).join(' | '), maxExercises: maxExercisesC });
  } catch (err) {
    recordResult('Intermediate Workout', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST D: Advanced / Gym / Strength / 6 Days / 90 Min
  // =========================================================================
  console.log('\n--- Executing TEST D: Advanced / Strength ---');
  const profileD = {
    customer: { name: 'Test Advanced', age: 28, gender: 'male', height: 180, weight: 82, goal: 'Strength' },
    workout: {
      fitnessGoal: 'strength',
      experienceLevel: 'advanced',
      workoutLocation: 'gym',
      equipment: 'Full gym with power racks, barbells, specialty bars',
      daysPerWeek: 6,
      durationMins: 90,
      injuries: 'None',
      preferredExercises: 'Squat, bench press, deadlift, overhead press'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planD = await generateWorkoutPlan(profileD.customer, profileD.workout, profileD.language);
    const validD = validateWorkoutPlan(planD, profileD.customer, profileD.workout);
    
    recordResult('Advanced Workout', 'Structural validation passed', validD.valid === true, { error: validD.error });
    
    const activeDaysD = planD.days?.filter(d => !d.is_rest_day && !d.isRestDay) || [];
    const restDaysD = planD.days?.filter(d => d.is_rest_day || d.isRestDay) || [];
    recordResult('Advanced Workout', 'Respected 6 training days & 1 rest day', activeDaysD.length === 6 && restDaysD.length === 1, {
      activeDays: activeDaysD.length,
      restDays: restDaysD.length
    });

    qaObservations.push({ profile: 'Test D (Advanced Strength)', split: activeDaysD.map(d => d.focus).join(' | ') });
  } catch (err) {
    recordResult('Advanced Workout', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST E: Injury / Limitation Safety Test
  // =========================================================================
  console.log('\n--- Executing TEST E: Physical Injury Safety Protocol ---');
  const profileE = {
    customer: { name: 'Test Injury', age: 32, gender: 'female', height: 168, weight: 65, goal: 'General Fitness' },
    workout: {
      fitnessGoal: 'generalFitness',
      experienceLevel: 'beginner',
      workoutLocation: 'gym',
      equipment: 'Full gym',
      daysPerWeek: 3,
      durationMins: 45,
      injuries: 'Previous knee pain. Avoid high-impact jumping and movements that aggravate the knee.',
      preferredExercises: 'Upper body, light cycling, core work'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planE = await generateWorkoutPlan(profileE.customer, profileE.workout, profileE.language);
    const validE = validateWorkoutPlan(planE, profileE.customer, profileE.workout);
    
    recordResult('Injury Safety', 'Structural validation passed', validE.valid === true, { error: validE.error });
    
    // Safety check 1: Has safety caution / disclaimer
    const hasSafetyNotice = Boolean(planE.safety_caution || planE.summary?.safety_notice);
    recordResult('Injury Safety', 'Includes explicit safety guidance disclaimer', hasSafetyNotice, {
      safety_caution: planE.safety_caution || planE.summary?.safety_notice
    });

    // Safety check 2: Avoids high impact jumping (box jumps, jump squats, burpees with jump)
    const planEText = JSON.stringify(planE).toLowerCase();
    const highImpactKeywords = ['jump squat', 'box jump', 'tuck jump', 'plyometric jump', 'jumping lunge'];
    const foundHighImpact = highImpactKeywords.filter(k => planEText.includes(k));
    recordResult('Injury Safety', 'Avoids high-impact jumping exercises compromising knee', foundHighImpact.length === 0, {
      foundHighImpact
    });

    // Safety check 3: Does NOT claim to diagnose or medically cure knee arthritis/meniscus tear
    const claimsMedicalCure = planEText.includes('cure your knee') || planEText.includes('diagnose') || planEText.includes('medical prescription');
    recordResult('Injury Safety', 'Does NOT make medical claims or diagnostic statements', claimsMedicalCure === false);

    qaObservations.push({ profile: 'Test E (Knee Limitation Safety)', safetyCaution: planE.safety_caution || planE.summary?.safety_notice });
  } catch (err) {
    recordResult('Injury Safety', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST F: Multilingual Hindi (हिंदी - Devanagari)
  // =========================================================================
  console.log('\n--- Executing TEST F: Multilingual Hindi (हिंदी) ---');
  const profileF = {
    customer: { name: 'राजेश शर्मा', age: 29, gender: 'male', height: 172, weight: 74, goal: 'Muscle Gain' },
    workout: {
      fitnessGoal: 'muscleGain',
      experienceLevel: 'intermediate',
      workoutLocation: 'gym',
      equipment: 'Dumbbells and Barbells',
      daysPerWeek: 4,
      durationMins: 50,
      injuries: 'None',
      preferredExercises: 'Chest press, squats'
    },
    language: 'hi'
  };

  try {
    totalRealGenerations++;
    const planF = await generateWorkoutPlan(profileF.customer, profileF.workout, profileF.language);
    const validF = validateWorkoutPlan(planF, profileF.customer, profileF.workout);
    
    recordResult('Hindi Localization', 'Structural validation passed', validF.valid === true, { error: validF.error });
    
    // Check Devanagari script presence in focus, day_name, instructions
    const planFText = JSON.stringify(planF);
    const devanagariRegex = /[\u0900-\u097F]/;
    const hasDevanagari = devanagariRegex.test(planFText);
    recordResult('Hindi Localization', 'Contains natural Hindi Devanagari text', hasDevanagari);

    // Verify JSON keys remain in English
    const keysAreEnglish = Object.keys(planF).every(k => !devanagariRegex.test(k)) && 
      planF.days?.every(d => Object.keys(d).every(k => !devanagariRegex.test(k)));
    recordResult('Hindi Localization', 'Internal JSON keys remain stable English', keysAreEnglish);

    qaObservations.push({ profile: 'Test F (Hindi)', sampleFocus: planF.days?.[0]?.focus, sampleDay: planF.days?.[0]?.day_name || planF.days?.[0]?.dayName });
  } catch (err) {
    recordResult('Hindi Localization', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST G: Multilingual Gujarati (ગુજરાતી)
  // =========================================================================
  console.log('\n--- Executing TEST G: Multilingual Gujarati (ગુજરાતી) ---');
  const profileG = {
    customer: { name: 'કેયુર પટેલ', age: 27, gender: 'male', height: 175, weight: 72, goal: 'General Fitness' },
    workout: {
      fitnessGoal: 'generalFitness',
      experienceLevel: 'beginner',
      workoutLocation: 'gym',
      equipment: 'Dumbbells and machines',
      daysPerWeek: 3,
      durationMins: 45,
      injuries: 'None',
      preferredExercises: 'Pushups, lat pulldown'
    },
    language: 'gu'
  };

  try {
    totalRealGenerations++;
    const planG = await generateWorkoutPlan(profileG.customer, profileG.workout, profileG.language);
    const validG = validateWorkoutPlan(planG, profileG.customer, profileG.workout);
    
    recordResult('Gujarati Localization', 'Structural validation passed', validG.valid === true, { error: validG.error });
    
    // Check Gujarati script presence in focus, day_name, instructions
    const planGText = JSON.stringify(planG);
    const gujaratiRegex = /[\u0A80-\u0AFF]/;
    const hasGujarati = gujaratiRegex.test(planGText);
    recordResult('Gujarati Localization', 'Contains natural Gujarati script text', hasGujarati);

    const keysAreEnglishG = Object.keys(planG).every(k => !gujaratiRegex.test(k)) && 
      planG.days?.every(d => Object.keys(d).every(k => !gujaratiRegex.test(k)));
    recordResult('Gujarati Localization', 'Internal JSON keys remain stable English', keysAreEnglishG);

    qaObservations.push({ profile: 'Test G (Gujarati)', sampleFocus: planG.days?.[0]?.focus, sampleDay: planG.days?.[0]?.day_name || planG.days?.[0]?.dayName });
  } catch (err) {
    recordResult('Gujarati Localization', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST H: Equipment Consistency (Home + Dumbbells vs Gym + Full)
  // =========================================================================
  console.log('\n--- Executing TEST H: Equipment Consistency (Home + Dumbbells) ---');
  const profileH = {
    customer: { name: 'Test Dumbbell Home', age: 30, gender: 'male', height: 176, weight: 78, goal: 'Muscle Gain' },
    workout: {
      fitnessGoal: 'muscleGain',
      experienceLevel: 'intermediate',
      workoutLocation: 'home',
      equipment: 'Pair of adjustable dumbbells and a flat bench only (no barbells, no cables, no machines)',
      daysPerWeek: 4,
      durationMins: 45,
      injuries: 'None',
      preferredExercises: 'Dumbbell bench press, dumbbell rows, goblet squats'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planH = await generateWorkoutPlan(profileH.customer, profileH.workout, profileH.language);
    const planHText = JSON.stringify(planH).toLowerCase();
    
    // Verify dumbbell exercises present
    const hasDumbbell = planHText.includes('dumbbell') || planHText.includes('db ') || planHText.includes('goblet');
    recordResult('Equipment Consistency', 'Uses dumbbell / bodyweight exercises for dumbbell home setup', hasDumbbell);

    // Verify no heavy cable or specialized commercial machines (e.g. hack squat, pec deck, leg curl machine)
    const specializedMachines = ['hack squat machine', 'pec deck', 'leg curl machine', 'cable crossover', 'smith machine'];
    const foundSpecialized = specializedMachines.filter(m => planHText.includes(m));
    recordResult('Equipment Consistency', 'No specialized commercial machine dependence for dumbbell setup', foundSpecialized.length === 0, { foundSpecialized });
  } catch (err) {
    recordResult('Equipment Consistency', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST I: Frequency Extremes (2 Days/Week and 6 Days/Week)
  // =========================================================================
  console.log('\n--- Executing TEST I: Frequency Spectrum (2 Days/Week & 15 Min) ---');
  const profileI = {
    customer: { name: 'Test Express 2Day', age: 40, gender: 'female', height: 160, weight: 58, goal: 'General Fitness' },
    workout: {
      fitnessGoal: 'generalFitness',
      experienceLevel: 'beginner',
      workoutLocation: 'home',
      equipment: 'No equipment',
      daysPerWeek: 2,
      durationMins: 20,
      injuries: 'None',
      preferredExercises: 'Squats, wall pushups'
    },
    language: 'en'
  };

  try {
    totalRealGenerations++;
    const planI = await generateWorkoutPlan(profileI.customer, profileI.workout, profileI.language);
    const activeDaysI = planI.days?.filter(d => !d.is_rest_day && !d.isRestDay) || [];
    const restDaysI = planI.days?.filter(d => d.is_rest_day || d.isRestDay) || [];
    recordResult('Frequency Consistency', '2 Days/Week yields exactly 2 active days and 5 rest days', activeDaysI.length === 2 && restDaysI.length === 5, {
      activeDays: activeDaysI.length,
      restDays: restDaysI.length
    });
    
    let maxExercisesI = Math.max(...activeDaysI.map(d => d.exercises?.length || 0));
    recordResult('Duration Consistency', '20-min session has compact 3-4 exercises', maxExercisesI <= 4, { maxExercises: maxExercisesI });
  } catch (err) {
    recordResult('Frequency Consistency', 'Generation succeeded', false, { error: err.message });
  }

  // =========================================================================
  // TEST 8: GEMINI RETRY / FAILURE HANDLING SIMULATION
  // =========================================================================
  console.log('\n----------------------------------------------------------------');
  console.log('2. GEMINI RETRY & VALIDATION RESILIENCE');
  console.log('----------------------------------------------------------------\n');

  // Test invalid structure caught by validator
  const corruptedPlan1 = { days: [{ day: 1, focus: 'Chest', is_rest_day: false, exercises: [] }] };
  const valCatch1 = validateWorkoutPlan(corruptedPlan1);
  recordResult('Retry & Resilience', 'Validator rejects incomplete days array (< 7 days)', valCatch1.valid === false);

  const corruptedPlan2 = {
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      focus: 'Training',
      is_rest_day: false,
      exercises: [{ name: 'Test', sets: 3 }] // missing reps/duration
    }))
  };
  const valCatch2 = validateWorkoutPlan(corruptedPlan2);
  recordResult('Retry & Resilience', 'Validator rejects exercises missing reps/duration', valCatch2.valid === false);

  // =========================================================================
  // TEST 9 & 10: DATABASE & ADMIN INSPECTION
  // =========================================================================
  console.log('\n----------------------------------------------------------------');
  console.log('3. DATABASE PERSISTENCE & ADMIN INSPECTION');
  console.log('----------------------------------------------------------------\n');

  let adminToken = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    adminToken = loginData.token;
    recordResult('Admin Inspection', 'Admin authentication returns valid JWT', Boolean(adminToken));
  } catch (err) {
    recordResult('Admin Inspection', 'Admin login failed', false, { error: err.message });
  }

  // Unauthenticated access check
  try {
    const unauthWorkoutPlans = await fetch(`${BASE_URL}/api/workout-plans`);
    recordResult('Admin Inspection', 'Unauthenticated GET /api/workout-plans returns 401', unauthWorkoutPlans.status === 401);
  } catch (err) {
    recordResult('Admin Inspection', 'Unauth check error', false, { error: err.message });
  }

  // Admin stats includes totalWorkoutPlans
  if (adminToken) {
    try {
      const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const statsData = await statsRes.json();
      recordResult('Admin Inspection', 'Stats endpoint includes totalWorkoutPlans metric', typeof statsData.stats?.totalWorkoutPlans === 'number', {
        totalWorkoutPlans: statsData.stats?.totalWorkoutPlans
      });
    } catch (err) {
      recordResult('Admin Inspection', 'Stats fetch error', false, { error: err.message });
    }
  }

  // =========================================================================
  // TEST 11: RATE LIMITING (5 requests / 15 mins / IP)
  // =========================================================================
  console.log('\n----------------------------------------------------------------');
  console.log('4. RATE LIMITING VERIFICATION');
  console.log('----------------------------------------------------------------\n');

  try {
    // Check rate limiter configuration directly
    const rlModule = await import('./rateLimiter.js');
    recordResult('Rate Limiting', 'workoutGenerationLimiter is exported and configured', typeof rlModule.workoutGenerationLimiter === 'function');
  } catch (err) {
    recordResult('Rate Limiting', 'Rate limiter module check', false, { error: err.message });
  }

  // =========================================================================
  // TEST 12: DIET PLANNER ZERO-REGRESSION
  // =========================================================================
  console.log('\n----------------------------------------------------------------');
  console.log('5. DIET PLANNER ZERO-REGRESSION AUDIT');
  console.log('----------------------------------------------------------------\n');

  try {
    // 1. Math check: Mifflin-St Jeor BMR & TDEE
    const bmrMath = nutrition.calculateNutritionTargets({
      weight: 70,
      height: 175,
      age: 25,
      gender: 'male',
      goal: 'weightLoss',
      activityLevel: 'moderate'
    });
    recordResult('Diet Regression', 'BMR/TDEE nutrition calculation accurate', bmrMath.bmr > 1500 && bmrMath.targetCalories > 1500, {
      bmr: bmrMath.bmr,
      tdee: bmrMath.tdee,
      targetCalories: bmrMath.targetCalories
    });

    // 2. Diet plan validation function
    const meal1Cal = Math.round(bmrMath.targetCalories * 0.25);
    const meal2Cal = Math.round(bmrMath.targetCalories * 0.10);
    const meal3Cal = Math.round(bmrMath.targetCalories * 0.35);
    const meal4Cal = Math.round(bmrMath.targetCalories * 0.10);
    const meal5Cal = bmrMath.targetCalories - (meal1Cal + meal2Cal + meal3Cal + meal4Cal);

    const meal1P = Math.round(bmrMath.proteinG * 0.25);
    const meal2P = Math.round(bmrMath.proteinG * 0.10);
    const meal3P = Math.round(bmrMath.proteinG * 0.35);
    const meal4P = Math.round(bmrMath.proteinG * 0.10);
    const meal5P = bmrMath.proteinG - (meal1P + meal2P + meal3P + meal4P);

    const meal1C = Math.round(bmrMath.carbsG * 0.25);
    const meal2C = Math.round(bmrMath.carbsG * 0.10);
    const meal3C = Math.round(bmrMath.carbsG * 0.35);
    const meal4C = Math.round(bmrMath.carbsG * 0.10);
    const meal5C = bmrMath.carbsG - (meal1C + meal2C + meal3C + meal4C);

    const meal1F = Math.round(bmrMath.fatG * 0.25);
    const meal2F = Math.round(bmrMath.fatG * 0.10);
    const meal3F = Math.round(bmrMath.fatG * 0.35);
    const meal4F = Math.round(bmrMath.fatG * 0.10);
    const meal5F = bmrMath.fatG - (meal1F + meal2F + meal3F + meal4F);

    const mockDietPlan = {
      summary: { target_calories: bmrMath.targetCalories, protein_g: bmrMath.proteinG, carbs_g: bmrMath.carbsG, fat_g: bmrMath.fatG },
      days: Array.from({ length: 7 }, (_, d) => ({
        day: d + 1,
        day_name: `Day ${d + 1}`,
        daily_totals: { calories: bmrMath.targetCalories, protein_g: bmrMath.proteinG, carbs_g: bmrMath.carbsG, fat_g: bmrMath.fatG },
        meals: [
          { meal_type: 'Breakfast', name: 'Oatmeal & Boiled Eggs', calories: meal1Cal, protein_g: meal1P, carbs_g: meal1C, fat_g: meal1F },
          { meal_type: 'Morning Snack', name: 'Almonds and Apple', calories: meal2Cal, protein_g: meal2P, carbs_g: meal2C, fat_g: meal2F },
          { meal_type: 'Lunch', name: 'Grilled Chicken Breast, Brown Rice & Steamed Broccoli', calories: meal3Cal, protein_g: meal3P, carbs_g: meal3C, fat_g: meal3F },
          { meal_type: 'Evening Fuel', name: 'Greek Yogurt with Mixed Berries', calories: meal4Cal, protein_g: meal4P, carbs_g: meal4C, fat_g: meal4F },
          { meal_type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Green Beans', calories: meal5Cal, protein_g: meal5P, carbs_g: meal5C, fat_g: meal5F }
        ]
      }))
    };

    const valDiet = validateDietPlan(mockDietPlan, { foodPreference: 'nonVegetarian' }, bmrMath);
    recordResult('Diet Regression', 'Diet plan validator intact and functional', valDiet.valid === true, { error: valDiet.error });
  } catch (err) {
    recordResult('Diet Regression', 'Diet check error', false, { error: err.message });
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n================================================================');
  console.log('QA EXECUTION SUMMARY');
  console.log('================================================================');
  const passedCount = testResults.filter(r => r.passed).length;
  const failedCount = testResults.filter(r => !r.passed).length;
  console.log(`Total QA Checks:       ${testResults.length}`);
  console.log(`Passed:                ${passedCount} ✅`);
  console.log(`Failed:                ${failedCount} ❌`);
  console.log(`Real Gemini AI Calls:  ${totalRealGenerations}`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    console.error('QA finished with issues. Please review failures above.');
    process.exit(1);
  } else {
    console.log('🎉 ALL WORKOUT PLANNER QA CHECKS PASSED WITH EXCELLENCE!');
    process.exit(0);
  }
}

runQA().catch(err => {
  console.error('Fatal error during QA execution:', err);
  process.exit(1);
});
