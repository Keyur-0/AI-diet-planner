/**
 * Scientific Nutrition Calculation Engine
 * Implements Mifflin-St Jeor BMR, TDEE, Goal-Specific Calorie Targets, and Macro Distributions.
 */

/**
 * Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @param {number} age - Age in years
 * @param {string} gender - 'Male' | 'Female' | 'Other'
 * @returns {number} BMR in kcal/day
 */
function calculateBMR(weight, height, age, gender) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  const normalizedGender = (gender || '').toLowerCase();

  if (normalizedGender === 'male') {
    return Math.round(base + 5);
  } else if (normalizedGender === 'female') {
    return Math.round(base - 161);
  } else {
    // Neutral midpoint average
    return Math.round(base - 78);
  }
}

/**
 * Total Daily Energy Expenditure (TDEE) based on activity multiplier
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number} TDEE in kcal/day
 */
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    'sedentary': 1.2,
    'lightly active': 1.375,
    'moderately active': 1.55,
    'very active': 1.725
  };

  const levelKey = (activityLevel || '').toLowerCase().trim();
  const multiplier = multipliers[levelKey] || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate Target Daily Calories based on Goal
 * @param {number} tdee
 * @param {string} goal
 * @param {string} gender
 * @returns {{ targetCalories: number, adjustmentType: string, adjustmentCalories: number }}
 */
function calculateTargetCalories(tdee, goal, gender) {
  const normalizedGoal = (goal || '').toLowerCase();
  let targetCalories = tdee;
  let adjustmentType = 'Maintenance';
  let adjustmentCalories = 0;

  if (normalizedGoal.includes('loss') || normalizedGoal.includes('fat')) {
    // 20% deficit / standard ~500 kcal reduction
    adjustmentCalories = -500;
    targetCalories = tdee - 500;
    adjustmentType = 'Caloric Deficit (-500 kcal)';

    // Safe floor
    const minFloor = (gender || '').toLowerCase() === 'female' ? 1200 : 1500;
    if (targetCalories < minFloor) {
      targetCalories = minFloor;
    }
  } else if (normalizedGoal.includes('gain') || normalizedGoal.includes('muscle') || normalizedGoal.includes('hypertrophy')) {
    // Clean lean bulk surplus (+350 kcal)
    adjustmentCalories = +350;
    targetCalories = tdee + 350;
    adjustmentType = 'Lean Surplus (+350 kcal)';
  }

  return {
    targetCalories: Math.round(targetCalories),
    adjustmentType,
    adjustmentCalories
  };
}

/**
 * Calculate Macro Split (Protein, Carbs, Fat)
 * @param {number} targetCalories
 * @param {number} weight
 * @param {string} goal
 * @returns {{ proteinG: number, carbsG: number, fatG: number, proteinPct: number, carbsPct: number, fatPct: number, proteinKcal: number, carbsKcal: number, fatKcal: number }}
 */
function calculateMacroSplit(targetCalories, weight, goal) {
  const normalizedGoal = (goal || '').toLowerCase();

  // 1. Protein target (g per kg body weight)
  let proteinPerKg = 1.8; // Default maintenance
  if (normalizedGoal.includes('gain') || normalizedGoal.includes('muscle')) {
    proteinPerKg = 2.2;
  } else if (normalizedGoal.includes('loss') || normalizedGoal.includes('fat')) {
    proteinPerKg = 2.0; // Higher protein in deficit to preserve lean mass
  }

  let proteinG = Math.round(weight * proteinPerKg);
  let proteinKcal = proteinG * 4;

  // Cap protein at 40% of total calories for balance
  if (proteinKcal > targetCalories * 0.40) {
    proteinKcal = Math.round(targetCalories * 0.40);
    proteinG = Math.round(proteinKcal / 4);
  }

  // 2. Fat target: 25% of total calories (hormone support & essential fatty acids)
  const fatKcal = Math.round(targetCalories * 0.25);
  const fatG = Math.round(fatKcal / 9);

  // 3. Carbohydrates: remaining calories (energy for workouts & glycogen replenishment)
  const carbsKcal = Math.max(0, targetCalories - proteinKcal - fatKcal);
  const carbsG = Math.round(carbsKcal / 4);

  // Macro percentages
  const proteinPct = Math.round((proteinKcal / targetCalories) * 100);
  const fatPct = Math.round((fatKcal / targetCalories) * 100);
  const carbsPct = Math.max(0, 100 - proteinPct - fatPct);

  return {
    proteinG,
    carbsG,
    fatG,
    proteinKcal,
    carbsKcal,
    fatKcal,
    proteinPct,
    carbsPct,
    fatPct
  };
}

/**
 * Complete Nutrition Engine Calculation
 * @param {{ weight: number, height: number, age: number, gender: string, goal: string, activityLevel: string }} profile
 * @returns {object} Full nutrition targets
 */
function calculateNutritionTargets({ weight, height, age, gender, goal, activityLevel }) {
  const parsedWeight = parseFloat(weight);
  const parsedHeight = parseFloat(height);
  const parsedAge = parseInt(age, 10);

  const bmr = calculateBMR(parsedWeight, parsedHeight, parsedAge, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const { targetCalories, adjustmentType, adjustmentCalories } = calculateTargetCalories(tdee, goal, gender);
  const macros = calculateMacroSplit(targetCalories, parsedWeight, goal);

  return {
    bmr,
    tdee,
    targetCalories,
    adjustmentType,
    adjustmentCalories,
    ...macros
  };
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroSplit,
  calculateNutritionTargets
};
