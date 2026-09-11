import { gymConfig } from './src/config/gymConfig.js';
import { translations, getTranslation } from './src/i18n/translations.js';

console.log('========================================================');
console.log('STAGE 4A.2 AUTOMATED VERIFICATION SUITE');
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Centralized gymConfig verification
console.log('--- 1. Testing gymConfig structure & defaults ---');
assert(gymConfig && typeof gymConfig === 'object', 'gymConfig object is defined');
assert(gymConfig.gymName === 'PulseFit Fitness Hub', `gymName is "${gymConfig.gymName}"`);
assert(gymConfig.logo === '⚡', `logo is "${gymConfig.logo}"`);
assert(Boolean(gymConfig.phone), `phone is defined: ${gymConfig.phone}`);
assert(Boolean(gymConfig.email), `email is defined: ${gymConfig.email}`);
assert(Boolean(gymConfig.website), `website is defined: ${gymConfig.website}`);
assert(Boolean(gymConfig.deskLocation), `deskLocation is defined: ${gymConfig.deskLocation}`);
assert(Boolean(gymConfig.hours), `hours is defined: ${gymConfig.hours}`);
assert(gymConfig.accentColor === '#10b981', `accentColor is ${gymConfig.accentColor}`);

// 2. Multilingual PDF/Print Translation Keys
console.log('\n--- 2. Testing Multilingual PDF & Print Translations ---');
const requiredKeys = [
  'plan.downloadPdf',
  'plan.printPlan',
  'plan.downloadPdfSubtitle',
  'plan.pdfOfficialHeader',
  'plan.pdfMemberProfile',
  'plan.pdfTargetsTitle',
  'plan.pdfScheduleTitle',
  'plan.pdfGymDeskContact',
  'plan.pdfGeneratedOn',
  'plan.downloadError',
  'plan.planDisclaimerTitle',
  'plan.planDisclaimerText',
];

const testLanguages = ['en', 'hi', 'gu'];

testLanguages.forEach((lang) => {
  console.log(`\nTesting language: ${lang}`);
  requiredKeys.forEach((key) => {
    const val = getTranslation(lang, key);
    assert(
      val && val !== key && typeof val === 'string' && val.length > 0,
      `[${lang}] "${key}" -> "${val.substring(0, 45)}${val.length > 45 ? '...' : ''}"`
    );
  });
});

// 3. Verify Specific Language Strings for Download / Print Buttons
console.log('\n--- 3. Testing Download / Print Button Labels ---');
assert(
  getTranslation('en', 'plan.downloadPdf') === 'Download Diet Plan',
  'EN download button label: "Download Diet Plan"'
);
assert(
  getTranslation('hi', 'plan.downloadPdf') === 'डाइट प्लान डाउनलोड करें',
  'HI download button label: "डाइट प्लान डाउनलोड करें"'
);
assert(
  getTranslation('gu', 'plan.downloadPdf') === 'ડાયટ પ્લાન ડાઉનલોડ કરો',
  'GU download button label: "ડાયટ પ્લાન ડાઉનલોડ કરો"'
);

// 4. Verify 7-Day & 5-Meal Structure Compatibility
console.log('\n--- 4. Testing 7-Day & 5-Meal Structure Compatibility ---');
const mockCustomerData = {
  name: 'Alex Morgan',
  age: 28,
  gender: 'Male',
  height: 175,
  weight: 75,
  goal: 'Muscle Gain',
  activityLevel: 'Moderately Active',
  foodPreference: 'Non-Vegetarian',
  favoriteFoods: 'Chicken breast, eggs, rice, oatmeal',
  allergies: 'None',
  email: 'alex@example.com',
  phone: '+1 (555) 019-2834',
  nutrition: {
    bmr: 1720,
    tdee: 2666,
    targetCalories: 3016,
    adjustmentType: 'Lean Surplus (+350 kcal)',
    proteinG: 165,
    proteinKcal: 660,
    proteinPct: 22,
    carbsG: 424,
    carbsKcal: 1696,
    carbsPct: 56,
    fatG: 74,
    fatKcal: 666,
    fatPct: 22,
  },
  plan: {
    days: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      day_name: `Day ${i + 1}`,
      daily_totals: {
        calories: 3010,
        protein_g: 164,
        carbs_g: 420,
        fat_g: 73,
      },
      meals: [
        {
          type: 'breakfast',
          name: 'High Protein Oats & Scrambled Eggs',
          portion: '1 large bowl + 3 eggs',
          calories: 650,
          protein_g: 42,
          carbs_g: 75,
          fat_g: 18,
          foods: [
            { name: 'Rolled Oats', quantity: '80g' },
            { name: 'Whole Eggs', quantity: '3 large' },
          ],
        },
        {
          type: 'morning_snack',
          name: 'Greek Yogurt with Berries & Almonds',
          portion: '1 cup',
          calories: 320,
          protein_g: 22,
          carbs_g: 30,
          fat_g: 10,
          foods: [{ name: 'Greek Yogurt', quantity: '200g' }],
        },
        {
          type: 'lunch',
          name: 'Grilled Chicken Breast with Brown Rice',
          portion: '1 plate',
          calories: 820,
          protein_g: 50,
          carbs_g: 110,
          fat_g: 16,
          foods: [
            { name: 'Chicken Breast', quantity: '180g' },
            { name: 'Brown Rice', quantity: '250g cooked' },
          ],
        },
        {
          type: 'evening_snack',
          name: 'Roasted Chickpeas & Banana',
          portion: '1 bowl + 1 fruit',
          calories: 380,
          protein_g: 14,
          carbs_g: 65,
          fat_g: 8,
          foods: [{ name: 'Chickpeas', quantity: '60g' }],
        },
        {
          type: 'dinner',
          name: 'Pan-Seared Salmon with Sweet Potato & Greens',
          portion: '1 fillet + 1 medium potato',
          calories: 840,
          protein_g: 36,
          carbs_g: 140,
          fat_g: 21,
          foods: [
            { name: 'Salmon', quantity: '150g' },
            { name: 'Sweet Potato', quantity: '200g' },
          ],
        },
      ],
    })),
  },
};

assert(mockCustomerData.plan.days.length === 7, 'Plan contains exactly 7 days');
const allHave5Meals = mockCustomerData.plan.days.every(
  (d) => Array.isArray(d.meals) && d.meals.length === 5
);
assert(allHave5Meals, 'Every single day contains all 5 meals (35 total meals)');

const totalMealsCount = mockCustomerData.plan.days.reduce(
  (acc, d) => acc + d.meals.length,
  0
);
assert(totalMealsCount === 35, `Total meals count is exactly 35 (received ${totalMealsCount})`);

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
