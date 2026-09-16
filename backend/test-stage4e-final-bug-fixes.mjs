import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
  calculateNutritionTargets,
  normalizeActivityLevel
} from './nutrition.js';
import { validateDietPlan } from './gemini.js';
import { translations, getTranslation } from '../frontend/src/i18n/translations.js';

console.log('================================================================');
console.log('      STAGE 4E — FINAL FUNCTIONAL BUG FIXES TEST SUITE          ');
console.log('================================================================\n');

let totalTests = 0;
let testsPassed = 0;
let testsFailed = 0;
const testDetails = [];

function assert(condition, category, testName, details = '') {
  totalTests++;
  if (condition) {
    testsPassed++;
    console.log(`  ✅ [PASS] ${category}: ${testName}`);
  } else {
    testsFailed++;
    console.error(`  ❌ [FAIL] ${category}: ${testName} -> ${details}`);
  }
  testDetails.push({ category, testName, passed: !!condition, details });
}

async function runStage4ETests() {
  // ==========================================================================
  // 1. BUG-NUT-01: ACTIVITY SHORTHAND MAPPING & TDEE CALCULATION
  // ==========================================================================
  console.log('\n--- 1. BUG-NUT-01: ACTIVITY SHORTHAND MAPPING & TDEE ---');

  const bmr = 1729; // Sample BMR (Arjun Mehta)

  // 1.1 Sedentary
  const tdeeSedentary = calculateTDEE(bmr, 'sedentary');
  assert(tdeeSedentary === Math.round(1729 * 1.2), 'Activity Mapping', 'sedentary maps to 1.2 multiplier (2075 kcal)');

  // 1.2 Light vs Lightly Active
  const tdeeLightFull = calculateTDEE(bmr, 'lightly active');
  const tdeeLightShort = calculateTDEE(bmr, 'light');
  assert(
    tdeeLightShort === tdeeLightFull && tdeeLightShort === Math.round(1729 * 1.375),
    'Activity Mapping',
    'light === lightly active (2377 kcal, 1.375 multiplier)',
    `Short: ${tdeeLightShort}, Full: ${tdeeLightFull}`
  );

  // 1.3 Moderate vs Moderately Active
  const tdeeModerateFull = calculateTDEE(bmr, 'moderately active');
  const tdeeModerateShort = calculateTDEE(bmr, 'moderate');
  assert(
    tdeeModerateShort === tdeeModerateFull && tdeeModerateShort === Math.round(1729 * 1.55),
    'Activity Mapping',
    'moderate === moderately active (2680 kcal, 1.55 multiplier)',
    `Short: ${tdeeModerateShort}, Full: ${tdeeModerateFull}`
  );

  // 1.4 Very vs Very Active
  const tdeeVeryFull = calculateTDEE(bmr, 'very active');
  const tdeeVeryShort = calculateTDEE(bmr, 'very');
  assert(
    tdeeVeryShort === tdeeVeryFull && tdeeVeryShort === Math.round(1729 * 1.725),
    'Activity Mapping',
    'very === very active (2983 kcal, 1.725 multiplier)',
    `Short: ${tdeeVeryShort}, Full: ${tdeeVeryFull}`
  );

  // 1.5 normalizeActivityLevel helper verification
  assert(normalizeActivityLevel('moderate') === 'moderately active', 'Activity Mapping', 'normalizeActivityLevel("moderate") returns "moderately active"');
  assert(normalizeActivityLevel('very') === 'very active', 'Activity Mapping', 'normalizeActivityLevel("very") returns "very active"');
  assert(normalizeActivityLevel('light') === 'lightly active', 'Activity Mapping', 'normalizeActivityLevel("light") returns "lightly active"');
  assert(normalizeActivityLevel('sedentary') === 'sedentary', 'Activity Mapping', 'normalizeActivityLevel("sedentary") returns "sedentary"');
  assert(normalizeActivityLevel('invalid_xyz_activity') === null, 'Activity Mapping', 'normalizeActivityLevel returns null for invalid activity string');

  // 1.6 Full nutrition calculation with shorthand
  const fullTargetsModerate = calculateNutritionTargets({
    weight: 75,
    height: 175,
    age: 24,
    gender: 'male',
    goal: 'Muscle Gain',
    activityLevel: 'moderate'
  });
  const fullTargetsModeratelyActive = calculateNutritionTargets({
    weight: 75,
    height: 175,
    age: 24,
    gender: 'male',
    goal: 'Muscle Gain',
    activityLevel: 'moderately active'
  });
  assert(
    fullTargetsModerate.targetCalories === 3030 &&
    fullTargetsModerate.targetCalories === fullTargetsModeratelyActive.targetCalories &&
    fullTargetsModerate.proteinG === fullTargetsModeratelyActive.proteinG &&
    fullTargetsModerate.carbsG === fullTargetsModeratelyActive.carbsG &&
    fullTargetsModerate.fatG === fullTargetsModeratelyActive.fatG,
    'Nutrition Targets',
    'Full nutrition targets identical between "moderate" and "moderately active" (3030 kcal, 165g P, 403g C, 84g F)',
    JSON.stringify(fullTargetsModerate)
  );

  // ==========================================================================
  // 2. BUG-AI-01: MEAL CALORIE AGGREGATION & TOLERANCE VALIDATION
  // ==========================================================================
  console.log('\n--- 2. BUG-AI-01: MEAL AGGREGATION & TOLERANCE VALIDATION ---');

  const targets3030 = {
    bmr: 1729,
    tdee: 2680,
    targetCalories: 3030,
    proteinG: 165,
    carbsG: 403,
    fatG: 84
  };

  const customerArjun = {
    name: 'Arjun Mehta',
    age: 24,
    gender: 'male',
    height: 175,
    weight: 75,
    goal: 'Muscle Gain',
    activityLevel: 'moderately active',
    foodPreference: 'Non-Vegetarian',
    favoriteFoods: 'Chicken breast, eggs, rice',
    allergies: 'None',
    language: 'en'
  };

  // Helper to construct a synthetic 7-day plan
  function createSyntheticPlan(dailyMealList) {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      days.push({
        day: i,
        day_name: `Day ${i}`,
        meals: JSON.parse(JSON.stringify(dailyMealList))
      });
    }
    return {
      summary: {
        target_calories: 3030,
        protein_g: 165,
        carbs_g: 403,
        fat_g: 84
      },
      days
    };
  }

  // 2.1 Perfect Matching Plan (~3030 kcal)
  const validMeals3030 = [
    { name: 'Breakfast', calories: 600, protein_g: 35, carbs_g: 80, fat_g: 16, foods: [] },
    { name: 'Morning Snack', calories: 300, protein_g: 15, carbs_g: 40, fat_g: 9, foods: [] },
    { name: 'Lunch', calories: 950, protein_g: 55, carbs_g: 125, fat_g: 27, foods: [] },
    { name: 'Evening Snack', calories: 330, protein_g: 20, carbs_g: 42, fat_g: 9, foods: [] },
    { name: 'Dinner', calories: 850, protein_g: 40, carbs_g: 116, fat_g: 23, foods: [] },
  ];
  // Sum: 600+300+950+330+850 = 3030 kcal; Protein: 35+15+55+20+40 = 165g; Carbs: 80+40+125+42+116 = 403g; Fat: 16+9+27+9+23 = 84g.
  const plan3030Valid = createSyntheticPlan(validMeals3030);
  const valRes3030 = validateDietPlan(plan3030Valid, customerArjun, targets3030);
  assert(valRes3030.valid === true, 'Tolerance Validation', 'Plan matching 3030 kcal target exactly passes validation');
  assert(
    plan3030Valid.days[0].daily_totals.calories === 3030 &&
    plan3030Valid.days[0].daily_totals.protein_g === 165 &&
    plan3030Valid.days[0].daily_totals.carbs_g === 403 &&
    plan3030Valid.days[0].daily_totals.fat_g === 84,
    'Meal Aggregation',
    'daily_totals is accurately aggregated from meal objects (3030 kcal, 165g P, 403g C, 84g F)'
  );

  // 2.2 Low Calorie Plan (~2400 kcal vs 3030 kcal target -> 20.8% deficit -> should REJECT)
  const lowMeals2400 = [
    { name: 'Breakfast', calories: 450, protein_g: 25, carbs_g: 60, fat_g: 12, foods: [] },
    { name: 'Morning Snack', calories: 200, protein_g: 10, carbs_g: 25, fat_g: 6, foods: [] },
    { name: 'Lunch', calories: 750, protein_g: 45, carbs_g: 95, fat_g: 20, foods: [] },
    { name: 'Evening Snack', calories: 250, protein_g: 15, carbs_g: 30, fat_g: 8, foods: [] },
    { name: 'Dinner', calories: 750, protein_g: 40, carbs_g: 95, fat_g: 22, foods: [] },
  ]; // Sum: 2400 kcal
  const plan2400 = createSyntheticPlan(lowMeals2400);
  const valRes2400 = validateDietPlan(plan2400, customerArjun, targets3030);
  assert(
    valRes2400.valid === false && valRes2400.error.includes('total meal calories (2400 kcal)'),
    'Tolerance Validation',
    'Under-caloric plan (2400 kcal vs 3030 target, -20.8%) is strictly rejected',
    valRes2400.error
  );

  // 2.3 Acceptable Boundary Tolerances (e.g. 2900 kcal -> -4.3% -> within ±10% tolerance)
  const boundaryMeals2900 = [
    { name: 'Breakfast', calories: 580, protein_g: 34, carbs_g: 78, fat_g: 15, foods: [] },
    { name: 'Morning Snack', calories: 290, protein_g: 15, carbs_g: 38, fat_g: 9, foods: [] },
    { name: 'Lunch', calories: 900, protein_g: 52, carbs_g: 120, fat_g: 25, foods: [] },
    { name: 'Evening Snack', calories: 310, protein_g: 19, carbs_g: 40, fat_g: 9, foods: [] },
    { name: 'Dinner', calories: 820, protein_g: 38, carbs_g: 110, fat_g: 22, foods: [] },
  ]; // Sum: 2900 kcal (-4.3%), Protein: 158g (-4.2%), Carbs: 386g (-4.2%), Fat: 80g (-4.8%)
  const plan2900 = createSyntheticPlan(boundaryMeals2900);
  const valRes2900 = validateDietPlan(plan2900, customerArjun, targets3030);
  assert(valRes2900.valid === true, 'Tolerance Validation', 'Plan within 5% tolerance (2900 kcal) passes validation');

  // ==========================================================================
  // 3. BUG-AI-02: DIETARY SAFETY & ALLERGEN BLOCKING REJECTIONS
  // ==========================================================================
  console.log('\n--- 3. BUG-AI-02: DIETARY SAFETY & ALLERGEN BLOCKING ---');

  const customerPriya = {
    name: 'Priya Shah',
    foodPreference: 'Vegetarian',
    allergies: 'Peanuts',
    language: 'en'
  };

  const customerNeha = {
    name: 'Neha Patel',
    foodPreference: 'Vegan',
    allergies: 'Dairy',
    language: 'en'
  };

  // 3.1 Meat in Vegetarian Plan
  const vegPlanWithChicken = createSyntheticPlan(validMeals3030);
  vegPlanWithChicken.days[0].meals[2].name = 'Grilled Chicken Breast with Brown Rice';
  const valVegChicken = validateDietPlan(vegPlanWithChicken, customerPriya, targets3030);
  assert(
    valVegChicken.valid === false && valVegChicken.error.includes('Diet preference violation: Found meat item "chicken"'),
    'Dietary Safety',
    'Vegetarian validation strictly rejects chicken inclusion',
    valVegChicken.error
  );

  // 3.2 Eggs in Vegetarian Plan
  const vegPlanWithEgg = createSyntheticPlan(validMeals3030);
  vegPlanWithEgg.days[0].meals[0].name = 'Boiled Eggs and Toast';
  // Note: If eggs are in vegan plan
  const valVeganEgg = validateDietPlan(vegPlanWithEgg, customerNeha, targets3030);
  assert(
    valVeganEgg.valid === false && valVeganEgg.error.includes('Found animal product "egg'),
    'Dietary Safety',
    'Vegan validation strictly rejects egg inclusion',
    valVeganEgg.error
  );

  // 3.3 Dairy (Paneer/Milk/Curd) in Vegan Plan (without allergy specified)
  const customerVeganNoAllergy = {
    name: 'Ananya Deshmukh',
    foodPreference: 'Vegan',
    allergies: 'None',
    language: 'en'
  };
  const veganPlanWithPaneer = createSyntheticPlan(validMeals3030);
  veganPlanWithPaneer.days[1].meals[2].name = 'Palak Paneer with Roti';
  const valVeganPaneer = validateDietPlan(veganPlanWithPaneer, customerVeganNoAllergy, targets3030);
  assert(
    valVeganPaneer.valid === false && valVeganPaneer.error.includes('Found animal product "paneer" in a Vegan plan'),
    'Dietary Safety',
    'Vegan validation strictly rejects paneer/dairy in vegan plan',
    valVeganPaneer.error
  );

  // 3.4 Allergen Blocking Rejection (Peanut in Peanut-Allergic Customer)
  const planWithPeanuts = createSyntheticPlan(validMeals3030);
  planWithPeanuts.days[2].meals[1].name = 'Peanut Butter Whole Wheat Toast';
  const valAllergyPeanut = validateDietPlan(planWithPeanuts, customerPriya, targets3030);
  assert(
    valAllergyPeanut.valid === false && valAllergyPeanut.error.includes('Allergen safety violation'),
    'Allergen Safety',
    'Peanut allergy check strictly blocks and rejects peanut butter inclusion',
    valAllergyPeanut.error
  );

  // 3.5 Allergen Blocking Rejection in Hindi (मूँगफली / सिंगदाना)
  const planWithHindiPeanut = createSyntheticPlan(validMeals3030);
  planWithHindiPeanut.days[3].meals[1].name = 'भुनी हुई मूंगफली और ग्रीन टी';
  const valAllergyHindiPeanut = validateDietPlan(planWithHindiPeanut, customerPriya, targets3030);
  assert(
    valAllergyHindiPeanut.valid === false && valAllergyHindiPeanut.error.includes('Allergen safety violation'),
    'Allergen Safety',
    'Multilingual allergy check blocks Hindi allergen keyword ("मूंगफली")',
    valAllergyHindiPeanut.error
  );

  // 3.6 Beef/Pork Exclusion in Non-Vegetarian by Default
  const planWithBacon = createSyntheticPlan(validMeals3030);
  planWithBacon.days[0].meals[0].name = 'Scrambled Eggs with Crispy Bacon';
  const valBacon = validateDietPlan(planWithBacon, customerArjun, targets3030);
  assert(
    valBacon.valid === false && valBacon.error.includes('Found "bacon". Beef and pork are excluded by default'),
    'Dietary Rules',
    'Non-veg validator excludes pork/bacon by default',
    valBacon.error
  );

  // ==========================================================================
  // 4. BUG-I18N-01: TRANSLATION NAMESPACE DISCREPANCY (dietPlan.* vs plan.*)
  // ==========================================================================
  console.log('\n--- 4. BUG-I18N-01: TRANSLATION NAMESPACE ALIGNMENT ---');

  const testKeyPaths = [
    { dietPlan: 'dietPlan.memberCardTitle', plan: 'plan.memberCardTitle' },
    { dietPlan: 'dietPlan.goalCardTitle', plan: 'plan.goalCardTitle' },
    { dietPlan: 'dietPlan.downloadPdf', plan: 'plan.downloadPdf' },
    { dietPlan: 'dietPlan.headingFull', plan: 'plan.headingFull' },
    { dietPlan: 'dietPlan.blueprintTitle', plan: 'plan.blueprintTitle' },
    { dietPlan: 'dietPlan.dailyTotalLabel', plan: 'plan.dailyTotalLabel' },
  ];

  const languagesToTest = ['en', 'hi', 'gu'];

  for (const lang of languagesToTest) {
    for (const kp of testKeyPaths) {
      const transDietPlan = getTranslation(lang, kp.dietPlan);
      const transPlan = getTranslation(lang, kp.plan);
      assert(
        !!transDietPlan && transDietPlan !== kp.dietPlan && transDietPlan === transPlan,
        `I18n Alignment (${lang})`,
        `${kp.dietPlan} === ${kp.plan} in ${lang} ("${transPlan}")`,
        `dietPlan: ${transDietPlan}, plan: ${transPlan}`
      );
    }
  }

  // 4.1 Test Trilingual Switching: EN -> HI -> GU -> EN
  let enHeading1 = getTranslation('en', 'plan.headingFull');
  let hiHeading = getTranslation('hi', 'plan.headingFull');
  let guHeading = getTranslation('gu', 'plan.headingFull');
  let enHeading2 = getTranslation('en', 'plan.headingFull');

  assert(
    enHeading1 === 'Your 7-Day Personalized Meal Plan' &&
    hiHeading.includes('7-दिवसीय') &&
    guHeading.includes('7-દિવસ') &&
    enHeading1 === enHeading2,
    'Language Switching',
    'Clean trilingual resolution on cycle: EN -> HI -> GU -> EN'
  );

  // ==========================================================================
  // SUMMARY RESULTS
  // ==========================================================================
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`PASSED:      ${testsPassed}`);
  console.log(`FAILED:      ${testsFailed}`);
  console.log(`PASS RATE:   ${((testsPassed / totalTests) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runStage4ETests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
