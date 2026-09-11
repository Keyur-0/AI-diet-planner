const { Pool } = require('pg');

// Initialize connection pool using DATABASE_URL or individual PG env variables
const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT, 10) || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'ai_diet_planner'
      }
);

let isPostgresAvailable = null;

// Pool-level error handler for idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

// ============================================================================
// IN-MEMORY FALLBACK STORE (Active if PostgreSQL is offline)
// ============================================================================
let customerAutoId = 101;
let dietPlanAutoId = 201;
let noteAutoId = 301;

const mockCustomers = [
  {
    id: 1,
    name: 'Rahul Sharma',
    age: 28,
    gender: 'male',
    height_cm: 178,
    weight_kg: 74,
    goal: 'Muscle Gain',
    activity_level: 'moderate',
    diet_preference: 'Non-Vegetarian',
    favorite_foods: 'Chicken breast, eggs, oatmeal, brown rice, bananas',
    allergies: 'None',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    language: 'en',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    name: 'Priya Patel',
    age: 25,
    gender: 'female',
    height_cm: 162,
    weight_kg: 68,
    goal: 'Weight Loss (Fat Loss)',
    activity_level: 'light',
    diet_preference: 'Vegetarian',
    favorite_foods: 'Paneer, dal, roti, Greek yogurt, spinach',
    allergies: 'Peanuts',
    phone: '+91 98222 33445',
    email: 'priya.patel@example.com',
    language: 'hi',
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    id: 3,
    name: 'Aarav Mehta',
    age: 32,
    gender: 'male',
    height_cm: 172,
    weight_kg: 82,
    goal: 'Weight Loss (Fat Loss)',
    activity_level: 'moderate',
    diet_preference: 'Vegetarian',
    favorite_foods: 'Khichdi, curd, sprouts, almonds, green veggies',
    allergies: 'Lactose intolerant',
    phone: '+91 97111 88990',
    email: 'aarav.mehta@example.com',
    language: 'gu',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: 4,
    name: 'Ananya Deshmukh',
    age: 24,
    gender: 'female',
    height_cm: 168,
    weight_kg: 58,
    goal: 'Maintain Weight (Health & Energy)',
    activity_level: 'very',
    diet_preference: 'Vegan',
    favorite_foods: 'Tofu, quinoa, chickpeas, chia seeds, avocado',
    allergies: 'Gluten',
    phone: '+91 98333 44556',
    email: 'ananya.d@example.com',
    language: 'en',
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  }
];

const mockDietPlans = [
  {
    id: 1,
    customer_id: 1,
    bmr: 1720,
    tdee: 2666,
    target_calories: 2966,
    protein_g: 162.8,
    carbs_g: 370.8,
    fat_g: 65.9,
    language: 'en',
    plan_data: {
      days: [
        {
          day: 'Monday (Day 1)',
          meals: [
            {
              name: 'Breakfast',
              items: '4 Egg whites scrambled with spinach + 2 slices whole wheat toast + 1 banana',
              calories: 480,
              protein: 32,
              carbs: 60,
              fat: 10
            },
            {
              name: 'Lunch',
              items: 'Grilled chicken breast (200g) + 1.5 cups brown rice + steamed broccoli',
              calories: 750,
              protein: 55,
              carbs: 85,
              fat: 12
            },
            {
              name: 'Snack',
              items: 'Whey protein shake + 30g almonds + 1 apple',
              calories: 380,
              protein: 30,
              carbs: 35,
              fat: 14
            },
            {
              name: 'Dinner',
              items: 'Grilled salmon or chicken (180g) + baked sweet potato + mixed green salad',
              calories: 650,
              protein: 45,
              carbs: 65,
              fat: 16
            }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    customer_id: 2,
    bmr: 1410,
    tdee: 1938,
    target_calories: 1438,
    protein_g: 102,
    carbs_g: 161.8,
    fat_g: 39.9,
    language: 'hi',
    plan_data: {
      days: [
        {
          day: 'सोमवार (दिन 1)',
          meals: [
            {
              name: 'नाश्ता (Breakfast)',
              items: 'मूंग दाल चीला (2) + हरी चटनी + 1 कप स्किम्ड दूध',
              calories: 320,
              protein: 20,
              carbs: 40,
              fat: 6
            },
            {
              name: 'दोपहर का भोजन (Lunch)',
              items: 'पनीर भुर्जी (100 ग्राम) + 2 मल्टीग्रेन रोटी + 1 कटोरी दाल + खीरा सलाद',
              calories: 460,
              protein: 30,
              carbs: 50,
              fat: 12
            },
            {
              name: 'शाम का नाश्ता (Snack)',
              items: 'भुने हुए चने + 1 कप ग्रीन टी',
              calories: 150,
              protein: 8,
              carbs: 22,
              fat: 3
            },
            {
              name: 'रात का खाना (Dinner)',
              items: 'मिक्स वेज सूप + उबले अंकुरित मूंग का कटोरा + 1 रोटी',
              calories: 360,
              protein: 22,
              carbs: 45,
              fat: 8
            }
          ]
        }
      ]
    },
    created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  }
];

const mockTrainerNotes = [
  {
    id: 1,
    customer_id: 1,
    note: 'Initial assessment completed. Member aims to bulk up for upcoming powerlifting meet. Advised pre-workout meal timing.',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 2,
    customer_id: 2,
    note: 'Followed up on peanut allergy. Member is tolerating high-protein vegetarian menu well.',
    created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

// Execute in-memory fallback query
function executeMemoryQuery(text, params = []) {
  const queryStr = text.trim();

  // 1. STATS: SELECT COUNT(*)::int AS total_leads ...
  if (queryStr.includes('total_leads') && queryStr.includes('FROM customers')) {
    const totalLeads = mockCustomers.length;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - now.getDay() * 86400000;

    let todayLeads = 0;
    let weekLeads = 0;
    let goalLoss = 0;
    let goalGain = 0;
    let goalMaintain = 0;
    let langEn = 0;
    let langHi = 0;
    let langGu = 0;

    mockCustomers.forEach((c) => {
      const cTime = new Date(c.created_at).getTime();
      if (cTime >= todayStart) todayLeads++;
      if (cTime >= weekStart) weekLeads++;

      const g = (c.goal || '').toLowerCase();
      if (g.includes('loss') || g.includes('fat') || g.includes('घटा')) goalLoss++;
      else if (g.includes('gain') || g.includes('muscle') || g.includes('मांसपेशी')) goalGain++;
      else goalMaintain++;

      const l = (c.language || 'en').toLowerCase();
      if (l === 'hi') langHi++;
      else if (l === 'gu') langGu++;
      else langEn++;
    });

    return {
      rows: [
        {
          total_leads: totalLeads,
          today_leads: todayLeads,
          week_leads: weekLeads,
          goal_weight_loss: goalLoss,
          goal_muscle_gain: goalGain,
          goal_maintain: goalMaintain,
          lang_en: langEn,
          lang_hi: langHi,
          lang_gu: langGu
        }
      ]
    };
  }

  // 2. TOTAL PLANS: SELECT COUNT(*) FROM diet_plans
  if (queryStr.includes('COUNT(*)') && queryStr.includes('FROM diet_plans') && !queryStr.includes('customer_id')) {
    return { rows: [{ total_plans: mockDietPlans.length }] };
  }

  // 3. CUSTOMER COUNT: SELECT COUNT(*) FROM customers c
  if (queryStr.includes('COUNT(*)::int AS total FROM customers')) {
    let list = [...mockCustomers];
    // Filter by search / params if provided
    params.forEach((param) => {
      if (typeof param === 'string' && param.startsWith('%') && param.endsWith('%')) {
        const term = param.replace(/%/g, '').toLowerCase();
        list = list.filter((c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.goal.toLowerCase().includes(term) ||
          c.diet_preference.toLowerCase().includes(term)
        );
      } else if (['en', 'hi', 'gu'].includes(param)) {
        list = list.filter((c) => (c.language || 'en') === param);
      }
    });
    return { rows: [{ total: list.length }] };
  }

  // 4. CUSTOMERS LIST: SELECT c.*, COUNT(DISTINCT dp.id)... FROM customers c
  if (queryStr.includes('FROM customers c') && (queryStr.includes('plan_count') || queryStr.includes('note_count'))) {
    let list = [...mockCustomers];

    // Filter using query params
    params.forEach((param) => {
      if (typeof param === 'string' && param.startsWith('%') && param.endsWith('%')) {
        const term = param.replace(/%/g, '').toLowerCase();
        list = list.filter((c) =>
          c.name.toLowerCase().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.goal.toLowerCase().includes(term) ||
          c.diet_preference.toLowerCase().includes(term)
        );
      } else if (['en', 'hi', 'gu'].includes(param)) {
        list = list.filter((c) => (c.language || 'en') === param);
      }
    });

    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Calculate plan_count and note_count for each
    const rows = list.map((c) => {
      const pCount = mockDietPlans.filter((p) => p.customer_id === c.id).length;
      const nCount = mockTrainerNotes.filter((n) => n.customer_id === c.id).length;
      const pList = mockDietPlans.filter((p) => p.customer_id === c.id);
      const latestP = pList.length > 0 ? pList[0].created_at : null;

      return {
        ...c,
        plan_count: pCount,
        note_count: nCount,
        latest_plan_created_at: latestP
      };
    });

    // Pagination limit & offset
    const limit = typeof params[params.length - 2] === 'number' ? params[params.length - 2] : 20;
    const offset = typeof params[params.length - 1] === 'number' ? params[params.length - 1] : 0;
    const paginated = rows.slice(offset, offset + limit);

    return { rows: paginated };
  }

  // 5. SINGLE CUSTOMER: SELECT * FROM customers WHERE id = $1
  if (queryStr.includes('FROM customers WHERE id = $1')) {
    const custId = parseInt(params[0], 10);
    const found = mockCustomers.find((c) => c.id === custId);
    return { rows: found ? [found] : [] };
  }

  // 6. CUSTOMER PLANS: SELECT * FROM diet_plans WHERE customer_id = $1
  if (queryStr.includes('FROM diet_plans WHERE customer_id = $1')) {
    const custId = parseInt(params[0], 10);
    const plans = mockDietPlans
      .filter((p) => p.customer_id === custId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: plans };
  }

  // 7. CUSTOMER NOTES: SELECT * FROM trainer_notes WHERE customer_id = $1
  if (queryStr.includes('FROM trainer_notes WHERE customer_id = $1')) {
    const custId = parseInt(params[0], 10);
    const notes = mockTrainerNotes
      .filter((n) => n.customer_id === custId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: notes };
  }

  // 8. INSERT NOTE: INSERT INTO trainer_notes (customer_id, note)
  if (queryStr.includes('INSERT INTO trainer_notes')) {
    const customerId = parseInt(params[0], 10);
    const noteText = params[1];
    const newNote = {
      id: noteAutoId++,
      customer_id: customerId,
      note: noteText,
      created_at: new Date().toISOString()
    };
    mockTrainerNotes.unshift(newNote);
    return { rows: [newNote] };
  }

  // 9. DELETE NOTE: DELETE FROM trainer_notes WHERE id = $1 AND customer_id = $2
  if (queryStr.includes('DELETE FROM trainer_notes')) {
    const noteId = parseInt(params[0], 10);
    const custId = parseInt(params[1], 10);
    const idx = mockTrainerNotes.findIndex((n) => n.id === noteId && n.customer_id === custId);
    if (idx !== -1) {
      mockTrainerNotes.splice(idx, 1);
      return { rows: [{ id: noteId }] };
    }
    return { rows: [] };
  }

  // 10. INSERT CUSTOMER: INSERT INTO customers
  if (queryStr.includes('INSERT INTO customers')) {
    const [name, age, gender, height, weight, goal, act, diet, fav, allg, phone, email, lang] = params;
    const newCustomer = {
      id: customerAutoId++,
      name,
      age: parseInt(age, 10),
      gender,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      goal,
      activity_level: act,
      diet_preference: diet,
      favorite_foods: fav,
      allergies: allg,
      phone,
      email,
      language: lang || 'en',
      created_at: new Date().toISOString()
    };
    mockCustomers.unshift(newCustomer);
    return { rows: [newCustomer] };
  }

  // 11. INSERT DIET PLAN: INSERT INTO diet_plans
  if (queryStr.includes('INSERT INTO diet_plans')) {
    const [cId, bmr, tdee, targetCal, prot, carbs, fat, lang, pData] = params;
    const newPlan = {
      id: dietPlanAutoId++,
      customer_id: parseInt(cId, 10),
      bmr: parseFloat(bmr),
      tdee: parseFloat(tdee),
      target_calories: parseFloat(targetCal),
      protein_g: parseFloat(prot),
      carbs_g: parseFloat(carbs),
      fat_g: parseFloat(fat),
      language: lang || 'en',
      plan_data: typeof pData === 'string' ? JSON.parse(pData) : pData,
      created_at: new Date().toISOString()
    };
    mockDietPlans.unshift(newPlan);
    return { rows: [newPlan] };
  }

  // 12. ALL DIET PLANS: SELECT dp.*, c.name FROM diet_plans
  if (queryStr.includes('FROM diet_plans dp') && queryStr.includes('JOIN customers c')) {
    const rows = mockDietPlans.map((dp) => {
      const cust = mockCustomers.find((c) => c.id === dp.customer_id) || {};
      return {
        ...dp,
        name: cust.name || 'Member',
        goal: cust.goal || 'Fitness',
        diet_preference: cust.diet_preference || 'Standard',
        email: cust.email || ''
      };
    });
    return { rows };
  }

  return { rows: [] };
}

/**
 * Execute a parameterized query against PostgreSQL or fallback store.
 * @param {string} text - SQL query with parameter placeholders ($1, $2, etc.)
 * @param {Array} params - Array of parameter values
 */
const query = async (text, params) => {
  if (isPostgresAvailable === false) {
    return executeMemoryQuery(text, params);
  }

  try {
    const res = await pool.query(text, params);
    isPostgresAvailable = true;
    return res;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message?.includes('connect ECONNREFUSED')) {
      if (isPostgresAvailable !== false) {
        console.warn('⚠️ PostgreSQL offline. Activating in-memory store fallback.');
      }
      isPostgresAvailable = false;
      return executeMemoryQuery(text, params);
    }
    throw err;
  }
};

/**
 * Test PostgreSQL connectivity
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time');
    isPostgresAvailable = true;
    return { connected: true, timestamp: res.rows[0].current_time };
  } catch (err) {
    isPostgresAvailable = false;
    return { connected: false, error: err.message, fallbackActive: true };
  }
};

/**
 * Initialize Database Schema (creates `customers`, `diet_plans`, and `trainer_notes` tables)
 */
const initDb = async () => {
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      age INTEGER NOT NULL,
      gender VARCHAR(50) NOT NULL,
      height_cm NUMERIC(5, 2) NOT NULL,
      weight_kg NUMERIC(5, 2) NOT NULL,
      goal VARCHAR(100) NOT NULL,
      activity_level VARCHAR(100) NOT NULL,
      diet_preference VARCHAR(100) NOT NULL,
      favorite_foods TEXT,
      allergies TEXT,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      language VARCHAR(2) DEFAULT 'en',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createDietPlansTable = `
    CREATE TABLE IF NOT EXISTS diet_plans (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      bmr NUMERIC(7, 2) NOT NULL,
      tdee NUMERIC(7, 2) NOT NULL,
      target_calories NUMERIC(7, 2) NOT NULL,
      protein_g NUMERIC(6, 2) NOT NULL,
      carbs_g NUMERIC(6, 2) NOT NULL,
      fat_g NUMERIC(6, 2) NOT NULL,
      language VARCHAR(2) DEFAULT 'en',
      plan_data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTrainerNotesTable = `
    CREATE TABLE IF NOT EXISTS trainer_notes (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const alterTablesForStage3C = `
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'en';
    ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'en';
  `;

  try {
    await pool.query(createCustomersTable);
    await pool.query(createDietPlansTable);
    await pool.query(alterTablesForStage3C);
    await pool.query(createTrainerNotesTable);
    isPostgresAvailable = true;
    console.log('✓ PostgreSQL tables ("customers", "diet_plans", "trainer_notes") verified/updated.');
  } catch (err) {
    isPostgresAvailable = false;
    console.log('ℹ In-memory storage ready with sample gym member records.');
  }
};

module.exports = {
  pool,
  query,
  testConnection,
  initDb
};
