require('dotenv').config();
const { validateDietPlan, generateDietPlan } = require('./gemini');
const { calculateNutritionTargets } = require('./nutrition');

// 1. Mock Sample Plan for Validation Testing
function createMockPlan(mealName, foodName, protein = 35) {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    days.push({
      day: i,
      day_name: `Day ${i}`,
      meals: [
        {
          type: 'breakfast',
          name: mealName,
          foods: [{ name: foodName, quantity: '100g' }],
          calories: 500,
          protein_g: protein,
          carbs_g: 60,
          fat_g: 15
        },
        {
          type: 'morning_snack',
          name: 'Snack 1',
          foods: [{ name: 'Apple', quantity: '1' }],
          calories: 200,
          protein_g: 5,
          carbs_g: 30,
          fat_g: 2
        },
        {
          type: 'lunch',
          name: 'Lunch 1',
          foods: [{ name: 'Rice and Dal', quantity: '200g' }],
          calories: 700,
          protein_g: 35,
          carbs_g: 90,
          fat_g: 20
        },
        {
          type: 'evening_snack',
          name: 'Snack 2',
          foods: [{ name: 'Nuts', quantity: '30g' }],
          calories: 250,
          protein_g: 10,
          carbs_g: 15,
          fat_g: 15
        },
        {
          type: 'dinner',
          name: 'Dinner 1',
          foods: [{ name: 'Soup and Bread', quantity: '250g' }],
          calories: 650,
          protein_g: 30,
          carbs_g: 75,
          fat_g: 18
        }
      ],
      daily_totals: {
        calories: 2300,
        protein_g: 115,
        carbs_g: 270,
        fat_g: 70
      }
    });
  }

  return {
    summary: {
      target_calories: 2300,
      protein_g: 115,
      carbs_g: 270,
      fat_g: 70
    },
    days
  };
}

async function runTests() {
  console.log('==============================================');
  console.log('RUNNING STAGE 3C MULTILINGUAL & SAFETY TESTS');
  console.log('==============================================\n');

  const sampleTargets = calculateNutritionTargets({
    weight: 70,
    height: 175,
    age: 28,
    gender: 'Male',
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active'
  });

  // TEST 1: Valid English vegetarian plan
  console.log('TEST 1: Valid English Vegetarian Plan...');
  const validPlanEn = createMockPlan('Oatmeal with Almond Milk', 'Oats');
  const res1 = validateDietPlan(validPlanEn, { foodPreference: 'Vegetarian', allergies: 'None' }, sampleTargets);
  console.log('Result:', res1.valid ? 'PASSED ✓' : `FAILED ✗ (${res1.error})`);

  // TEST 2: Hindi Meat Violation in Vegetarian Plan
  console.log('\nTEST 2: Hindi Meat Violation ("चिकन बिरयानी") in Vegetarian Plan...');
  const meatPlanHi = createMockPlan('चिकन बिरयानी', 'चिकन');
  const res2 = validateDietPlan(meatPlanHi, { foodPreference: 'Vegetarian', allergies: 'None' }, sampleTargets);
  console.log('Result:', !res2.valid && res2.error.includes('Diet preference violation') ? `PASSED ✓ (Correctly rejected: ${res2.error})` : 'FAILED ✗');

  // TEST 3: Gujarati Meat Violation in Vegetarian Plan
  console.log('\nTEST 3: Gujarati Meat Violation ("ચિકન કરી") in Vegetarian Plan...');
  const meatPlanGu = createMockPlan('ચિકન કરી', 'ચિકન');
  const res3 = validateDietPlan(meatPlanGu, { foodPreference: 'Vegetarian', allergies: 'None' }, sampleTargets);
  console.log('Result:', !res3.valid && res3.error.includes('Diet preference violation') ? `PASSED ✓ (Correctly rejected: ${res3.error})` : 'FAILED ✗');

  // TEST 4: Hindi Dairy Violation in Vegan Plan
  console.log('\nTEST 4: Hindi Dairy Violation ("पनीर टिक्का") in Vegan Plan...');
  const dairyPlanHi = createMockPlan('पनीर टिक्का', 'पनीर');
  const res4 = validateDietPlan(dairyPlanHi, { foodPreference: 'Vegan', allergies: 'None' }, sampleTargets);
  console.log('Result:', !res4.valid && res4.error.includes('Diet preference violation') ? `PASSED ✓ (Correctly rejected: ${res4.error})` : 'FAILED ✗');

  // TEST 5: Gujarati Dairy Violation in Vegan Plan
  console.log('\nTEST 5: Gujarati Dairy Violation ("દૂધ અને માખણ") in Vegan Plan...');
  const dairyPlanGu = createMockPlan('દૂધ અને રોટલી', 'દૂધ');
  const res5 = validateDietPlan(dairyPlanGu, { foodPreference: 'Vegan', allergies: 'None' }, sampleTargets);
  console.log('Result:', !res5.valid && res5.error.includes('Diet preference violation') ? `PASSED ✓ (Correctly rejected: ${res5.error})` : 'FAILED ✗');

  // TEST 6: Live Gemini Generation in English, Hindi, and Gujarati
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    console.log('\n----------------------------------------------');
    console.log('TEST 6: LIVE GEMINI GENERATION ACROSS 3 LANGUAGES');
    console.log('----------------------------------------------');

    // 6A. English Generation
    try {
      console.log('\n-> Generating 7-Day Plan in ENGLISH (en)...');
      const planEn = await generateDietPlan({
        name: 'John Doe',
        age: 26,
        gender: 'Male',
        height: 180,
        weight: 78,
        goal: 'Muscle Gain',
        activityLevel: 'Very Active',
        foodPreference: 'Non-Vegetarian',
        favoriteFoods: 'Chicken breast, rice, eggs',
        allergies: 'Peanuts'
      }, sampleTargets, 'en');

      console.log(`✓ English Plan Generated: Day 1 Name: "${planEn.days[0].day_name}", Meal 1: "${planEn.days[0].meals[0].name}"`);
    } catch (err) {
      console.error('✗ English Generation Failed:', err.message);
    }

    // 6B. Hindi Generation
    try {
      console.log('\n-> Generating 7-Day Plan in HINDI (hi)...');
      const planHi = await generateDietPlan({
        name: 'सुमन वर्मा',
        age: 28,
        gender: 'Female',
        height: 165,
        weight: 65,
        goal: 'Weight Loss',
        activityLevel: 'Moderately Active',
        foodPreference: 'Vegetarian',
        favoriteFoods: 'Paneer, rice, dal, roti, yogurt',
        allergies: 'Peanut'
      }, sampleTargets, 'hi');

      console.log(`✓ Hindi Plan Generated: Day 1 Name: "${planHi.days[0].day_name}", Meal 1: "${planHi.days[0].meals[0].name}"`);
    } catch (err) {
      console.error('✗ Hindi Generation Failed:', err.message);
    }

    // 6C. Gujarati Generation
    try {
      console.log('\n-> Generating 7-Day Plan in GUJARATI (gu)...');
      const planGu = await generateDietPlan({
        name: 'પટેલ મિતેષ',
        age: 30,
        gender: 'Male',
        height: 175,
        weight: 75,
        goal: 'Muscle Gain',
        activityLevel: 'Moderately Active',
        foodPreference: 'Vegetarian',
        favoriteFoods: 'Paneer, dal, rice, roti',
        allergies: 'None'
      }, sampleTargets, 'gu');

      console.log(`✓ Gujarati Plan Generated: Day 1 Name: "${planGu.days[0].day_name}", Meal 1: "${planGu.days[0].meals[0].name}"`);
    } catch (err) {
      console.error('✗ Gujarati Generation Failed:', err.message);
    }
  } else {
    console.log('\n⚠️ GEMINI_API_KEY not set. Skipping live AI generation test.');
  }

  console.log('\n==============================================');
  console.log('ALL TESTS COMPLETED');
  console.log('==============================================');
}

runTests();
