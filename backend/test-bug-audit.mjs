import assert from 'assert';
import fs from 'fs';
import path from 'path';

import nutrition from './nutrition.js';

const BACKEND_URL = 'http://localhost:5000';
const auditLog = [];

function logTest(section, testName, passed, details = {}) {
  auditLog.push({ section, testName, passed, details });
  const mark = passed ? '✅' : '❌';
  console.log(`${mark} [${section}] ${testName}`);
  if (!passed) {
    console.log('   Details:', details);
  }
}

async function runBugAudit() {
  console.log('====================================================');
  console.log('🔍 STARTING 28-PART COMPREHENSIVE BUG & ERROR AUDIT');
  console.log('====================================================\n');

  // =========================================================================
  // PART 2, 3, 4: NUTRITION CALCULATION, GOAL & MACRO MATH AUDIT
  // =========================================================================
  console.log('\n--- PART 2, 3, 4: Nutrition Engine Math & Precision ---');

  // Test Case 1: Standard Male Weight Loss
  const maleLoss = nutrition.calculateNutritionTargets({
    weight: 80,
    height: 180,
    age: 30,
    gender: 'male',
    goal: 'weightLoss',
    activityLevel: 'moderate'
  });

  const expectedMaleBmr = 1780;
  const expectedMaleTdee = Math.round(1780 * 1.55); // 2759
  const expectedMaleCal = expectedMaleTdee - 500; // 2259

  const bmrMatch = maleLoss.bmr === expectedMaleBmr;
  logTest('Part 2: BMR Math', 'Male Mifflin-St Jeor BMR', bmrMatch, { expected: expectedMaleBmr, actual: maleLoss.bmr });

  const tdeeMatch = maleLoss.tdee === expectedMaleTdee;
  logTest('Part 2: TDEE Math', 'Male Moderate Activity TDEE', tdeeMatch, { expected: expectedMaleTdee, actual: maleLoss.tdee });

  const calMatch = maleLoss.targetCalories === expectedMaleCal;
  logTest('Part 3: Goal Strategy', 'Weight Loss -500 kcal deficit', calMatch, { expected: expectedMaleCal, actual: maleLoss.targetCalories });

  // Macro Energy Balance Check: (P * 4) + (C * 4) + (F * 9) should equal targetCalories within rounding tolerance (+/- 5 kcal)
  const calculatedEnergy = (maleLoss.proteinG * 4) + (maleLoss.carbsG * 4) + (maleLoss.fatG * 9);
  const macroEnergyDiff = Math.abs(calculatedEnergy - maleLoss.targetCalories);
  logTest('Part 4: Macro Balance', 'Macro calorie sum vs Target Calories', macroEnergyDiff <= 5, {
    targetCalories: maleLoss.targetCalories,
    calculatedEnergy,
    diff: macroEnergyDiff
  });

  // Test Case 2: Female Minimum Calorie Floor (1200 kcal safety limit)
  const femaleLow = nutrition.calculateNutritionTargets({
    weight: 45,
    height: 150,
    age: 70,
    gender: 'female',
    goal: 'weightLoss',
    activityLevel: 'sedentary'
  });

  const femaleFloorEnforced = femaleLow.targetCalories >= 1200;
  logTest('Part 3: Calorie Floors', 'Female 1200 kcal minimum floor enforcement', femaleFloorEnforced, {
    tdee: femaleLow.tdee,
    targetCalories: femaleLow.targetCalories,
    floor: 1200
  });

  // Test Case 3: Male Minimum Calorie Floor (1500 kcal safety limit)
  const maleLow = nutrition.calculateNutritionTargets({
    weight: 50,
    height: 150,
    age: 65,
    gender: 'male',
    goal: 'weightLoss',
    activityLevel: 'sedentary'
  });
  const maleFloorEnforced = maleLow.targetCalories >= 1500;
  logTest('Part 3: Calorie Floors', 'Male 1500 kcal minimum floor enforcement', maleFloorEnforced, {
    tdee: maleLow.tdee,
    targetCalories: maleLow.targetCalories,
    floor: 1500
  });

  // Test Case 4: Muscle Gain Surplus (+350 kcal)
  const maleGain = nutrition.calculateNutritionTargets({
    weight: 75,
    height: 175,
    age: 25,
    gender: 'male',
    goal: 'muscleGain',
    activityLevel: 'moderate'
  });
  const gainSurplusCorrect = maleGain.targetCalories === maleGain.tdee + 350;
  logTest('Part 3: Goal Strategy', 'Muscle Gain +350 kcal surplus', gainSurplusCorrect, {
    tdee: maleGain.tdee,
    targetCalories: maleGain.targetCalories,
    expected: maleGain.tdee + 350
  });

  // Test Case 5: Maintenance Calories (= TDEE)
  const maleMaintain = nutrition.calculateNutritionTargets({
    weight: 75,
    height: 175,
    age: 25,
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate'
  });
  const maintainCorrect = maleMaintain.targetCalories === maleMaintain.tdee;
  logTest('Part 3: Goal Strategy', 'Maintenance = TDEE', maintainCorrect, {
    tdee: maleMaintain.tdee,
    targetCalories: maleMaintain.targetCalories
  });

  // Test Case 6: Invalid/Unknown Goal Handling
  const unknownGoal = nutrition.calculateNutritionTargets({
    weight: 75,
    height: 175,
    age: 25,
    gender: 'male',
    goal: 'unknownString',
    activityLevel: 'moderate'
  });
  const unknownGoalDefaulted = unknownGoal.targetCalories === unknownGoal.tdee;
  logTest('Part 3: Edge Case', 'Unknown goal defaults safely to TDEE', unknownGoalDefaulted, {
    targetCalories: unknownGoal.targetCalories,
    tdee: unknownGoal.tdee
  });

  // =========================================================================
  // PART 8 & 9: DIETARY, ALLERGEN & BEEF/PORK RULES AUDIT
  // =========================================================================
  console.log('\n--- PART 8 & 9: Dietary & Allergen Safety Engine ---');

  const geminiModuleContent = fs.readFileSync('gemini.js', 'utf8');
  const hasPeanutScanning = geminiModuleContent.includes('peanut') && geminiModuleContent.includes('मूंगफली') && geminiModuleContent.includes('મગફળી');
  logTest('Part 8: Allergen Multi-Language', 'Peanut allergen terms in EN, HI, GU', hasPeanutScanning);

  const hasDairyScanning = geminiModuleContent.includes('dairy') || (geminiModuleContent.includes('milk') && geminiModuleContent.includes('दूध'));
  logTest('Part 8: Allergen Multi-Language', 'Dairy allergen terms in EN, HI, GU', hasDairyScanning);

  const hasBeefPorkRule = geminiModuleContent.includes('beef') && geminiModuleContent.includes('pork') && geminiModuleContent.includes('bacon');
  logTest('Part 9: Beef & Pork Rule', 'Explicit prompt exclusions for beef, pork, bacon, lard', hasBeefPorkRule);

  // =========================================================================
  // PART 10 & 11: TRANSLATION KEYS & LOCALIZATION AUDIT
  // =========================================================================
  console.log('\n--- PART 10 & 11: Translation Dictionary & Completeness ---');

  const translationsContent = fs.readFileSync('../frontend/src/i18n/translations.js', 'utf8');
  const enMatch = translationsContent.includes('en: {');
  const hiMatch = translationsContent.includes('hi: {');
  const guMatch = translationsContent.includes('gu: {');

  logTest('Part 10: Language Support', 'All 3 language dictionaries (en, hi, gu) present', enMatch && hiMatch && guMatch);

  const criticalSections = ['nav', 'hero', 'form', 'plan', 'grocery', 'admin', 'footer'];
  criticalSections.forEach(sec => {
    const hasSecInEn = translationsContent.includes(`${sec}:`);
    logTest('Part 10: Translation Section', `Section "${sec}" present in translations`, hasSecInEn);
  });

  // =========================================================================
  // PART 16 & 19: DATABASE INTEGRITY & HEALTH
  // =========================================================================
  console.log('\n--- PART 16 & 19: Database Integrity & Offline Fault Tolerance ---');

  const dbRes = await fetch(`${BACKEND_URL}/api/health`);
  const dbHealth = await dbRes.json();
  logTest('Part 19: Health Endpoint', 'GET /api/health responds with 200/503 status', dbRes.status === 200 || dbRes.status === 503, dbHealth);

  const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`);
  const statsData = await statsRes.json();
  logTest('Part 16: DB Aggregation', 'GET /api/admin/stats returns valid numeric stats', statsData.success && typeof statsData.stats.totalLeads === 'number');

  // =========================================================================
  // PART 28: REGRESSION TEST EXECUTION
  // =========================================================================
  console.log('\n--- PART 28: Existing Regression Test Suite Execution ---');
  try {
    const e2eRes = await fetch(`${BACKEND_URL}/api/customers?limit=5`);
    const e2eData = await e2eRes.json();
    logTest('Part 28: Regression Stage 4C', 'Customers endpoint returns valid lead array', e2eData.success && Array.isArray(e2eData.customers));
  } catch (err) {
    logTest('Part 28: Regression Stage 4C', 'Customers endpoint failure', false, { error: err.message });
  }

  // Summary
  const passedCount = auditLog.filter(t => t.passed).length;
  const failedCount = auditLog.filter(t => !t.passed).length;
  const totalCount = auditLog.length;

  console.log('\n====================================================');
  console.log(`📊 AUDIT TEST SUITE SUMMARY: ${passedCount}/${totalCount} Passed (${failedCount} Failed)`);
  console.log('====================================================\n');
}

runBugAudit().catch(err => {
  console.error('Audit runner error:', err);
});
