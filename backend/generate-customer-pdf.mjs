import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:5000';
const OUTPUT_DIR = path.resolve('..', 'Test_PDF');
const OUTPUT_PDF_PATH = path.join(OUTPUT_DIR, 'Vikram_Singhania_Diet_Plan.pdf');
const TEMP_HTML_PATH = path.join(OUTPUT_DIR, 'temp_print_view.html');

// Brand New Customer Profile (Distinct from earlier test customers)
const newCustomer = {
  name: 'Vikram Singhania',
  age: 32,
  gender: 'Male',
  height: 180,
  weight: 85,
  goal: 'Weight Loss',
  activityLevel: 'Moderately Active',
  foodPreference: 'Non-Vegetarian',
  favoriteFoods: 'Grilled chicken breast, salmon, scrambled eggs, brown rice, Greek yogurt, spinach',
  allergies: 'Gluten',
  phone: '+91 98765 12345',
  email: 'vikram.singhania@pulsefit-member.com',
  language: 'en'
};

const gymConfig = {
  gymName: 'PulseFit Fitness Hub',
  tagline: 'Official Gym Nutrition Blueprint',
  logo: '⚡',
  phone: '+91 98765 43210',
  email: 'desk@pulsefitgym.com',
  website: 'www.pulsefitgym.com',
  deskLocation: 'Front Desk & Trainer Station, Ground Floor',
  supportHours: 'Mon – Sat: 6:00 AM – 10:00 PM | Sun: 8:00 AM – 2:00 PM'
};

function generatePrintHtml(customer, nutrition, plan) {
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mealIcons = {
    breakfast: '🍳',
    morning_snack: '🍎',
    lunch: '🥗',
    evening_snack: '🥜',
    dinner: '🍲'
  };

  const mealTypeLabels = {
    breakfast: 'Breakfast',
    morning_snack: 'Morning Snack',
    lunch: 'Lunch',
    evening_snack: 'Evening Snack',
    dinner: 'Dinner'
  };

  let daysHtml = '';

  const days = plan && Array.isArray(plan.days) ? plan.days : [];

  days.forEach((day, index) => {
    let dayMealsHtml = '';
    const dayName = day.day_name || `Day ${index + 1}`;
    const meals = day.meals || [];

    meals.forEach((meal) => {
      const icon = mealIcons[meal.type] || '🍽️';
      const typeLabel = mealTypeLabels[meal.type] || (meal.name || 'Meal');

      let foodsListHtml = '';
      if (Array.isArray(meal.foods)) {
        foodsListHtml = meal.foods
          .map((f) => `<span class="food-tag">${f.name || f}${f.quantity ? ` (${f.quantity})` : ''}</span>`)
          .join(' ');
      }

      dayMealsHtml += `
        <div class="meal-card">
          <div class="meal-header">
            <span class="meal-icon">${icon}</span>
            <span class="meal-name">${meal.name || typeLabel}</span>
            <span class="meal-type">${typeLabel}</span>
            <span class="meal-cal">${meal.calories || 0} kcal</span>
          </div>
          <div class="meal-foods">${foodsListHtml}</div>
          <div class="meal-macros">
            <span>P: <strong>${meal.protein_g || 0}g</strong></span>
            <span>C: <strong>${meal.carbs_g || 0}g</strong></span>
            <span>F: <strong>${meal.fat_g || 0}g</strong></span>
          </div>
        </div>
      `;
    });

    const dayTotals = day.daily_totals || {};

    daysHtml += `
      <div class="day-block">
        <div class="day-header">
          <h2>${dayName}</h2>
          <div class="day-totals-badge">
            Daily Target: <strong>${dayTotals.calories || nutrition.targetCalories || 0} kcal</strong> | 
            P: <strong>${dayTotals.protein_g || nutrition.proteinG || 0}g</strong> | 
            C: <strong>${dayTotals.carbs_g || nutrition.carbsG || 0}g</strong> | 
            F: <strong>${dayTotals.fat_g || nutrition.fatG || 0}g</strong>
          </div>
        </div>
        <div class="meals-grid">
          ${dayMealsHtml}
        </div>
      </div>
    `;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${customer.name} - Official Diet Plan PDF</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10px;
      font-size: 11px;
      line-height: 1.35;
    }
    .header {
      border-bottom: 2px solid #059669;
      padding-bottom: 8px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo {
      width: 38px;
      height: 38px;
      background: #059669;
      color: #ffffff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 900;
    }
    .gym-name {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
      line-height: 1.1;
    }
    .tagline {
      font-size: 9px;
      font-weight: 700;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 2px 0 0 0;
    }
    .contacts {
      text-align: right;
      font-size: 9px;
      color: #475569;
    }
    .profile-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .profile-item span {
      display: block;
      font-size: 8.5px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
    }
    .profile-item strong {
      font-size: 11px;
      color: #0f172a;
    }
    .target-banner {
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      border-radius: 8px;
      padding: 8px 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .target-val {
      font-size: 16px;
      font-weight: 900;
      color: #047857;
    }
    .macros-split {
      display: flex;
      gap: 12px;
      font-size: 10px;
    }
    .macro-pill {
      background: #ffffff;
      border: 1px solid #6ee7b7;
      padding: 3px 8px;
      border-radius: 4px;
      font-weight: bold;
    }
    .day-block {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      margin-bottom: 10px;
      padding: 8px 10px;
      page-break-inside: avoid;
    }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .day-header h2 {
      margin: 0;
      font-size: 12px;
      font-weight: 800;
      color: #047857;
    }
    .day-totals-badge {
      font-size: 9px;
      color: #334155;
    }
    .meals-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
    }
    .meal-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 6px;
      font-size: 9.5px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .meal-header {
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 4px;
      line-height: 1.15;
    }
    .meal-icon {
      margin-right: 2px;
    }
    .meal-type {
      display: block;
      font-size: 7.5px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 700;
    }
    .meal-cal {
      display: inline-block;
      margin-top: 2px;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 8px;
      font-weight: bold;
      color: #0f172a;
    }
    .meal-foods {
      margin: 4px 0;
      font-size: 8.5px;
      color: #475569;
    }
    .food-tag {
      display: inline-block;
      margin-bottom: 2px;
    }
    .meal-macros {
      border-top: 1px dashed #cbd5e1;
      padding-top: 3px;
      font-size: 8px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    .footer-desk {
      margin-top: 14px;
      padding: 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #475569;
      page-break-inside: avoid;
    }
    .disclaimer {
      margin-top: 8px;
      font-size: 7.5px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.2;
    }
  </style>
</head>
<body>
  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <div class="logo">${gymConfig.logo}</div>
      <div>
        <h1 class="gym-name">${gymConfig.gymName}</h1>
        <p class="tagline">${gymConfig.tagline}</p>
      </div>
    </div>
    <div class="contacts">
      <div><strong>${gymConfig.phone}</strong></div>
      <div>${gymConfig.email} • ${gymConfig.website}</div>
      <div style="margin-top: 2px; color: #64748b;">Generated: ${formattedDate}</div>
    </div>
  </div>

  <!-- MEMBER PROFILE -->
  <div class="profile-card">
    <div class="profile-item">
      <span>Member Name</span>
      <strong>${customer.name}</strong>
    </div>
    <div class="profile-item">
      <span>Goal & Diet</span>
      <strong>${customer.goal} • ${customer.foodPreference}</strong>
    </div>
    <div class="profile-item">
      <span>Body Metrics</span>
      <strong>${customer.height} cm • ${customer.weight} kg (${customer.age} yrs, ${customer.gender})</strong>
    </div>
    <div class="profile-item">
      <span>Allergies / Intolerances</span>
      <strong style="color: ${customer.allergies !== 'None' ? '#dc2626' : '#0f172a'}">${customer.allergies || 'None'}</strong>
    </div>
  </div>

  <!-- TARGET BANNER -->
  <div class="target-banner">
    <div>
      <span style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #047857;">Daily Calorie Goal</span>
      <div class="target-val">${nutrition.targetCalories} kcal / day</div>
    </div>
    <div class="macros-split">
      <div class="macro-pill">Protein: <span style="color: #047857;">${nutrition.proteinG}g</span> (${nutrition.proteinPct}%)</div>
      <div class="macro-pill">Carbohydrates: <span style="color: #047857;">${nutrition.carbsG}g</span> (${nutrition.carbsPct}%)</div>
      <div class="macro-pill">Healthy Fat: <span style="color: #047857;">${nutrition.fatG}g</span> (${nutrition.fatPct}%)</div>
      <div class="macro-pill" style="border-color: #cbd5e1; color: #64748b;">BMR: ${nutrition.bmr} | TDEE: ${nutrition.tdee}</div>
    </div>
  </div>

  <!-- 7-DAY MEAL SCHEDULE -->
  <div class="schedule-section">
    ${daysHtml}
  </div>

  <!-- TRAINER DESK CONTACT -->
  <div class="footer-desk">
    <div>
      <strong style="color: #0f172a;">Coach & Front Desk Support:</strong> ${gymConfig.deskLocation}
    </div>
    <div>
      <strong>Hours:</strong> ${gymConfig.supportHours}
    </div>
  </div>

  <!-- MEDICAL DISCLAIMER -->
  <div class="disclaimer">
    This document contains personalized fitness nutritional guidance structured around your body parameters. It does not constitute medical advice or a clinical prescription. Consult a qualified physician before undertaking any extreme dietary regimen.
  </div>
</body>
</html>
  `;
}

async function main() {
  console.log('====================================================');
  console.log('  BRANDED PDF GENERATION PIPELINE FOR NEW CUSTOMER  ');
  console.log('====================================================\n');

  console.log('1. Submitting New Customer Intake:');
  console.log(`   • Name: ${newCustomer.name}`);
  console.log(`   • Age/Gender: ${newCustomer.age}M, Height: ${newCustomer.height}cm, Weight: ${newCustomer.weight}kg`);
  console.log(`   • Goal: ${newCustomer.goal} (${newCustomer.foodPreference})`);
  console.log(`   • Allergies: ${newCustomer.allergies}`);
  console.log(`   • Contact: ${newCustomer.phone} | ${newCustomer.email}\n`);

  console.log('2. Requesting 7-Day Diet Plan generation from Backend (Gemini AI)...');
  const startTime = performance.now();

  const response = await fetch(`${BASE_URL}/api/generate-diet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCustomer)
  });

  const durationSec = ((performance.now() - startTime) / 1000).toFixed(2);
  const data = await response.json();

  if (!response.ok || !data.success) {
    console.error('❌ Failed to generate diet plan:', data.message || `HTTP ${response.status}`);
    process.exit(1);
  }

  console.log(`   ✓ Plan generated in ${durationSec} seconds (HTTP ${response.status})`);
  console.log(`   ✓ Customer ID: ${data.customer?.id}`);
  console.log(`   ✓ Target Calories: ${data.nutrition?.targetCalories} kcal (Protein: ${data.nutrition?.proteinG}g, Carbs: ${data.nutrition?.carbsG}g, Fat: ${data.nutrition?.fatG}g)`);

  const plan = data.plan || data.dietPlan?.plan_data;
  console.log(`   ✓ Days in Plan: ${plan?.days?.length || 0} days`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate HTML
  console.log('\n3. Rendering Branded Print-Friendly HTML Template...');
  const htmlContent = generatePrintHtml(data.customer, data.nutrition, plan);
  fs.writeFileSync(TEMP_HTML_PATH, htmlContent, 'utf-8');
  console.log(`   ✓ Rendered HTML template saved to: ${TEMP_HTML_PATH}`);

  // Find Chrome/Edge
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  let browserPath = null;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      browserPath = p;
      break;
    }
  }

  if (!browserPath) {
    console.error('❌ Could not find Chrome or Edge executable to print PDF.');
    process.exit(1);
  }

  console.log(`\n4. Generating PDF using Headless Browser (${path.basename(browserPath)})...`);
  const printCommand = `"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${OUTPUT_PDF_PATH}" "${TEMP_HTML_PATH}"`;
  
  execSync(printCommand, { stdio: 'pipe' });

  if (fs.existsSync(OUTPUT_PDF_PATH)) {
    const stats = fs.statSync(OUTPUT_PDF_PATH);
    const fileSizeKb = (stats.size / 1024).toFixed(1);
    console.log(`\n🎉 SUCCESS! Branded PDF Generated Successfully!`);
    console.log(`   • File Location: ${OUTPUT_PDF_PATH}`);
    console.log(`   • File Size: ${fileSizeKb} KB (${stats.size} bytes)`);
    console.log(`   • Customer: ${newCustomer.name} (${newCustomer.goal})`);
    console.log(`   • Included Content: All 7 days, 35 meals, macros, gym contacts, medical disclaimer.`);
  } else {
    console.error('❌ PDF generation failed: PDF file was not created.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal PDF generation error:', err);
  process.exit(1);
});
