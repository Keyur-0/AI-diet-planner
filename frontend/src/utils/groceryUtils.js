/**
 * Consolidated 7-Day Grocery Shopping List Utilities
 * 
 * Extracts, normalizes, aggregates, and categorizes ingredients
 * from the 7-day meal plan without calling Gemini or mutating the database.
 */

export const GROCERY_CATEGORIES = [
  { id: 'proteins', icon: '🍗', translationKey: 'grocery.categories.proteins' },
  { id: 'produce', icon: '🥦', translationKey: 'grocery.categories.produce' },
  { id: 'grains', icon: '🍚', translationKey: 'grocery.categories.grains' },
  { id: 'dairy', icon: '🥛', translationKey: 'grocery.categories.dairy' },
  { id: 'nuts_seeds', icon: '🥜', translationKey: 'grocery.categories.nuts_seeds' },
  { id: 'oils_condiments', icon: '🫒', translationKey: 'grocery.categories.oils_condiments' },
  { id: 'other', icon: '🛒', translationKey: 'grocery.categories.other' },
];

const CATEGORY_KEYWORDS = {
  proteins: [
    'chicken', 'turkey', 'fish', 'salmon', 'tuna', 'tilapia', 'cod', 'egg', 'eggs', 'egg white', 'egg whites',
    'shrimp', 'prawn', 'prawns', 'mutton', 'goat', 'tofu', 'paneer', 'soya', 'soy', 'edamame', 'lentil',
    'lentils', 'dal', 'daal', 'chickpea', 'chickpeas', 'chana', 'rajma', 'bean', 'beans', 'whey', 'protein',
    'protein powder', 'seitan', 'tempeh', 'चिकन', 'अंडा', 'अंडे', 'मछली', 'पनीर', 'सोया', 'दाल', 'चना',
    'राजमा', 'छोले', 'मटन', 'ચિકન', 'ઈંડા', 'ઈંડું', 'માછલી', 'પનીર', 'સોયા', 'દાળ', 'ચણા', 'રાજમા', 'કઠોળ'
  ],
  produce: [
    'apple', 'apples', 'banana', 'bananas', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
    'spinach', 'broccoli', 'carrot', 'carrots', 'tomato', 'tomatoes', 'onion', 'onions', 'cucumber',
    'potato', 'potatoes', 'sweet potato', 'sweet potatoes', 'capsicum', 'bell pepper', 'lettuce', 'cabbage',
    'cauliflower', 'garlic', 'ginger', 'lemon', 'orange', 'avocado', 'greens', 'salad', 'mushroom',
    'mushrooms', 'zucchini', 'palak', 'methi', 'bhindi', 'gobhi', 'pyaaz', 'aloo', 'tamatar', 'sebb',
    'kela', 'सेब', 'केला', 'पालक', 'ब्रोकली', 'गाजर', 'टमाटर', 'प्याज', 'खीरा', 'आलू', 'अदरक', 'लहसुन',
    'नींबू', 'ફળ', 'શાકભાજી', 'સફરજન', 'કેળું', 'પાલક', 'બ્રોકોલી', 'ગાજર', 'ટામેટાં', 'ડુંગળી', 'કાકડી',
    'બટાકા', 'શક્કરિયા', 'આદુ', 'લસણ', 'લીંબુ'
  ],
  grains: [
    'oat', 'oats', 'oatmeal', 'rolled oats', 'rice', 'brown rice', 'white rice', 'basmati', 'quinoa',
    'wheat', 'whole wheat', 'bread', 'roti', 'chapati', 'tortilla', 'pasta', 'noodle', 'noodles', 'poha',
    'upma', 'daliya', 'atta', 'flour', 'besan', 'suji', 'semolina', 'paratha', 'ओट्स', 'दलिया', 'चावल',
    'रोटी', 'चपाती', 'पोहा', 'उपमा', 'गेहूं', 'आटा', 'ब्रेड', 'ઓટ્સ', 'ચોખા', 'ભાત', 'રોટલી', 'ભાખરી',
    'પૌંઆ', 'ઉપમા', 'ઘઉં', 'લોટ', 'બ્રેડ'
  ],
  dairy: [
    'milk', 'skim milk', 'whole milk', 'almond milk', 'soy milk', 'oat milk', 'yogurt', 'greek yogurt',
    'curd', 'dahi', 'buttermilk', 'chaas', 'cheese', 'cottage cheese', 'lassi', 'cream', 'दूध', 'दही',
    'छाछ', 'मलाई', 'चीઝ', 'દૂધ', 'દહીં', 'છાશ', 'માખણ', 'મલાઈ', 'ચીઝ'
  ],
  nuts_seeds: [
    'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'peanut', 'peanuts', 'peanut butter',
    'chia', 'chia seed', 'chia seeds', 'flax', 'flax seed', 'flax seeds', 'pumpkin seed', 'pumpkin seeds',
    'sunflower seed', 'sunflower seeds', 'pistachio', 'pistachios', 'badam', 'kaju', 'akhrot', 'बादाम',
    'काजू', 'अखरोट', 'मूंगफली', 'चिया', 'अलसी', 'તલ', 'બદામ', 'કાજુ', 'અખરોટ', 'સીંગદાણા', 'મગફળી',
    'ચિયા', 'અળસી'
  ],
  oils_condiments: [
    'oil', 'olive oil', 'coconut oil', 'mustard oil', 'sesame oil', 'ghee', 'butter', 'mustard', 'pepper',
    'black pepper', 'turmeric', 'cumin', 'salt', 'honey', 'maple syrup', 'vinegar', 'apple cider vinegar',
    'soy sauce', 'spice', 'spices', 'masala', 'cinnamon', 'cardamom', 'oregano', 'तेल', 'घी', 'हल्दी',
    'जीरा', 'नमक', 'शहद', 'सिरका', 'मसाले', 'તેલ', 'ઘી', 'હળદર', 'જીરું', 'મીઠું', 'મધ', 'વિનેગર', 'મસાલા'
  ],
};

/**
 * Categorizes an ingredient based on multilingual keyword matching.
 */
export function categorizeIngredient(name = '') {
  const lower = name.toLowerCase().trim();
  if (!lower) return 'other';

  // Check each category in prioritized order
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return category;
      }
    }
  }

  return 'other';
}

/**
 * Normalizes an ingredient name (trims, standardizes case, strips bullet points).
 */
export function normalizeIngredientName(name = '') {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/^[\s•\-\*]+/, '')
    .trim();
}

/**
 * Parses a quantity string into structured value and unit.
 * Examples:
 *   "150g" -> { value: 150, unit: 'g', type: 'weight_g' }
 *   "1.5 kg" -> { value: 1500, unit: 'g', type: 'weight_g' }
 *   "250 ml" -> { value: 250, unit: 'ml', type: 'volume_ml' }
 *   "1 L" -> { value: 1000, unit: 'ml', type: 'volume_ml' }
 *   "3 eggs" -> { value: 3, unit: 'eggs', type: 'count' }
 *   "1 cup" -> { value: 1, unit: 'cup', type: 'count' }
 *   "1 serving" -> { value: 1, unit: 'serving', type: 'count' }
 */
export function parseQuantity(qtyString = '') {
  if (!qtyString || typeof qtyString !== 'string') {
    return { raw: qtyString || '', parsed: false };
  }

  const cleaned = qtyString.trim();

  // Pattern: number (integer or decimal) followed by optional space and unit string
  const match = cleaned.match(/^([\d]+(?:\.[\d]+)?)\s*(.*)$/i);
  if (!match) {
    return { raw: cleaned, parsed: false };
  }

  const num = parseFloat(match[1]);
  if (isNaN(num)) {
    return { raw: cleaned, parsed: false };
  }

  const unitRaw = (match[2] || '').trim().toLowerCase();

  // 1. Metric Weight (Standardize to grams)
  if (/^(g|gm|gms|gram|grams|ग्राम|ગ્રામ)$/i.test(unitRaw)) {
    return { value: num, unit: 'g', type: 'weight_g', raw: cleaned, parsed: true };
  }
  if (/^(kg|kgs|kilogram|kilograms|किलो|કિલો)$/i.test(unitRaw)) {
    return { value: num * 1000, unit: 'g', type: 'weight_g', raw: cleaned, parsed: true };
  }

  // 2. Metric Volume (Standardize to milliliters)
  if (/^(ml|milliliter|milliliters|मिली|મિલી)$/i.test(unitRaw)) {
    return { value: num, unit: 'ml', type: 'volume_ml', raw: cleaned, parsed: true };
  }
  if (/^(l|liter|liters|litre|litres|लीटर|લીટર)$/i.test(unitRaw)) {
    return { value: num * 1000, unit: 'ml', type: 'volume_ml', raw: cleaned, parsed: true };
  }

  // 3. Normalized Count Units (e.g., eggs, slices, pieces, bananas, scoops, cups, tbsp, tsp)
  if (unitRaw) {
    let normalizedUnit = unitRaw;
    if (/^(egg|eggs|अंडे|अंडा|ઈંડા|ઈંડું)$/i.test(unitRaw)) normalizedUnit = 'eggs';
    else if (/^(piece|pieces|ટુકડા|टुकड़े)$/i.test(unitRaw)) normalizedUnit = 'pieces';
    else if (/^(slice|slices)$/i.test(unitRaw)) normalizedUnit = 'slices';
    else if (/^(serving|servings|सर्विंग|સર્વિંગ)$/i.test(unitRaw)) normalizedUnit = 'serving';
    else if (/^(scoop|scoops)$/i.test(unitRaw)) normalizedUnit = 'scoops';
    else if (/^(cup|cups|कप|કપ)$/i.test(unitRaw)) normalizedUnit = 'cup';
    else if (/^(tbsp|tablespoon|tablespoons)$/i.test(unitRaw)) normalizedUnit = 'tbsp';
    else if (/^(tsp|teaspoon|teaspoons)$/i.test(unitRaw)) normalizedUnit = 'tsp';
    else if (/^(bowl|bowls|कटोरी|વાટકી)$/i.test(unitRaw)) normalizedUnit = 'bowl';

    return { value: num, unit: normalizedUnit, type: `count_${normalizedUnit}`, raw: cleaned, parsed: true };
  }

  // If only number without unit
  return { value: num, unit: '', type: 'count_unspecified', raw: cleaned, parsed: true };
}

/**
 * Formats a normalized quantity amount back into a clean readable string.
 */
export function formatAggregatedQuantity(bucket) {
  const parts = [];

  // Weight (grams / kg)
  if (bucket.weight_g && bucket.weight_g > 0) {
    if (bucket.weight_g >= 1000) {
      const kgVal = (bucket.weight_g / 1000).toFixed(2).replace(/\.00$|0$/, '');
      parts.push(`${kgVal} kg`);
    } else {
      parts.push(`${Math.round(bucket.weight_g)} g`);
    }
  }

  // Volume (ml / L)
  if (bucket.volume_ml && bucket.volume_ml > 0) {
    if (bucket.volume_ml >= 1000) {
      const lVal = (bucket.volume_ml / 1000).toFixed(2).replace(/\.00$|0$/, '');
      parts.push(`${lVal} L`);
    } else {
      parts.push(`${Math.round(bucket.volume_ml)} ml`);
    }
  }

  // Count units
  if (bucket.counts && typeof bucket.counts === 'object') {
    for (const [unit, count] of Object.entries(bucket.counts)) {
      if (count > 0) {
        const roundedCount = Number.isInteger(count) ? count : parseFloat(count.toFixed(1));
        if (unit) {
          parts.push(`${roundedCount} ${unit}`);
        } else {
          parts.push(`${roundedCount}`);
        }
      }
    }
  }

  // Unparsed raw quantities
  if (Array.isArray(bucket.rawItems) && bucket.rawItems.length > 0) {
    bucket.rawItems.forEach((r) => {
      if (r && !parts.includes(r)) {
        parts.push(r);
      }
    });
  }

  return parts.length > 0 ? parts.join(' + ') : 'As needed';
}

/**
 * Extracts and consolidates ingredients from all 7 days of the diet plan.
 * Returns an array of category groups with consolidated grocery items.
 * 
 * @param {object} plan - The 7-day diet plan object
 * @returns {Array<{ id: string, icon: string, translationKey: string, items: Array }>}
 */
export function generateGroceryList(plan) {
  if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
    return GROCERY_CATEGORIES.map(cat => ({ ...cat, items: [] }));
  }

  // Map of normalized food key -> item record
  // Key format: lowercase normalized name
  const itemsMap = new Map();

  plan.days.forEach((day, dIdx) => {
    const dayNum = day.day || dIdx + 1;
    const meals = Array.isArray(day.meals) ? day.meals : [];

    meals.forEach((meal) => {
      const foods = Array.isArray(meal.foods) && meal.foods.length > 0
        ? meal.foods
        : [{ name: meal.name, quantity: meal.portion || '' }];

      foods.forEach((food) => {
        const rawName = food?.name || '';
        const normName = normalizeIngredientName(rawName);
        if (!normName) return;

        const lookupKey = normName.toLowerCase();
        const rawQty = food?.quantity || '';
        const parsed = parseQuantity(rawQty);

        if (!itemsMap.has(lookupKey)) {
          const category = categorizeIngredient(normName);
          itemsMap.set(lookupKey, {
            id: `grocery-${lookupKey.replace(/[^a-z0-9\u0900-\u0AFF]/gi, '-').toLowerCase()}`,
            name: normName,
            category,
            daysAppearing: new Set([dayNum]),
            bucket: {
              weight_g: 0,
              volume_ml: 0,
              counts: {},
              rawItems: [],
            },
          });
        }

        const entry = itemsMap.get(lookupKey);
        entry.daysAppearing.add(dayNum);

        // Aggregate quantity safely
        if (parsed.parsed) {
          if (parsed.type === 'weight_g') {
            entry.bucket.weight_g += parsed.value;
          } else if (parsed.type === 'volume_ml') {
            entry.bucket.volume_ml += parsed.value;
          } else if (parsed.type.startsWith('count_')) {
            const u = parsed.unit || '';
            entry.bucket.counts[u] = (entry.bucket.counts[u] || 0) + parsed.value;
          }
        } else if (parsed.raw) {
          entry.bucket.rawItems.push(parsed.raw);
        }
      });
    });
  });

  // Convert map to consolidated items array with formatted quantities
  const allConsolidatedItems = Array.from(itemsMap.values()).map((entry) => {
    const formattedQuantity = formatAggregatedQuantity(entry.bucket);
    const daysCount = entry.daysAppearing.size;
    return {
      id: entry.id,
      name: entry.name,
      category: entry.category,
      quantity: formattedQuantity,
      daysCount,
      daysList: Array.from(entry.daysAppearing).sort((a, b) => a - b),
    };
  });

  // Group by category
  const categorizedList = GROCERY_CATEGORIES.map((cat) => {
    const items = allConsolidatedItems
      .filter((item) => item.category === cat.id)
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      ...cat,
      items,
    };
  });

  return categorizedList;
}

/**
 * Returns total items count across all categories.
 */
export function getTotalGroceryCount(categorizedList = []) {
  return categorizedList.reduce((acc, cat) => acc + (cat.items ? cat.items.length : 0), 0);
}
