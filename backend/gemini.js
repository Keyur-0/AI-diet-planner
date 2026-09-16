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
 * Calculates actual sums of meal calories/macros from meal objects and verifies they meet authoritative targets within tolerance.
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

  // 3. Verify each day and meal structure + aggregate meal totals
  const targetCalories = nutritionTargets ? Number(nutritionTargets.targetCalories) || 2000 : 2000;
  const targetProtein = nutritionTargets ? Number(nutritionTargets.proteinG) || 150 : 150;
  const targetCarbs = nutritionTargets ? Number(nutritionTargets.carbsG) || 200 : 200;
  const targetFat = nutritionTargets ? Number(nutritionTargets.fatG) || 60 : 60;

  for (let d = 0; d < plan.days.length; d++) {
    const day = plan.days[d];
    if (!day || typeof day !== 'object') {
      return { valid: false, error: `Invalid day object at index ${d}.` };
    }

    if (!Array.isArray(day.meals) || day.meals.length < 5) {
      return { valid: false, error: `Day ${d + 1} must contain at least 5 structured meals.` };
    }

    let daySumCalories = 0;
    let daySumProtein = 0;
    let daySumCarbs = 0;
    let daySumFat = 0;

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

      daySumCalories += Number(meal.calories);
      daySumProtein += Number(meal.protein_g);
      daySumCarbs += Number(meal.carbs_g);
      daySumFat += Number(meal.fat_g);
    }

    daySumCalories = Math.round(daySumCalories);
    daySumProtein = Math.round(daySumProtein * 10) / 10;
    daySumCarbs = Math.round(daySumCarbs * 10) / 10;
    daySumFat = Math.round(daySumFat * 10) / 10;

    // Overwrite/derive actual daily_totals from real meal summation
    day.daily_totals = {
      calories: daySumCalories,
      protein_g: daySumProtein,
      carbs_g: daySumCarbs,
      fat_g: daySumFat
    };

    // Tolerance validation against authoritative nutrition targets
    if (nutritionTargets) {
      // Calories: ±10%
      const calDiffPct = Math.abs(daySumCalories - targetCalories) / targetCalories;
      if (calDiffPct > 0.10) {
        return {
          valid: false,
          error: `Day ${d + 1} total meal calories (${daySumCalories} kcal) deviates from target (${targetCalories} kcal) by ${(calDiffPct * 100).toFixed(1)}% (allowed: ±10%).`
        };
      }

      // Protein: ±10%
      const protDiffPct = Math.abs(daySumProtein - targetProtein) / targetProtein;
      if (protDiffPct > 0.10) {
        return {
          valid: false,
          error: `Day ${d + 1} total protein (${daySumProtein}g) deviates from target (${targetProtein}g) by ${(protDiffPct * 100).toFixed(1)}% (allowed: ±10%).`
        };
      }

      // Fat: ±15%
      const fatDiffPct = Math.abs(daySumFat - targetFat) / targetFat;
      if (fatDiffPct > 0.15) {
        return {
          valid: false,
          error: `Day ${d + 1} total fat (${daySumFat}g) deviates from target (${targetFat}g) by ${(fatDiffPct * 100).toFixed(1)}% (allowed: ±15%).`
        };
      }

      // Carbs: ±15%
      const carbsDiffPct = Math.abs(daySumCarbs - targetCarbs) / targetCarbs;
      if (carbsDiffPct > 0.15) {
        return {
          valid: false,
          error: `Day ${d + 1} total carbs (${daySumCarbs}g) deviates from target (${targetCarbs}g) by ${(carbsDiffPct * 100).toFixed(1)}% (allowed: ±15%).`
        };
      }
    }
  }

  const fullPlanText = JSON.stringify(plan).toLowerCase();

  // 4. Multilingual Allergy Safety Check (Strictly Blocking)
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
      if (term.length >= 3) {
        const regex = new RegExp(`(\\b|\\s|^|["',])${term}(\\b|\\s|$|["',])`, 'i');
        if (regex.test(fullPlanText) || fullPlanText.includes(term)) {
          return {
            valid: false,
            error: `Allergen safety violation: Found allergen keyword "${term}" matching customer allergy: "${customer.allergies}".`
          };
        }
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
 * Implements bounded retries with validation feedback to guarantee dietary safety and macro accuracy.
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

  const breakfastCal = Math.round(nutritionTargets.targetCalories * 0.20);
  const morningSnackCal = Math.round(nutritionTargets.targetCalories * 0.10);
  const lunchCal = Math.round(nutritionTargets.targetCalories * 0.32);
  const eveningSnackCal = Math.round(nutritionTargets.targetCalories * 0.10);
  const dinnerCal = Math.round(nutritionTargets.targetCalories * 0.28);

  const breakfastProt = Math.round(nutritionTargets.proteinG * 0.22);
  const lunchProt = Math.round(nutritionTargets.proteinG * 0.34);
  const dinnerProt = Math.round(nutritionTargets.proteinG * 0.24);

  // Base prompt
  const basePrompt = `
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

### MEAL-BY-MEAL CALORIE & PORTION GUIDELINES
To ensure the sum of meal calories closely matches ~${nutritionTargets.targetCalories} kcal (within ±5% to ±10% tolerance), distribute the meals approximately as follows:
- Breakfast (~20%): ~${breakfastCal} kcal, ~${breakfastProt}g protein
- Morning Snack (~10%): ~${morningSnackCal} kcal
- Lunch (~32%): ~${lunchCal} kcal, ~${lunchProt}g protein
- Evening Snack (~10%): ~${eveningSnackCal} kcal
- Dinner (~28%): ~${dinnerCal} kcal, ~${dinnerProt}g protein

CRITICAL: For high-calorie muscle gain targets (~3000+ kcal), use realistic substantial portion sizes (e.g. 200g-250g protein source, 2-3 cups cooked rice/oats, whole eggs, nuts, avocados, olive oil) so that each day's summed meal calories reach ~${nutritionTargets.targetCalories} kcal.

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
          "calories": ${breakfastCal},
          "protein_g": ${breakfastProt},
          "carbs_g": ${Math.round(breakfastCal * 0.5 / 4)},
          "fat_g": ${Math.round(breakfastCal * 0.25 / 9)}
        },
        {
          "type": "morning_snack",
          "name": "Snack Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": ${morningSnackCal},
          "protein_g": 10,
          "carbs_g": 30,
          "fat_g": 8
        },
        {
          "type": "lunch",
          "name": "Lunch Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": ${lunchCal},
          "protein_g": ${lunchProt},
          "carbs_g": ${Math.round(lunchCal * 0.45 / 4)},
          "fat_g": ${Math.round(lunchCal * 0.25 / 9)}
        },
        {
          "type": "evening_snack",
          "name": "Snack Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": ${eveningSnackCal},
          "protein_g": 15,
          "carbs_g": 35,
          "fat_g": 10
        },
        {
          "type": "dinner",
          "name": "Dinner Title in target language",
          "foods": [{ "name": "...", "quantity": "..." }],
          "calories": ${dinnerCal},
          "protein_g": ${dinnerProt},
          "carbs_g": ${Math.round(dinnerCal * 0.45 / 4)},
          "fat_g": ${Math.round(dinnerCal * 0.25 / 9)}
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

  const MAX_ATTEMPTS = 3;
  let lastValidationError = null;
  let lastApiError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let currentPrompt = basePrompt;
    if (lastValidationError) {
      currentPrompt += `\n\n### CRITICAL CORRECTION REQUIRED (Attempt ${attempt}/${MAX_ATTEMPTS}):\nYour previous output failed validation with error: "${lastValidationError}".\nYou MUST correct this error immediately. Ensure strict dietary compliance, zero allergens, and that the sum of the 5 meal calories for every day accurately reaches ~${nutritionTargets.targetCalories} kcal (±5-10%).`;
    }

    let responseText = null;

    for (const model of modelsToTry) {
      for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: currentPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2 + (attempt * 0.05)
            }
          });
          responseText = response.text ? response.text.trim() : '';
          if (responseText) {
            break;
          }
        } catch (err) {
          lastApiError = err;
          console.warn(`Model ${model} (attempt ${modelAttempt}) notice (${err.message}).`);
          if (modelAttempt < 2 && err.message?.includes('503')) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastApiError || new Error('All Gemini model candidates failed to respond.');
    }

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(responseText);
    } catch (err) {
      console.error('Gemini JSON Parse Error on attempt', attempt, ':', err.message);
      lastValidationError = 'Failed to parse Gemini response as JSON.';
      continue;
    }

    // Validate the AI output
    const validation = validateDietPlan(parsedPlan, customer, nutritionTargets);
    if (validation.valid) {
      return parsedPlan;
    }

    lastValidationError = validation.error;
    console.warn(`⚠️ Generation attempt ${attempt}/${MAX_ATTEMPTS} rejected: ${validation.error}. Retrying with feedback...`);
  }

  throw new Error(`AI Meal Plan Generation failed validation after ${MAX_ATTEMPTS} attempts: ${lastValidationError}`);
}

/**
 * Validates the generated AI workout routine structure, 7 days, exercises, rest days, and safety precautions.
 * @param {object} plan - Parsed JSON workout plan
 * @param {object} customer - Customer intake profile
 * @param {object} workoutProfile - Workout parameters (goal, experience, location, equipment, daysPerWeek, durationMins, injuries)
 * @returns {{ valid: boolean, error?: string }}
 */
function validateWorkoutPlan(plan, customer, workoutProfile = {}) {
  if (!plan || typeof plan !== 'object') {
    return { valid: false, error: 'AI response is not a valid JSON object.' };
  }

  // 1. Verify summary exists or initialize
  if (!plan.summary || typeof plan.summary !== 'object') {
    plan.summary = {};
  }

  // 2. Verify days array of exactly 7 days
  if (!Array.isArray(plan.days) || plan.days.length !== 7) {
    return { valid: false, error: `AI response must contain exactly 7 days, but got ${plan.days ? plan.days.length : 0}.` };
  }

  // 3. Verify each day structure and exercise formatting
  let activeWorkoutDaysCount = 0;
  let restDaysCount = 0;

  for (let d = 0; d < plan.days.length; d++) {
    const day = plan.days[d];
    if (!day || typeof day !== 'object') {
      return { valid: false, error: `Invalid day object at index ${d}.` };
    }

    if (!day.focus || typeof day.focus !== 'string') {
      return { valid: false, error: `Day ${d + 1} is missing a workout focus string.` };
    }

    const isRest = Boolean(day.is_rest_day || day.isRestDay || day.focus.toLowerCase().includes('rest') || day.focus.toLowerCase().includes('recovery') || day.focus.toLowerCase().includes('विश्राम') || day.focus.toLowerCase().includes('આરામ'));
    day.is_rest_day = isRest;
    day.isRestDay = isRest;

    if (isRest) {
      restDaysCount++;
      if (!Array.isArray(day.exercises)) {
        day.exercises = [];
      }
    } else {
      activeWorkoutDaysCount++;
      if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
        return { valid: false, error: `Active workout Day ${d + 1} ("${day.focus}") must contain at least 1-2 structured exercises.` };
      }

      for (let e = 0; e < day.exercises.length; e++) {
        const ex = day.exercises[e];
        if (!ex || typeof ex !== 'object') {
          return { valid: false, error: `Day ${d + 1}, Exercise ${e + 1} is invalid.` };
        }
        if (!ex.name || typeof ex.name !== 'string' || !ex.name.trim()) {
          return { valid: false, error: `Day ${d + 1}, Exercise ${e + 1} is missing a name.` };
        }
        if (ex.sets === undefined || ex.sets === null || ex.sets === '') {
          return { valid: false, error: `Day ${d + 1}, Exercise "${ex.name}" is missing sets.` };
        }
        if (!ex.reps && !ex.duration) {
          return { valid: false, error: `Day ${d + 1}, Exercise "${ex.name}" must specify reps or duration.` };
        }
        if (!ex.rest || typeof ex.rest !== 'string') {
          ex.rest = '60-90 sec';
        }
        if (!ex.instructions && !ex.cues) {
          ex.cues = 'Maintain proper posture and controlled breathing throughout the movement.';
        }
      }
    }
  }

  // 4. Physical Limitations / Injury Safety Check
  const injuriesStr = ((workoutProfile && workoutProfile.injuries) || (customer && customer.injuries) || '').toLowerCase().trim();
  if (injuriesStr && injuriesStr !== 'none' && injuriesStr !== 'none specified' && injuriesStr !== 'કોઈ નહીં' && injuriesStr !== 'कोई नहीं') {
    // If injuries specified, ensure safety caution/notice is set or present
    if (!plan.safety_caution && !plan.summary.safety_notice) {
      plan.safety_caution = `Physical limitation noted: "${injuriesStr}". Exercises have been tailored to avoid aggravating this area. Please warm up thoroughly and consult a healthcare or physical therapy professional if you experience any pain.`;
    }
  }

  return { valid: true };
}

/**
 * Calls Google Gemini AI to generate a structured 7-day personalized workout schedule in the selected language.
 * Implements bounded retries with validation feedback.
 * @param {object} customer - Customer profile (name, age, gender, height, weight)
 * @param {object} workoutProfile - Workout preferences (goal, experience, location, equipment, daysPerWeek, durationMins, injuries, preferredExercises)
 * @param {string} [language='en'] - 'en' | 'hi' | 'gu'
 * @returns {Promise<object>} Validated 7-day workout routine in the chosen language
 */
async function generateWorkoutPlan(customer, workoutProfile, language = 'en') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured in backend/.env. Please provide a valid Gemini API key.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Define language-specific instructions
  let languageInstruction = 'Generate all customer-facing exercise names, day names, focus titles, and execution cues in clear English.';
  let languageHint = 'English';

  if (language === 'hi') {
    languageInstruction = `IMPORTANT LANGUAGE INSTRUCTION (HINDI / हिंदी):
- You MUST generate ALL human-readable workout focus titles, day names, warmups, cooldowns, and form instructions in natural Hindi (हिंदी) using Devanagari script.
- For exercise names, you can provide standard fitness names or Hindi transliterations (e.g. "बेंच प्रेस (Bench Press)", "डंबल स्क्वैट्स (Dumbbell Squats)", "पुश-अप्स (Push-ups)", "प्लैंक (Plank)").
- Examples for day names: "सोमवार (दिन 1)", "मंगलवार (दिन 2)", "बुधवार (दिन 3)", "गुरुवार (दिन 4)", "शुक्रवार (दिन 5)", "शनिवार (दिन 6)", "रविवार (दिन 7)".
- Examples for focus: "छाती और ट्राइसेप्स (Chest & Triceps)", "पीठ और बाइसेप्स (Back & Biceps)", "पैर और कोर (Legs & Core)", "सक्रिय विश्राम और स्ट्रेचिंग (Active Rest & Recovery)".
- DO NOT translate JSON keys. JSON property names MUST stay in English!`;
    languageHint = 'Natural Hindi in Devanagari script';
  } else if (language === 'gu') {
    languageInstruction = `IMPORTANT LANGUAGE INSTRUCTION (GUJARATI / ગુજરાતી):
- You MUST generate ALL human-readable workout focus titles, day names, warmups, cooldowns, and form instructions in natural Gujarati (ગુજરાતી) using Gujarati script.
- For exercise names, you can provide standard fitness names or Gujarati transliterations (e.g. "બેન્ચ પ્રેસ (Bench Press)", "ડમ્બબેલ સ્ક્વોટ્સ (Dumbbell Squats)", "પુશ-અપ્સ (Push-ups)", "પ્લેન્ક (Plank)").
- Examples for day names: "સોમવાર (દિવસ 1)", "મંગળવાર (દિવસ 2)", "બુધવાર (દિવસ 3)", "ગુરુવાર (દિવસ 4)", "શુક્રવાર (દિવસ 5)", "શનિવાર (દિવસ 6)", "રવિવાર (દિવસ 7)".
- Examples for focus: "છાતી અને ટ્રાઇસેપ્સ (Chest & Triceps)", "પીઠ અને બાઇસેપ્સ (Back & Biceps)", "પગ અને કોર (Legs & Core)", "સક્રિય આરામ અને સ્ટ્રેચિંગ (Active Rest & Recovery)".
- DO NOT translate JSON keys. JSON property names MUST stay in English!`;
    languageHint = 'Natural Gujarati in Gujarati script';
  }

  const daysPerWeek = parseInt(workoutProfile.daysPerWeek, 10) || 4;
  const durationMins = parseInt(workoutProfile.durationMins, 10) || 45;
  const targetRestDays = 7 - daysPerWeek;

  const basePrompt = `
You are an expert certified gym strength and conditioning coach creating a personalized, practical 7-day workout routine for a gym member.

${languageInstruction}

### CRITICAL SCHEMA & LANGUAGE RULES
1. ALL JSON keys/property names MUST REMAIN IN ENGLISH (e.g. "summary", "days", "day", "day_name", "focus", "is_rest_day", "warmup", "cooldown", "exercises", "name", "sets", "reps", "rest", "instructions", "safety_caution").
2. String values presented to the member ("focus", "warmup", "cooldown", "exercises[].instructions", "day_name") must be written in the specified language (${languageHint}).
3. Exactly 7 days must be generated (Day 1 through Day 7).

### MEMBER PROFILE & PREFERENCES
- Name: ${customer.name || 'Member'}
- Age: ${customer.age} | Gender: ${customer.gender}
- Height: ${customer.height} cm | Weight: ${customer.weight} kg
- Primary Fitness Goal: ${workoutProfile.fitnessGoal || customer.goal || 'General Fitness'}
- Experience Level: ${workoutProfile.experienceLevel || 'Beginner'}
- Workout Location: ${workoutProfile.workoutLocation || 'Gym'}
- Available Equipment: ${workoutProfile.equipment || 'Full Gym Equipment'}
- Training Frequency: ${daysPerWeek} active workout days per week (and exactly ${targetRestDays} scheduled rest/recovery days)
- Session Duration: ~${durationMins} minutes per session
- Preferred Exercises to incorporate: ${workoutProfile.preferredExercises || 'Standard compound and isolation movements'}
- Physical Limitations / Injuries: ${workoutProfile.injuries || 'None'}

### SAFETY & INJURY PROTOCOL (CRITICAL)
- The workout plan is general fitness coaching, NOT medical treatment.
- If the user reported physical limitations/injuries (e.g. "${workoutProfile.injuries || 'None'}"):
  * DO NOT attempt to diagnose their condition.
  * DO NOT program exercises that directly stress or compromise that specific joint/injury.
  * Substitute safe, joint-friendly variations (e.g. if lower back issues, favor chest-supported rows over heavy bent-over barbell rows; if knee issues, favor box squats or glute bridges over deep high-impact jumping).
  * Include clear safety guidance and remind the member to consult a qualified physiotherapist or physician before starting.

### SCHEDULE STRUCTURE (EXACTLY 7 DAYS)
- Total Active Training Days: ${daysPerWeek} days
- Total Rest / Active Recovery Days: ${targetRestDays} days (set "is_rest_day": true and "exercises": [])
- Distribute active workout days and rest days logically across the 7 days for optimal muscle recovery.
- For active training days:
  * Include 4 to 6 focused exercises suited for ${durationMins} minutes.
  * For each exercise: specify name, sets (e.g. 3 or 4), reps (e.g. "8-12", "12-15", or duration like "45 sec"), rest period (e.g. "60 sec", "90 sec"), and 1-2 actionable form cues/instructions.

### OUTPUT REQUIREMENTS
You must return ONLY a valid JSON object matching this exact schema:

{
  "summary": {
    "fitness_goal": "${workoutProfile.fitnessGoal || 'General Fitness'}",
    "experience_level": "${workoutProfile.experienceLevel || 'Beginner'}",
    "workout_location": "${workoutProfile.workoutLocation || 'Gym'}",
    "days_per_week": ${daysPerWeek},
    "duration_mins": ${durationMins},
    "focus_overview": "Short 1-sentence overview of the split in ${languageHint}"
  },
  "safety_caution": "Safety guidance regarding form and medical consultation in ${languageHint}",
  "days": [
    {
      "day": 1,
      "day_name": "${language === 'hi' ? 'सोमवार (दिन 1)' : language === 'gu' ? 'સોમવાર (દિવસ 1)' : 'Monday (Day 1)'}",
      "focus": "Workout focus title (or Rest / Active Recovery)",
      "is_rest_day": false,
      "warmup": "5-10 min dynamic warmup routine in ${languageHint}",
      "cooldown": "5 min cooldown and stretching routine in ${languageHint}",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "rest": "60 sec",
          "instructions": "Key form and execution tip in ${languageHint}"
        }
      ]
    }
  ]
}

Include all 7 days (Day 1 through Day 7) with creative, progressive exercise selection and intelligent rest days matching the requested ${daysPerWeek} days/week frequency.
`;

  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
  ];

  const MAX_ATTEMPTS = 3;
  let lastValidationError = null;
  let lastApiError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let currentPrompt = basePrompt;
    if (lastValidationError) {
      currentPrompt += `\n\n### CRITICAL CORRECTION REQUIRED (Attempt ${attempt}/${MAX_ATTEMPTS}):\nYour previous output failed validation with error: "${lastValidationError}".\nYou MUST correct this error immediately. Ensure exactly 7 days, valid exercises with sets/reps/rest/instructions, and ${targetRestDays} scheduled rest/recovery days.`;
    }

    let responseText = null;

    for (const model of modelsToTry) {
      for (let modelAttempt = 1; modelAttempt <= 2; modelAttempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: currentPrompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.25 + (attempt * 0.05)
            }
          });
          responseText = response.text ? response.text.trim() : '';
          if (responseText) {
            break;
          }
        } catch (err) {
          lastApiError = err;
          console.warn(`Model ${model} workout attempt ${modelAttempt} notice (${err.message}).`);
          if (modelAttempt < 2 && err.message?.includes('503')) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
      if (responseText) {
        break;
      }
    }

    if (!responseText) {
      throw lastApiError || new Error('All Gemini model candidates failed to respond.');
    }

    let parsedPlan;
    try {
      parsedPlan = JSON.parse(responseText);
    } catch (err) {
      console.error('Gemini Workout JSON Parse Error on attempt', attempt, ':', err.message);
      lastValidationError = 'Failed to parse Gemini response as JSON.';
      continue;
    }

    // Validate the AI workout output
    const validation = validateWorkoutPlan(parsedPlan, customer, workoutProfile);
    if (validation.valid) {
      return parsedPlan;
    }

    lastValidationError = validation.error;
    console.warn(`⚠️ Workout generation attempt ${attempt}/${MAX_ATTEMPTS} rejected: ${validation.error}. Retrying with feedback...`);
  }

  throw new Error(`AI Workout Plan Generation failed validation after ${MAX_ATTEMPTS} attempts: ${lastValidationError}`);
}

module.exports = {
  generateDietPlan,
  validateDietPlan,
  generateWorkoutPlan,
  validateWorkoutPlan
};

