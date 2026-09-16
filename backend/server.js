require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const nutrition = require('./nutrition');
const gemini = require('./gemini');
const { validateCredentials, generateToken, requireAdminAuth } = require('./auth');
const { dietGenerationLimiter } = require('./rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Enable JSON body parsing with safe syntax error handling
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided in request.'
    });
  }
  next(err);
});

// ----------------------------------------------------
// 1. Admin Authentication Endpoint (Stage 4D.1)
// ----------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const isValid = validateCredentials(email, password);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid admin email or password.'
    });
  }

  const token = generateToken({ email: email.toLowerCase().trim() });
  return res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      email: email.toLowerCase().trim(),
      role: 'admin'
    }
  });
});

// ----------------------------------------------------
// 2. Health Check Endpoint (Includes PostgreSQL & AI Status)
// ----------------------------------------------------
app.get('/api/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
    process.env.GEMINI_API_KEY.trim().length > 0
  );

  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      message: 'Backend is running',
      database: 'connected',
      aiEngine: hasGeminiKey ? 'configured' : 'missing_api_key',
      supportedLanguages: ['en', 'hi', 'gu'],
      timestamp: dbStatus.timestamp
    });
  } else {
    return res.status(503).json({
      success: false,
      message: 'Backend is running but database is disconnected',
      database: 'disconnected',
      aiEngine: hasGeminiKey ? 'configured' : 'missing_api_key',
      supportedLanguages: ['en', 'hi', 'gu'],
      error: 'PostgreSQL connection failed'
    });
  }
});

// ----------------------------------------------------
// 3. Diet Lead Registration, Nutrition Calculation & AI 7-Day Plan Generation
// ----------------------------------------------------
app.post('/api/generate-diet', dietGenerationLimiter, async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      weight,
      goal,
      activityLevel,
      foodPreference,
      favoriteFoods,
      allergies,
      phone,
      email,
      language
    } = req.body;

    // 1. Validate and sanitize language (Stage 3C)
    const allowedLanguages = ['en', 'hi', 'gu'];
    let selectedLanguage = 'en';
    if (language && typeof language === 'string' && allowedLanguages.includes(language.toLowerCase().trim())) {
      selectedLanguage = language.toLowerCase().trim();
    }

    // 2. Validate required fields
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('name');
    if (age === undefined || age === null || age === '') missingFields.push('age');
    if (!gender || !gender.trim()) missingFields.push('gender');
    if (height === undefined || height === null || height === '') missingFields.push('height');
    if (weight === undefined || weight === null || weight === '') missingFields.push('weight');
    if (!goal || !goal.trim()) missingFields.push('goal');
    if (!activityLevel || !activityLevel.trim()) missingFields.push('activityLevel');
    if (!foodPreference || !foodPreference.trim()) missingFields.push('foodPreference');
    if (!phone || !phone.trim()) missingFields.push('phone');
    if (!email || !email.trim()) missingFields.push('email');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // 3. Validate numeric boundaries and formats
    const parsedAge = parseInt(age, 10);
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);

    if (isNaN(parsedAge) || parsedAge < 12 || parsedAge > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age. Must be a number between 12 and 100.'
      });
    }

    if (isNaN(parsedHeight) || parsedHeight < 80 || parsedHeight > 250) {
      return res.status(400).json({
        success: false,
        message: 'Invalid height. Must be between 80cm and 250cm.'
      });
    }

    if (isNaN(parsedWeight) || parsedWeight < 25 || parsedWeight > 300) {
      return res.status(400).json({
        success: false,
        message: 'Invalid weight. Must be between 25kg and 300kg.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    if (phone.trim().length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format.'
      });
    }

    // 4. Deterministic Nutrition Engine Calculation (Stage 3A)
    const nutritionTargets = nutrition.calculateNutritionTargets({
      weight: parsedWeight,
      height: parsedHeight,
      age: parsedAge,
      gender: gender.trim(),
      goal: goal.trim(),
      activityLevel: activityLevel.trim()
    });

    let savedCustomerId = null;
    let savedCustomerCreatedAt = new Date().toISOString();
    let isDbConnected = false;

    // 5. Parameterized SQL insert into `customers` table
    try {
      const insertCustomerQuery = `
        INSERT INTO customers (
          name,
          age,
          gender,
          height_cm,
          weight_kg,
          goal,
          activity_level,
          diet_preference,
          favorite_foods,
          allergies,
          phone,
          email,
          language
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;

      const customerValues = [
        name.trim(),
        parsedAge,
        gender.trim(),
        parsedHeight,
        parsedWeight,
        goal.trim(),
        activityLevel.trim(),
        foodPreference.trim(),
        favoriteFoods && favoriteFoods.trim() ? favoriteFoods.trim() : null,
        allergies && allergies.trim() ? allergies.trim() : null,
        phone.trim(),
        email.trim(),
        selectedLanguage
      ];

      const customerResult = await db.query(insertCustomerQuery, customerValues);
      savedCustomerId = customerResult.rows[0].id;
      savedCustomerCreatedAt = customerResult.rows[0].created_at;
      isDbConnected = true;
    } catch (dbErr) {
      console.warn('⚠️ PostgreSQL offline: Proceeding with generated lead in memory.', dbErr.message);
      savedCustomerId = Math.floor(100 + Math.random() * 900);
    }

    const formattedCustomer = {
      id: savedCustomerId,
      name: name.trim(),
      age: parsedAge,
      gender: gender.trim(),
      height: parsedHeight,
      weight: parsedWeight,
      goal: goal.trim(),
      activityLevel: activityLevel.trim(),
      foodPreference: foodPreference.trim(),
      favoriteFoods: favoriteFoods && favoriteFoods.trim() ? favoriteFoods.trim() : 'None specified',
      allergies: allergies && allergies.trim() ? allergies.trim() : 'None',
      phone: phone.trim(),
      email: email.trim(),
      language: selectedLanguage,
      createdAt: savedCustomerCreatedAt
    };

    // 6. Stage 3B & 3C: Call Gemini AI to Generate 7-Day Meal Plan in the selected language
    let generatedPlan = null;
    let aiError = null;

    try {
      generatedPlan = await gemini.generateDietPlan(formattedCustomer, nutritionTargets, selectedLanguage);
    } catch (err) {
      aiError = err.message;
      console.warn('⚠️ Gemini AI Generation Notice:', err.message);
    }

    // 7. Parameterized SQL insert into `diet_plans` table if database is connected
    let savedPlanId = null;
    if (isDbConnected && savedCustomerId) {
      try {
        const planDataPayload = generatedPlan
          ? generatedPlan
          : {
              status: 'calculated_targets_only',
              note: aiError || 'AI meal plan generation pending GEMINI_API_KEY configuration',
              language: selectedLanguage,
              adjustmentType: nutritionTargets.adjustmentType,
              adjustmentCalories: nutritionTargets.adjustmentCalories,
              macroPercentages: {
                proteinPct: nutritionTargets.proteinPct,
                carbsPct: nutritionTargets.carbsPct,
                fatPct: nutritionTargets.fatPct
              }
            };

        const insertPlanQuery = `
          INSERT INTO diet_plans (
            customer_id,
            bmr,
            tdee,
            target_calories,
            protein_g,
            carbs_g,
            fat_g,
            language,
            plan_data
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;

        const planValues = [
          savedCustomerId,
          nutritionTargets.bmr,
          nutritionTargets.tdee,
          nutritionTargets.targetCalories,
          nutritionTargets.proteinG,
          nutritionTargets.carbsG,
          nutritionTargets.fatG,
          selectedLanguage,
          JSON.stringify(planDataPayload)
        ];

        const planResult = await db.query(insertPlanQuery, planValues);
        savedPlanId = planResult.rows[0].id;
      } catch (planDbErr) {
        console.warn('⚠️ Could not save diet_plan to DB:', planDbErr.message);
      }
    }

    // 8. Return complete payload to frontend with language
    return res.status(201).json({
      success: true,
      message: generatedPlan
        ? `Customer profile and 7-day AI diet plan generated successfully in ${selectedLanguage}.`
        : 'Customer profile saved and nutrition targets calculated successfully.',
      customer: formattedCustomer,
      nutrition: nutritionTargets,
      plan: generatedPlan,
      language: selectedLanguage,
      aiStatus: generatedPlan ? 'generated' : 'pending_key',
      aiNotice: aiError,
      dietPlan: {
        id: savedPlanId || savedCustomerId,
        language: selectedLanguage,
        createdAt: savedCustomerCreatedAt
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error: Unable to process diet plan request.'
    });
  }
});

// ----------------------------------------------------
// 3. Admin Lead Stats Summary (Stage 4C & 4D.1 - Protected)
// ----------------------------------------------------
app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*)::int AS total_leads,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END)::int AS today_leads,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('week', CURRENT_DATE) THEN 1 END)::int AS week_leads,
        COUNT(CASE WHEN goal ILIKE '%loss%' OR goal ILIKE '%fat%' OR goal ILIKE '%वजन घटा%' OR goal ILIKE '%વજન ઘટા%' THEN 1 END)::int AS goal_weight_loss,
        COUNT(CASE WHEN goal ILIKE '%muscle%' OR goal ILIKE '%gain%' OR goal ILIKE '%मांसपेशी%' OR goal ILIKE '%સ્નાયુ%' THEN 1 END)::int AS goal_muscle_gain,
        COUNT(CASE WHEN goal ILIKE '%maintain%' OR goal ILIKE '%जालंधर%' OR goal ILIKE '%જાળવ%' THEN 1 END)::int AS goal_maintain,
        COUNT(CASE WHEN language = 'en' THEN 1 END)::int AS lang_en,
        COUNT(CASE WHEN language = 'hi' THEN 1 END)::int AS lang_hi,
        COUNT(CASE WHEN language = 'gu' THEN 1 END)::int AS lang_gu
      FROM customers;
    `;

    const result = await db.query(statsQuery);
    const row = result.rows[0] || {};

    const totalPlansQuery = `SELECT COUNT(*)::int AS total_plans FROM diet_plans;`;
    const plansResult = await db.query(totalPlansQuery).catch(() => ({ rows: [{ total_plans: 0 }] }));

    return res.status(200).json({
      success: true,
      stats: {
        totalLeads: row.total_leads || 0,
        todayLeads: row.today_leads || 0,
        weekLeads: row.week_leads || 0,
        totalPlans: plansResult.rows[0]?.total_plans || 0,
        goals: {
          weightLoss: row.goal_weight_loss || 0,
          muscleGain: row.goal_muscle_gain || 0,
          maintain: row.goal_maintain || 0,
        },
        languages: {
          en: row.lang_en || 0,
          hi: row.lang_hi || 0,
          gu: row.lang_gu || 0,
        }
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error: Unable to compute lead statistics.'
    });
  }
});

// ----------------------------------------------------
// 4. Retrieve Customers with Filtering, Search & Pagination (Stage 4C & 4D.1 - Protected)
// ----------------------------------------------------
app.get('/api/customers', requireAdminAuth, async (req, res) => {
  try {
    const {
      search,
      goal,
      diet,
      language,
      dateRange,
      page = 1,
      limit = 20
    } = req.query;

    const conditions = [];
    const values = [];
    let valIndex = 1;

    // 1. Search filter across name, phone, email
    if (search && search.trim()) {
      const searchParam = `%${search.trim()}%`;
      conditions.push(`(c.name ILIKE $${valIndex} OR c.phone ILIKE $${valIndex} OR c.email ILIKE $${valIndex})`);
      values.push(searchParam);
      valIndex++;
    }

    // 2. Goal filter
    if (goal && goal !== 'all' && goal.trim()) {
      conditions.push(`c.goal ILIKE $${valIndex}`);
      values.push(`%${goal.trim()}%`);
      valIndex++;
    }

    // 3. Diet preference filter
    if (diet && diet !== 'all' && diet.trim()) {
      conditions.push(`c.diet_preference ILIKE $${valIndex}`);
      values.push(`%${diet.trim()}%`);
      valIndex++;
    }

    // 4. Language filter
    if (language && language !== 'all' && language.trim()) {
      conditions.push(`c.language = $${valIndex}`);
      values.push(language.trim().toLowerCase());
      valIndex++;
    }

    // 5. Date range filter
    if (dateRange === 'today') {
      conditions.push(`c.created_at >= CURRENT_DATE`);
    } else if (dateRange === 'week') {
      conditions.push(`c.created_at >= DATE_TRUNC('week', CURRENT_DATE)`);
    } else if (dateRange === 'month') {
      conditions.push(`c.created_at >= DATE_TRUNC('month', CURRENT_DATE)`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total matching records
    const countQuery = `SELECT COUNT(*)::int AS total FROM customers c ${whereClause};`;
    const countResult = await db.query(countQuery, values);
    const totalRecords = countResult.rows[0]?.total || 0;

    // Pagination calculations
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    // Data query with diet plan count and latest diet plan info
    const dataQuery = `
      SELECT 
        c.*,
        COUNT(DISTINCT dp.id)::int AS plan_count,
        COUNT(DISTINCT tn.id)::int AS note_count,
        MAX(dp.created_at) AS latest_plan_created_at
      FROM customers c
      LEFT JOIN diet_plans dp ON c.id = dp.customer_id
      LEFT JOIN trainer_notes tn ON c.id = tn.customer_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${valIndex} OFFSET $${valIndex + 1};
    `;

    const dataValues = [...values, parsedLimit, offset];
    const result = await db.query(dataQuery, dataValues);

    const customers = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      height: parseFloat(row.height_cm),
      weight: parseFloat(row.weight_kg),
      goal: row.goal,
      activityLevel: row.activity_level,
      foodPreference: row.diet_preference,
      favoriteFoods: row.favorite_foods,
      allergies: row.allergies,
      phone: row.phone,
      email: row.email,
      language: row.language || 'en',
      createdAt: row.created_at,
      planCount: row.plan_count || 0,
      plansCount: row.plan_count || 0,
      noteCount: row.note_count || 0,
      notesCount: row.note_count || 0,
      latestPlanDate: row.latest_plan_created_at,
    }));

    return res.status(200).json({
      success: true,
      customers,
      total: totalRecords,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(totalRecords / parsedLimit) || 1,
      pagination: {
        total: totalRecords,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(totalRecords / parsedLimit) || 1,
      }
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error: Unable to retrieve customer records.'
    });
  }
});

// ----------------------------------------------------
// 5. Retrieve Single Member Profile, Saved Plans & Notes (Stage 4C & 4D.1 - Protected)
// ----------------------------------------------------
app.get('/api/customers/:id', requireAdminAuth, async (req, res) => {
  try {
    if (!req.params.id || !/^\d+$/.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID.'
      });
    }
    const customerId = parseInt(req.params.id, 10);

    // 1. Fetch Customer Record
    const customerResult = await db.query('SELECT * FROM customers WHERE id = $1;', [customerId]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer record not found.'
      });
    }

    const row = customerResult.rows[0];
    const customer = {
      id: row.id,
      name: row.name,
      age: row.age,
      gender: row.gender,
      height: parseFloat(row.height_cm),
      weight: parseFloat(row.weight_kg),
      goal: row.goal,
      activityLevel: row.activity_level,
      foodPreference: row.diet_preference,
      favoriteFoods: row.favorite_foods,
      allergies: row.allergies,
      phone: row.phone,
      email: row.email,
      language: row.language || 'en',
      createdAt: row.created_at
    };

    // 2. Fetch Associated Saved Diet Plans History (Ordered newest first)
    const plansResult = await db.query(
      'SELECT * FROM diet_plans WHERE customer_id = $1 ORDER BY created_at DESC;',
      [customerId]
    );

    const dietPlans = plansResult.rows.map((p) => ({
      id: p.id,
      customerId: p.customer_id,
      bmr: parseFloat(p.bmr),
      tdee: parseFloat(p.tdee),
      targetCalories: parseFloat(p.target_calories),
      proteinG: parseFloat(p.protein_g),
      carbsG: parseFloat(p.carbs_g),
      fatG: parseFloat(p.fat_g),
      language: p.language || 'en',
      planData: p.plan_data,
      createdAt: p.created_at
    }));

    // 3. Fetch Trainer Coaching Notes (Ordered newest first)
    const notesResult = await db.query(
      'SELECT * FROM trainer_notes WHERE customer_id = $1 ORDER BY created_at DESC;',
      [customerId]
    );

    const notes = notesResult.rows.map((n) => ({
      id: n.id,
      customerId: n.customer_id,
      note: n.note,
      createdAt: n.created_at
    }));

    customer.dietPlans = dietPlans;
    customer.trainerNotes = notes;

    return res.status(200).json({
      success: true,
      customer,
      dietPlans,
      notes
    });
  } catch (err) {
    console.error('Error fetching customer details:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error: Unable to retrieve member details.'
    });
  }
});

// ----------------------------------------------------
// 6. Trainer Notes Endpoints (Stage 4C & 4D.1 - Protected)
// ----------------------------------------------------
app.get('/api/customers/:id/notes', requireAdminAuth, async (req, res) => {
  try {
    if (!req.params.id || !/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    }
    const customerId = parseInt(req.params.id, 10);

    const result = await db.query(
      'SELECT * FROM trainer_notes WHERE customer_id = $1 ORDER BY created_at DESC;',
      [customerId]
    );

    const notes = result.rows.map((n) => ({
      id: n.id,
      customerId: n.customer_id,
      note: n.note,
      createdAt: n.created_at
    }));

    return res.status(200).json({ success: true, count: notes.length, notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    return res.status(500).json({ success: false, message: 'Database error: Unable to retrieve notes.' });
  }
});

app.post('/api/customers/:id/notes', requireAdminAuth, async (req, res) => {
  try {
    if (!req.params.id || !/^\d+$/.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    }
    const customerId = parseInt(req.params.id, 10);

    const { note } = req.body;
    if (!note || typeof note !== 'string' || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required.' });
    }

    if (note.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Note exceeds maximum length of 2000 characters.' });
    }

    // Verify customer exists
    const checkCustomer = await db.query('SELECT id FROM customers WHERE id = $1;', [customerId]);
    if (checkCustomer.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer record not found.' });
    }

    const insertQuery = `
      INSERT INTO trainer_notes (customer_id, note)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await db.query(insertQuery, [customerId, note.trim()]);
    const saved = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Trainer note saved successfully.',
      note: {
        id: saved.id,
        customerId: saved.customer_id,
        note: saved.note,
        createdAt: saved.created_at
      }
    });
  } catch (err) {
    console.error('Error adding trainer note:', err);
    return res.status(500).json({ success: false, message: 'Database error: Unable to save note.' });
  }
});

app.delete('/api/customers/:id/notes/:noteId', requireAdminAuth, async (req, res) => {
  try {
    if (!req.params.id || !/^\d+$/.test(req.params.id) || !req.params.noteId || !/^\d+$/.test(req.params.noteId)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs provided.' });
    }
    const customerId = parseInt(req.params.id, 10);
    const noteId = parseInt(req.params.noteId, 10);

    const deleteQuery = `
      DELETE FROM trainer_notes
      WHERE id = $1 AND customer_id = $2
      RETURNING id;
    `;
    const result = await db.query(deleteQuery, [noteId, customerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found or does not belong to this customer.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trainer note deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting note:', err);
    return res.status(500).json({ success: false, message: 'Database error: Unable to delete note.' });
  }
});

// ----------------------------------------------------
// 7. Retrieve All Stored Diet Plans (Stage 3A & 3B & 3C & 4D.1 - Protected)
// ----------------------------------------------------
app.get('/api/diet-plans', requireAdminAuth, async (req, res) => {
  try {
    const queryText = `
      SELECT dp.*, c.name, c.goal, c.diet_preference, c.email
      FROM diet_plans dp
      JOIN customers c ON dp.customer_id = c.id
      ORDER BY dp.created_at DESC;
    `;
    const result = await db.query(queryText);

    const dietPlans = result.rows.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      customerName: row.name,
      goal: row.goal,
      dietPreference: row.diet_preference,
      email: row.email,
      bmr: parseFloat(row.bmr),
      tdee: parseFloat(row.tdee),
      targetCalories: parseFloat(row.target_calories),
      proteinG: parseFloat(row.protein_g),
      carbsG: parseFloat(row.carbs_g),
      fatG: parseFloat(row.fat_g),
      language: row.language || 'en',
      planData: row.plan_data,
      createdAt: row.created_at
    }));

    return res.status(200).json({
      success: true,
      count: dietPlans.length,
      dietPlans
    });
  } catch (err) {
    console.error('Error fetching diet plans:', err);
    return res.status(500).json({
      success: false,
      message: 'Database error: Unable to retrieve diet plans.'
    });
  }
});

// Start Express Server & initialize PostgreSQL schema
app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await db.initDb();
});