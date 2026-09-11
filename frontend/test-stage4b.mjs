import {
  parseQuantity,
  categorizeIngredient,
  formatAggregatedQuantity,
  generateGroceryList,
  getTotalGroceryCount,
  GROCERY_CATEGORIES,
} from './src/utils/groceryUtils.js';
import { translations, getTranslation } from './src/i18n/translations.js';

console.log('========================================================');
console.log('STAGE 4B AUTOMATED VERIFICATION SUITE — GROCERY LIST');
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

// 1. Testing Quantity Parsing
console.log('--- 1. Testing Quantity Parsing Engine ---');
const q1 = parseQuantity('150g');
assert(q1.parsed && q1.value === 150 && q1.unit === 'g', '150g -> 150 g');

const q2 = parseQuantity('1.5 kg');
assert(q2.parsed && q2.value === 1500 && q2.unit === 'g', '1.5 kg -> 1500 g');

const q3 = parseQuantity('250 ml');
assert(q3.parsed && q3.value === 250 && q3.unit === 'ml', '250 ml -> 250 ml');

const q4 = parseQuantity('1 L');
assert(q4.parsed && q4.value === 1000 && q4.unit === 'ml', '1 L -> 1000 ml');

const q5 = parseQuantity('3 eggs');
assert(q5.parsed && q5.value === 3 && q5.unit === 'eggs', '3 eggs -> 3 eggs');

const q6 = parseQuantity('1 cup');
assert(q6.parsed && q6.value === 1 && q6.unit === 'cup', '1 cup -> 1 cup');

const q7 = parseQuantity('200 ग्राम');
assert(q7.parsed && q7.value === 200 && q7.unit === 'g', '200 ग्राम (HI) -> 200 g');

const q8 = parseQuantity('150 ગ્રામ');
assert(q8.parsed && q8.value === 150 && q8.unit === 'g', '150 ગ્રામ (GU) -> 150 g');

// 2. Testing Multilingual Category Classification
console.log('\n--- 2. Testing Multilingual Categorization ---');
assert(categorizeIngredient('Chicken Breast') === 'proteins', '"Chicken Breast" -> proteins');
assert(categorizeIngredient('ચિકન બ્રેસ્ટ') === 'proteins', '"ચિકન બ્રેસ્ટ" (GU) -> proteins');
assert(categorizeIngredient('अंडे') === 'proteins', '"अंडे" (HI) -> proteins');
assert(categorizeIngredient('Tofu') === 'proteins', '"Tofu" -> proteins');
assert(categorizeIngredient('Paneer') === 'proteins', '"Paneer" -> proteins');

assert(categorizeIngredient('Rolled Oats') === 'grains', '"Rolled Oats" -> grains');
assert(categorizeIngredient('Brown Rice') === 'grains', '"Brown Rice" -> grains');
assert(categorizeIngredient('ઓટ્સ') === 'grains', '"ઓટ્સ" (GU) -> grains');
assert(categorizeIngredient('चावल') === 'grains', '"चावल" (HI) -> grains');

assert(categorizeIngredient('Spinach') === 'produce', '"Spinach" -> produce');
assert(categorizeIngredient('Sweet Potato') === 'produce', '"Sweet Potato" -> produce');
assert(categorizeIngredient('पालक') === 'produce', '"पालक" (HI) -> produce');
assert(categorizeIngredient('સફરજન') === 'produce', '"સફરજન" (GU) -> produce');

assert(categorizeIngredient('Greek Yogurt') === 'dairy', '"Greek Yogurt" -> dairy');
assert(categorizeIngredient('दूध') === 'dairy', '"दूध" (HI) -> dairy');
assert(categorizeIngredient('દહીં') === 'dairy', '"દહીં" (GU) -> dairy');

assert(categorizeIngredient('Almonds') === 'nuts_seeds', '"Almonds" -> nuts_seeds');
assert(categorizeIngredient('Chia Seeds') === 'nuts_seeds', '"Chia Seeds" -> nuts_seeds');
assert(categorizeIngredient('બદામ') === 'nuts_seeds', '"બદામ" (GU) -> nuts_seeds');

assert(categorizeIngredient('Olive Oil') === 'oils_condiments', '"Olive Oil" -> oils_condiments');
assert(categorizeIngredient('हल्दी') === 'oils_condiments', '"हल्दी" (HI) -> oils_condiments');
assert(categorizeIngredient('જીરું') === 'oils_condiments', '"જીરું" (GU) -> oils_condiments');

assert(categorizeIngredient('Electrolyte Powder') === 'other', '"Electrolyte Powder" -> other');

// 3. Testing Safe Aggregation Logic
console.log('\n--- 3. Testing Safe Aggregation & Unit Compatibility ---');
// Metric weight aggregation: 150g + 200g + 150g = 500g
const bucketA = { weight_g: 500, volume_ml: 0, counts: {}, rawItems: [] };
assert(formatAggregatedQuantity(bucketA) === '500 g', '150g + 200g + 150g = "500 g"');

// Metric weight over 1kg: 800g + 700g = 1.5 kg
const bucketB = { weight_g: 1500, volume_ml: 0, counts: {}, rawItems: [] };
assert(formatAggregatedQuantity(bucketB) === '1.5 kg', '800g + 700g = "1.5 kg"');

// Metric volume aggregation: 500ml + 500ml = 1 L
const bucketC = { weight_g: 0, volume_ml: 1000, counts: {}, rawItems: [] };
assert(formatAggregatedQuantity(bucketC) === '1 L', '500ml + 500ml = "1 L"');

// Count unit aggregation: 3 eggs + 3 eggs = 6 eggs
const bucketD = { weight_g: 0, volume_ml: 0, counts: { eggs: 6 }, rawItems: [] };
assert(formatAggregatedQuantity(bucketD) === '6 eggs', '3 eggs + 3 eggs = "6 eggs"');

// Mixed incompatible units: 150g + 1 cup -> "150 g + 1 cup" (Never lossy conversions)
const bucketE = { weight_g: 150, volume_ml: 0, counts: { cup: 1 }, rawItems: [] };
assert(formatAggregatedQuantity(bucketE) === '150 g + 1 cup', '150g + 1 cup -> "150 g + 1 cup"');

// 4. Testing Full 7-Day Plan Aggregation
console.log('\n--- 4. Testing Full 7-Day Plan Aggregation ---');
const samplePlan = {
  days: [
    {
      day: 1,
      meals: [
        { name: 'Breakfast', foods: [{ name: 'Chicken Breast', quantity: '150g' }, { name: 'Rolled Oats', quantity: '80g' }] },
        { name: 'Lunch', foods: [{ name: 'Brown Rice', quantity: '200g' }, { name: 'Chicken Breast', quantity: '200g' }] },
      ],
    },
    {
      day: 2,
      meals: [
        { name: 'Breakfast', foods: [{ name: 'Rolled Oats', quantity: '80g' }, { name: 'Whole Eggs', quantity: '3 eggs' }] },
        { name: 'Dinner', foods: [{ name: 'Chicken Breast', quantity: '150g' }, { name: 'Spinach', quantity: '100g' }] },
      ],
    },
    {
      day: 3,
      meals: [
        { name: 'Lunch', foods: [{ name: 'Brown Rice', quantity: '1 cup' }] },
      ],
    },
  ],
};

const groceryList = generateGroceryList(samplePlan);
const totalCount = getTotalGroceryCount(groceryList);
assert(totalCount > 0, `Total items derived: ${totalCount}`);

// Find Chicken Breast
const proteinCat = groceryList.find(c => c.id === 'proteins');
const chickenItem = proteinCat.items.find(i => i.name.toLowerCase().includes('chicken'));
assert(chickenItem !== undefined, 'Chicken Breast found in proteins category');
assert(chickenItem.quantity === '500 g', `Chicken aggregated quantity is 500 g (got "${chickenItem.quantity}")`);
assert(chickenItem.daysCount === 2, `Chicken appears across 2 days (got ${chickenItem.daysCount})`);

// Find Rolled Oats
const grainCat = groceryList.find(c => c.id === 'grains');
const oatsItem = grainCat.items.find(i => i.name.toLowerCase().includes('oat'));
assert(oatsItem !== undefined, 'Rolled Oats found in grains category');
assert(oatsItem.quantity === '160 g', `Oats aggregated quantity is 160 g (got "${oatsItem.quantity}")`);

// Find Brown Rice with incompatible units (200g + 1 cup)
const riceItem = grainCat.items.find(i => i.name.toLowerCase().includes('rice'));
assert(riceItem !== undefined, 'Brown Rice found in grains category');
assert(riceItem.quantity === '200 g + 1 cup', `Incompatible units safely preserved as "200 g + 1 cup" (got "${riceItem.quantity}")`);

// 5. Testing Translations for All Languages
console.log('\n--- 5. Testing Translations for Grocery List (EN, HI, GU) ---');
const requiredGroceryKeys = [
  'grocery.title',
  'grocery.subtitle',
  'grocery.viewButton',
  'grocery.backToPlan',
  'grocery.progressTitle',
  'grocery.progressStats',
  'grocery.uncheckAll',
  'grocery.clearChecked',
  'grocery.printList',
  'grocery.printListTooltip',
  'grocery.categories.proteins',
  'grocery.categories.produce',
  'grocery.categories.grains',
  'grocery.categories.dairy',
  'grocery.categories.nuts_seeds',
  'grocery.categories.oils_condiments',
  'grocery.categories.other',
  'grocery.noItems',
  'grocery.allItemsPurchased',
  'grocery.daysTag',
  'grocery.pdfOfficialHeader',
  'grocery.pdfSubtitle',
];

['en', 'hi', 'gu'].forEach((lang) => {
  console.log(`\nTesting translations for: ${lang}`);
  requiredGroceryKeys.forEach((key) => {
    const val = getTranslation(lang, key, { checked: 5, total: 10, pct: 50, count: 7 });
    assert(
      val && val !== key && typeof val === 'string' && val.length > 0,
      `[${lang}] "${key}" -> "${val.substring(0, 45)}${val.length > 45 ? '...' : ''}"`
    );
  });
});

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
