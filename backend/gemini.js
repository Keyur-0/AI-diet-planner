const { GoogleGenAI } = require('@google/genai');

/**
 * Allergen multilingual dictionary mapping allergen categories to English, Hindi, and Gujarati search terms.
 */
const ALLERGEN_DICTIONARY = {
  peanut: ['peanut', 'peanuts', 'peanut butter', 'groundnut', 'मूंगफली', 'सिंगदाना', 'મગફળી', 'સીંગદાણા', 'સીંગ'],
  dairy: ['milk', 'dairy', 'lactose', 'cheese', 'yogurt', 'curd', 'paneer', 'butter', 'cream', 'whey', 'दूध', 'दही', 'पनीर', 'मक्खन', 'मलाई', 'छाछ', 'દૂધ', 'દહીં', 'પનીર', 'માખણ', 'મલાઈ', 'છાશ'],
  lactose: ['milk', 'dairy', 'lactose', 'cheese', 'yogurt', 'curd', 'paneer', 'butter', 'cream', 'whey', 'दूध', 'दही', 'पनीर', 'मक्खन', 'मलाई', 'छाछ', 'દૂધ', 'દહીં', 'પનીર', 'માખણ', 'મલાઈ', 'છાશ'],
  gluten: ['gluten', 'wheat', 'maida', 'barley', 'rye', 'गेंहू', 'गेहूं', 'मैदा', 'जौ', 'ઘઉં', 'મેંદો', 'જવ'],
  wheat: ['wheat', 'gluten', 'maida', 'atta', 'गेंहू', 'गेहूं', 'मैदा', 'आटा', 'ઘઉં', 'મેંદો', 'લોટ'],
  soy: ['soy', 'soya', 'tofu', 'soy milk', 'edamame', 'सोया', 'सोयाबीन', 'ટોફુ', 'સોયા', 'સોયાબીન'],
  egg: ['egg', 'eggs', 'albumin', 'अंडा', 'अंडे', 'ઈંડું', 'ઈંડા'],
  shellfish: ['shellfish', 'prawn', 'prawns', 'shrimp', 'crab', 'lobster', 'झींगा', 'केकड़ा', 'ઝીંગા', 'કરચલો'],
  fish: ['fish', 'tuna', 'salmon', 'cod', 'tilapia', 'मछली', 'सुरमई', 'रोहू', 'માછલી', 'સુરમઈ'],
  nuts: ['nuts', 'tree nuts', 'cashew', 'almond', 'walnut', 'pistachio', 'काजू', 'बादाम', 'अखरोट', 'पिस्ता', 'કાજુ', 'બદામ', 'અખરોટ', 'પિસ્તા'],
};

/**
 * Validates the generated AI meal plan structure, nutrient numbers, allergies, and diet preferences across English, Hindi, and Gujarati.
 * @param {object} plan - Parsed JSON plan
 * @param {object} customer - Customer intake profile
 * @param {object} nutritionTargets - Authoritative calculated nutrition targets
 * @returns {{ valid: boolean, error?: string }}
 */
function validateDietPlan(plan, customer, nutritionTargets) {
  if (!plan || typeof plan !== 'object') {
    return { valid: false, error: 'AI response is not a valid JSON object.' };
  }

  // 1. Verify summary exists
  if (!plan.summary || typeof plan.summary !== 'object') {
    return { valid: false, error: 'AI response missing "summary" object.' };
  }

  // 2. Verify days array of exactly 7 days
  if (!Array.isArray(plan.days) || plan.days.length !== 7) {
    return { valid: false, error: `AI response must contain exactly 7 days, but got ${plan.days ? plan.days.length : 0}.` };
  }

  // 3. Verify each day and meal structure
  for (let d = 0; d < plan.days.length; d++) {
    const day = plan.days[d];
    if (!day || typeof day !== 'object') {
      return { valid: false, error: `Invalid day object at index ${d}.` };
    }

    if (!Array.isArray(day.meals) || day.meals.length < 5) {
      return { valid: false, error: `Day ${d + 1} must contain at least 5 structured meals.` };
    }

    for (let m = 0; m < day.meals.length; m++) {
      const meal = day.meals[m];
      if (!meal.name || typeof meal.name !== 'string') {
        return { valid: false, error: `Day ${d + 1}, Meal ${m + 1} is missing a name.` };
      }

      if (typeof meal.calories !== 'number' || isNaN(meal.calories)) {
        return { valid: false, error: `Day ${d + 1}, Meal "${meal.name}" has invalid calories.` };
      }
      if (typeof meal.protein_g !== 'number' || isNaN(meal.protein_g)) {
        return { valid: false, error: `Day ${d + 1}, Meal "${meal.name}" has invalid protein_g.` };
      }
      if (typeof meal.carbs_g !== 'number' || isNaN(meal.carbs_g)) {
        return { valid: false, error: `Day ${d + 1}, Meal "${meal.name}" has invalid carbs_g.` };
      }
      if (typeof meal.fat_g !== 'number' || isNaN(meal.fat_g)) {
        return { valid: false, error: `Day ${d + 1}, Meal "${meal.name}" has invalid fat_g.` };
      }

      if (!Array.isArray(meal.foods)) {
        meal.foods = [];
      }
    }
  }

  const fullPlanText = JSON.stringify(plan).toLowerCase();

  // 4. Multilingual Allergy Safety Check
  const allergiesStr = (customer.allergies || '').toLowerCase().trim();
  if (allergiesStr && allergiesStr !== 'none' && allergiesStr !== 'none specified' && allergiesStr !== 'કોઈ નહીં' && allergiesStr !== 'कोई नहीं') {
    const allergenRawList = allergiesStr
      .split(/[,;/+]+/)
      .map((a) => a.trim())
      .filter((a) => a.length >= 2);

    // Expand allergen list with known multilingual terms
    const searchTerms = new Set();
    for (const raw of allergenRawList) {
      searchTerms.add(raw);
      for (const [key, terms] of Object.entries(ALLERGEN_DICTIONARY)) {
        if (raw.includes(key) || terms.some(t => raw.includes(t.toLowerCase()))) {
          terms.forEach(term => searchTerms.add(term.toLowerCase()));
        }
      }
    }

    for (const term of searchTerms) {
      if (term.length > 2 && fullPlanText.includes(term)) {
        console.warn(`⚠️ Warning: Potential allergen keyword "${term}" detected in generated meal plan.`);
      }
    }
  }

  // 5. Multilingual Diet Preference Check
  const pref = (customer.foodPreference || customer.diet_preference || '').toLowerCase().trim();

  const isVegetarian = pref.includes('veg') && !pref.includes('non');
  const isVegan = pref.includes('vegan') || pref.includes('વીગન') || pref.includes('विगन');

  if (isVegetarian || isVegan) {
    const meatKeywords = [
      // English
      'chicken', 'beef', 'pork', 'turkey', 'tuna', 'salmon', 'steak', 'bacon', 'shrimp', 'lamb', 'tilapia', 'mutton', 'fish', 'prawn', 'crab', 'seafood',
      // Hindi
      'चिकन', 'मटन', 'गोश्त', 'मछली', 'झींगा', 'मांस', 'सूअर का मांस',
      // Gujarati
      'ચિકન', 'મટન', 'માંસ', 'માછલી', 'ઝીંગા'
    ];

    for (const meat of meatKeywords) {
      const regex = new RegExp(`(\\b|\\s|^|["',])${meat}(\\b|\\s|$|["',])`, 'i');
      if (regex.test(fullPlanText) || fullPlanText.includes(meat)) {
        return {
          valid: false,
          error: `Diet preference violation: Found meat item "${meat}" in a ${customer.foodPreference || customer.diet_preference} plan.`
        };
      }
    }
  }

  if (isVegan) {
    const animalProductKeywords = [
      // English
      'egg', 'eggs', 'milk', 'cheese', 'yogurt', 'curd', 'whey', 'butter', 'honey', 'paneer', 'ghee',
      // Hindi
      'अंडा', 'अंडे', 'दूध', 'पनीर', 'मक्खन', 'दही', 'घी', 'शहद',
      // Gujarati
      'ઈંડું', 'ઈંડા', 'દૂધ', 'પનીર', 'માખણ', 'દહીં', 'ઘી', 'મધ'
    ];

    for (const item of animalProductKeywords) {
      const regex = new RegExp(`(\\b|\\s|^|["',])${item}(\\b|\\s|$|["',])`, 'i');
      if (regex.test(fullPlanText) || fullPlanText.includes(item)) {
        return {
          valid: false,
          error: `Diet preference violation: Found animal product "${item}" in a Vegan plan.`
        };
      }
    }
  }

  // 6. Non-Vegetarian Beef & Pork Default Exclusion Check
  const favFoodsStr = (customer.favoriteFoods || '').toLowerCase();
  const explicitlyRequestedBeefOrPork =
    favFoodsStr.includes('beef') ||
    favFoodsStr.includes('pork') ||
    favFoodsStr.includes('bacon') ||
    favFoodsStr.includes('ham') ||
    favFoodsStr.includes('बीफ') ||
    favFoodsStr.includes('पोर्क') ||
    favFoodsStr.includes('ગૌમાંસ') ||
    favFoodsStr.includes('ડુક્કર');

  if (!explicitlyRequestedBeefOrPork) {
    const beefPorkKeywords = [
      'beef', 'pork', 'bacon', 'ham', 'lard', 'prosciutto', 'pork chop', 'beef steak',
      'बीफ', 'पोर्क', 'सूअर का मांस', 'गाय का मांस',
      'ગૌમાંસ', 'ડુક્કરનું માંસ', 'બીફ', 'પોર્ક'
    ];

    for (const item of beefPorkKeywords) {
      const regex = new RegExp(`(\\b|\\s|^|["',])${item}(\\b|\\s|$|["',])`, 'i');
      if (regex.test(fullPlanText)) {
        return {
          valid: false,
          error: `Diet rule violation: Found "${item}". Beef and pork are excluded by default for Non-Vegetarian plans unless explicitly requested.`
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Calls Google Gemini AI to generate a structured 7-day meal schedule in the selected language.
 * @param {object} customer - Customer intake profile
 * @param {object} nutritionTargets - Calculated BMR, TDEE, calories, and macros
 * @param {string} [language='en'] - 'en' | 'hi' | 'gu'
 * @returns {Promise<object>} Validated 7-day meal plan in the chosen language
 */
async function generateDietPlan(customer, nutritionTargets, language = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env. Please provide a valid Gemini API key.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define language-specific generation rules
  let languageInstruction = 'Generate the entire customer-facing meal plan in English.';
  let languageFoodHint = 'English names (e.g. "Dal Tadka", "Paneer Bhurji", "Oatmeal", "Roti")';

  if (language === 'hi') {
    languageInstruction = `IMPORTANT LANGUAGE INSTRUCTION (HINDI / हिंदी):
- You MUST generate ALL human-readable meal names, ingredient titles, food quantities, day names, and descriptions in natural, culturally appropriate Hindi (हिंदी) using Devanagari script.
- Examples for food names: "दाल तड़का", "पनीर भुर्जी", "रोटी", "दही", "मसाला ओट्स", "उबले चने", "पालक पनीर", "चावल".
- Examples for day names: "सोमवार (दिन 1)", "मंगलवार (दिन 2)", "बुधवार (दिन 3)", "गुरुवार (दिन 4)", "शुक्रवार (दिन 5)", "शनिवार (दिन 6)", "रविवार (दिन 7)".
- DO NOT generate meal names in English or Romanized transliteration. Use pure Devanagari script.`;
    languageFoodHint = 'Natural Hindi in Devanagari script (e.g. "दाल तड़का", "पनीर भुर्जी", "रोटी")';
  } else if (language === 'gu') {
    languageInstruction = `IMPORTANT LANGUAGE INSTRUCTION (GUJARATI / ગુજરાતી):
- You MUST generate ALL human-readable meal names, ingredient titles, food quantities, day names, and descriptions in natural, culturally appropriate Gujarati (ગુજરાતી) using Gujarati script.
- Examples for food names: "દાળ", "પનીર ભુર્જી", "રોટલી", "દહીં", "ભાત", "ઓટ્સ", "મિક્સ કઠોળ", "પાલક પનીર".
- Examples for day names: "સોમવાર (દિવસ 1)", "મંગળવાર (દિવસ 2)", "બુધવાર (દિવસ 3)", "ગુરુવાર (દિવસ 4)", "શુક્રવાર (દિવસ 5)", "શનિવાર (દિવસ 6)", "રવિવાર (દિવસ 7)".
- DO NOT generate meal names in English or Romanized transliteration. Use pure Gujarati script.`;
    languageFoodHint = 'Natural Gujarati in Gujarati script (e.g. "દાળ", "પનીર ભુર્જી", "રોટલી")';
  }

  // System and context instructions
  const prompt = `
You are an expert fitness nutritionist creating a customized 7-day meal plan for a gym member.

${languageInstruction}

### CRITICAL SCHEMA & LANGUAGE RULES
1. ALL JSON keys/property names MUST REMAIN IN ENGLISH (e.g., "summary", "days", "day", "day_name", "meals", "type", "name", "foods", "quantity", "calories", "protein_g", "carbs_g", "fat_g", "daily_totals", "target_calories"). Do NOT translate JSON property names!
2. All string values presented to the customer (meal "name", "foods[].name", "foods[].quantity", "day_name") must be written in the specified language (${languageFoodHint}).
3. Meal "type" keys MUST stay exact English identifiers: "breakfast", "morning_snack", "lunch", "evening_snack", "dinner".

### PROTEIN SOURCE RULES FOR NON-VEGETARIAN PLANS
- For Non-Vegetarian plans, prioritize commonly accepted wholesome protein sources:
  * Chicken (e.g. breast, thighs, curry, grilled)
  * Fish & Seafood (e.g. salmon, tuna, tilapia, rohu, surmai)
  * Whole Eggs & Egg Whites
  * Turkey
  * Goat / Mutton
- STRICT DEFAULT EXCLUSION: Do NOT include beef or pork unless the customer explicitly requests them in their favorite foods profile. Beef and pork are excluded by default.

### AUTHORITATIVE NUTRITION TARGETS (DO NOT CHANGE OR RECALCULATE)
The backend calculation engine has already determined the authoritative target numbers for this member:
- Basal Metabolic Rate (BMR): ${nutritionTargets.bmr} kcal
- Total Daily Energy Expenditure (TDEE): ${nutritionTargets.tdee} kcal
- Daily Target Calorie Goal: ${nutritionTargets.targetCalories} kcal/day (${nutritionTargets.adjustmentType})
- Daily Protein Target: ${nutritionTargets.proteinG} grams (${nutritionTargets.proteinPct}% of calories)
- Daily Carbohydrate Target: ${nutritionTargets.carbsG} grams (${nutritionTargets.carbsPct}% of calories)
- Daily Healthy Fat Target: ${nutritionTargets.fatG} grams (${nutritionTargets.fatPct}% of calories)

The supplied nutrition targets are authoritative. Build the meal plan around these targets. Do not change the targets.
Distribute the daily totals across 5 daily meals so each day approximately totals ~${nutritionTargets.targetCalories} kcal (±5-10% tolerance).

### MEMBER PROFILE
- Name: ${customer.name}
- Age: ${customer.age} | Gender: ${customer.gender}
- Height: ${customer.height} cm | Weight: ${customer.weight} kg
- Primary Goal: ${customer.goal}
- Activity Level: ${customer.activityLevel}
- Dietary Preference: ${customer.foodPreference || customer.diet_preference} (STRICT REQUIREMENT)
- Favorite/Staple Foods to incorporate naturally: ${customer.favoriteFoods || 'None specified'}
- STRICT ALLERGIES / INTOLERANCES: ${customer.allergies || 'None'} (ABSOLUTE EXCLUSION: NEVER INCLUDE THESE INGREDIENTS OR DERIVATIVES)

### SAFETY & MEDICAL BOUNDARIES
- Do not provide medical diagnosis, treatment, or prescribe supplements/medications.
- Focus exclusively on wholesome, commonly available groceries and practical home meal preparation.

### OUTPUT REQUIREMENTS
You must return ONLY a valid JSON object matching this exact schema:

{
  "summary": {
    "target_calories": ${nutritionTargets.targetCalories},
    "protein_g": ${nutritionTargets.proteinG},
    "carbs_g": ${nutritionTargets.carbsG},
    "fat_g": ${nutritionTargets.fatG}
  },
  "days": [
    {
      "day": 1,
      "day_name": "${language === 'hi' ? 'सोमवार (दिन 1)' : language === 'gu' ? 'સોમવાર (દિવસ 1)' : 'Monday (Day 1)'}",
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal Title in target language",
          "foods": [
            { "name": "Ingredient Name in target language", "quantity": "Portion (e.g. 100g or 2 slices)" }
          ],
          "calories": 600,
          "protein_g": 35,
          "carbs_g": 70,
          "fat_g": 18
        },
        {
          "type": "morning_snack",
          "name": "Snack Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": 300,
          "protein_g": 15,
          "carbs_g": 40,
          "fat_g": 10
        },
        {
          "type": "lunch",
          "name": "Lunch Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": 850,
          "protein_g": 50,
          "carbs_g": 110,
          "fat_g": 24
        },
        {
          "type": "evening_snack",
          "name": "Snack Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": 350,
          "protein_g": 20,
          "carbs_g": 45,
          "fat_g": 10
        },
        {
          "type": "dinner",
          "name": "Dinner Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": 930,
          "protein_g": 45,
          "carbs_g": 138,
          "fat_g": 22
        }
      ],
      "daily_totals": {
        "calories": ${nutritionTargets.targetCalories},
        "protein_g": ${nutritionTargets.proteinG},
        "carbs_g": ${nutritionTargets.carbsG},
        "fat_g": ${nutritionTargets.fatG}
      }
    }
  ]
}

Include all 7 days (Day 1 to Day 7) with creative variety across the week.
`;

  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
  ];
  let lastError = null;
  let responseText = null;

  for (const model of modelsToTry) {
    // Retry up to 2 attempts per model on transient errors (like 503 high demand)
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        });
        responseText = response.text ? response.text.trim() : '';
        if (responseText) {
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} (attempt ${attempt}) unavailable (${err.message}).`);
        if (attempt < 2 && err.message?.includes('503')) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
    if (responseText) {
      break;
    }
  }

  if (!responseText) {
    throw lastError || new Error('All Gemini model candidates failed to respond.');
  }

  let parsedPlan;
  try {
    parsedPlan = JSON.parse(responseText);
  } catch (err) {
    console.error('Gemini JSON Parse Error:', err, responseText);
    throw new Error('Failed to parse Gemini response as JSON.');
  }

  // Validate the AI output
  const validation = validateDietPlan(parsedPlan, customer, nutritionTargets);
  if (!validation.valid) {
    console.error('Gemini Plan Validation Error:', validation.error);
    throw new Error(`AI Meal Plan Validation Failed: ${validation.error}`);
  }

  return parsedPlan;
}

module.exports = {
  generateDietPlan,
  validateDietPlan
};
