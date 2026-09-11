require('dotenv').config();
const { generateDietPlan } = require('./gemini');
const { calculateNutritionTargets } = require('./nutrition');

async function benchmark() {
  console.log('====================================================');
  console.log('GEMINI AI RESPONSE LATENCY & BENCHMARK TEST');
  console.log('====================================================\n');

  const customerProfile = {
    name: 'Rahul Sharma',
    age: 28,
    gender: 'Male',
    height: 175,
    weight: 72,
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    foodPreference: 'Vegetarian',
    favoriteFoods: 'Paneer, dal, rice, oats, peanut butter, yogurt',
    allergies: 'None',
    phone: '+91 98765 43210',
    email: 'rahul@example.com'
  };

  console.log('Member Profile:', `${customerProfile.name} | ${customerProfile.gender}, ${customerProfile.age} yrs | ${customerProfile.weight}kg, ${customerProfile.height}cm`);
  console.log('Goal & Diet:', `${customerProfile.goal} | ${customerProfile.foodPreference}\n`);

  // 1. Benchmark Nutrition Calculation
  const t0 = performance.now();
  const targets = calculateNutritionTargets(customerProfile);
  const t1 = performance.now();
  const nutritionEngineMs = (t1 - t0).toFixed(2);
  console.log(`[1] Deterministic Nutrition Engine: ${nutritionEngineMs} ms`);
  console.log(`    Target: ${targets.targetCalories} kcal (Protein: ${targets.proteinG}g, Carbs: ${targets.carbsG}g, Fat: ${targets.fatG}g)\n`);

  // 2. Benchmark English AI Plan Generation
  console.log('[2] Benchmarking Gemini AI generation in ENGLISH (en)...');
  const startEn = performance.now();
  try {
    const planEn = await generateDietPlan(customerProfile, targets, 'en');
    const endEn = performance.now();
    const durationEnSec = ((endEn - startEn) / 1000).toFixed(2);
    const jsonLength = JSON.stringify(planEn).length;
    console.log(`    ✓ Response Time: ${durationEnSec} seconds (${Math.round(endEn - startEn)} ms)`);
    console.log(`    ✓ Payload Size: ${(jsonLength / 1024).toFixed(1)} KB (7 Days, 35 Structured Meals)`);
    console.log(`    ✓ Sample Meal (Day 1 Breakfast): "${planEn.days[0].meals[0].name}"\n`);
  } catch (err) {
    console.error(`    ✗ English generation failed: ${err.message}\n`);
  }

  // 3. Benchmark Hindi AI Plan Generation
  console.log('[3] Benchmarking Gemini AI generation in HINDI (hi)...');
  const startHi = performance.now();
  try {
    const planHi = await generateDietPlan(customerProfile, targets, 'hi');
    const endHi = performance.now();
    const durationHiSec = ((endHi - startHi) / 1000).toFixed(2);
    const jsonLengthHi = JSON.stringify(planHi).length;
    console.log(`    ✓ Response Time: ${durationHiSec} seconds (${Math.round(endHi - startHi)} ms)`);
    console.log(`    ✓ Payload Size: ${(jsonLengthHi / 1024).toFixed(1)} KB (7 Days, 35 Structured Meals)`);
    console.log(`    ✓ Sample Meal (Day 1 Breakfast): "${planHi.days[0].meals[0].name}"\n`);
  } catch (err) {
    console.error(`    ✗ Hindi generation failed: ${err.message}\n`);
  }

  // 4. Benchmark Gujarati AI Plan Generation
  console.log('[4] Benchmarking Gemini AI generation in GUJARATI (gu)...');
  const startGu = performance.now();
  try {
    const planGu = await generateDietPlan(customerProfile, targets, 'gu');
    const endGu = performance.now();
    const durationGuSec = ((endGu - startGu) / 1000).toFixed(2);
    const jsonLengthGu = JSON.stringify(planGu).length;
    console.log(`    ✓ Response Time: ${durationGuSec} seconds (${Math.round(endGu - startGu)} ms)`);
    console.log(`    ✓ Payload Size: ${(jsonLengthGu / 1024).toFixed(1)} KB (7 Days, 35 Structured Meals)`);
    console.log(`    ✓ Sample Meal (Day 1 Breakfast): "${planGu.days[0].meals[0].name}"\n`);
  } catch (err) {
    console.error(`    ✗ Gujarati generation failed: ${err.message}\n`);
  }

  console.log('====================================================');
  console.log('BENCHMARK COMPLETE');
  console.log('====================================================');
}

benchmark();
