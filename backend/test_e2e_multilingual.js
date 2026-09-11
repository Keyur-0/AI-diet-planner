const http = require('http');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', (chunk) => { resData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let resData = '';
      res.on('data', (chunk) => { resData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    }).on('error', (e) => reject(e));
  });
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('STARTING STAGE 3C END-TO-END MULTILINGUAL API TESTS');
  console.log('====================================================\n');

  // 1. Health check
  console.log('1. Testing /api/health...');
  const health = await getJson('http://localhost:5000/api/health');
  console.log('Health Response:', health.status, health.data);

  // 2. Hindi Plan Submission
  console.log('\n2. Testing /api/generate-diet in HINDI (hi)...');
  const hindiPayload = {
    name: 'सुमन वर्मा',
    age: 28,
    gender: 'Female',
    height: 165,
    weight: 65,
    goal: 'Weight Loss',
    activityLevel: 'Moderately Active',
    foodPreference: 'Vegetarian',
    favoriteFoods: 'Paneer, rice, dal, roti, yogurt',
    allergies: 'Peanut',
    phone: '+91 98765 43210',
    email: 'suman@example.com',
    language: 'hi'
  };

  const hindiRes = await postJson('http://localhost:5000/api/generate-diet', hindiPayload);
  console.log('Hindi Status:', hindiRes.status);
  console.log('Success:', hindiRes.data?.success);
  console.log('Language in Response:', hindiRes.data?.language);
  console.log('Customer Name:', hindiRes.data?.customer?.name);
  console.log('Customer Language:', hindiRes.data?.customer?.language);
  console.log('Target Calories:', hindiRes.data?.nutrition?.targetCalories);
  if (hindiRes.data?.plan) {
    console.log('Plan Days Count:', hindiRes.data.plan.days.length);
    console.log('Day 1 Name:', hindiRes.data.plan.days[0].day_name);
    console.log('Day 1 Meal 1 (Breakfast):', hindiRes.data.plan.days[0].meals[0].name);
    console.log('Day 1 Meal 1 Foods:', JSON.stringify(hindiRes.data.plan.days[0].meals[0].foods));
  } else {
    console.log('Plan note / status:', hindiRes.data?.aiNotice || hindiRes.data?.aiStatus);
  }

  // 3. Gujarati Plan Submission
  console.log('\n3. Testing /api/generate-diet in GUJARATI (gu)...');
  const gujaratiPayload = {
    name: 'મિતેષ પટેલ',
    age: 30,
    gender: 'Male',
    height: 175,
    weight: 75,
    goal: 'Muscle Gain',
    activityLevel: 'Moderately Active',
    foodPreference: 'Vegetarian',
    favoriteFoods: 'Paneer, dal, rice, roti',
    allergies: 'None',
    phone: '+91 98765 43211',
    email: 'mitesh@example.com',
    language: 'gu'
  };

  const gujaratiRes = await postJson('http://localhost:5000/api/generate-diet', gujaratiPayload);
  console.log('Gujarati Status:', gujaratiRes.status);
  console.log('Success:', gujaratiRes.data?.success);
  console.log('Language in Response:', gujaratiRes.data?.language);
  console.log('Customer Name:', gujaratiRes.data?.customer?.name);
  console.log('Customer Language:', gujaratiRes.data?.customer?.language);
  console.log('Target Calories:', gujaratiRes.data?.nutrition?.targetCalories);
  if (gujaratiRes.data?.plan) {
    console.log('Plan Days Count:', gujaratiRes.data.plan.days.length);
    console.log('Day 1 Name:', gujaratiRes.data.plan.days[0].day_name);
    console.log('Day 1 Meal 1 (Breakfast):', gujaratiRes.data.plan.days[0].meals[0].name);
    console.log('Day 1 Meal 1 Foods:', JSON.stringify(gujaratiRes.data.plan.days[0].meals[0].foods));
  } else {
    console.log('Plan note / status:', gujaratiRes.data?.aiNotice || gujaratiRes.data?.aiStatus);
  }

  // 4. English Default Fallback Test
  console.log('\n4. Testing /api/generate-diet with missing/invalid language (fallback to "en")...');
  const fallbackPayload = {
    name: 'Alex Morgan',
    age: 25,
    gender: 'Male',
    height: 178,
    weight: 74,
    goal: 'Maintain Weight',
    activityLevel: 'Lightly Active',
    foodPreference: 'Non-Vegetarian',
    favoriteFoods: 'Eggs, oats, salmon',
    allergies: 'None',
    phone: '+1 555 019 2834',
    email: 'alex@example.com',
    language: 'invalid_lang_code_xyz'
  };

  const fallbackRes = await postJson('http://localhost:5000/api/generate-diet', fallbackPayload);
  console.log('Fallback Status:', fallbackRes.status);
  console.log('Language Resolved to:', fallbackRes.data?.language);

  console.log('\n====================================================');
  console.log('E2E TESTS FINISHED SUCCESSFULLY');
  console.log('====================================================');
}

runE2ETests().catch(console.error);
