import assert from 'assert';

const BACKEND_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting Stage 4C Admin Portal Backend & Integration Tests...');

  // 1. Check /api/admin/stats
  console.log('\n1. Testing GET /api/admin/stats...');
  const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`);
  assert.strictEqual(statsRes.status, 200, 'Stats endpoint should return 200');
  const statsData = await statsRes.json();
  assert.strictEqual(statsData.success, true, 'Stats should be success: true');
  assert.ok(typeof statsData.stats.totalLeads === 'number', 'totalLeads should be number');
  assert.ok(typeof statsData.stats.todayLeads === 'number', 'todayLeads should be number');
  assert.ok(typeof statsData.stats.weekLeads === 'number', 'weekLeads should be number');
  assert.ok(typeof statsData.stats.totalPlans === 'number', 'totalPlans should be number');
  assert.ok(statsData.stats.goals, 'stats should have goals breakdown');
  assert.ok(statsData.stats.languages, 'stats should have languages breakdown');
  console.log('✅ Stats endpoint verified:', JSON.stringify(statsData.stats));

  // 2. Check GET /api/customers (all)
  console.log('\n2. Testing GET /api/customers pagination & list...');
  const customersRes = await fetch(`${BACKEND_URL}/api/customers?page=1&limit=10`);
  assert.strictEqual(customersRes.status, 200, 'Customers endpoint should return 200');
  const customersData = await customersRes.json();
  assert.strictEqual(customersData.success, true, 'Customers response should be success: true');
  assert.ok(Array.isArray(customersData.customers), 'customers should be an array');
  console.log(`✅ Customers list verified: found ${customersData.total} members (page ${customersData.page}/${customersData.totalPages})`);

  let testCustomerId = null;
  if (customersData.customers.length > 0) {
    testCustomerId = customersData.customers[0].id;
  }

  // If no customers, create a test lead first
  if (!testCustomerId) {
    console.log('\nCreating a test customer lead...');
    const createRes = await fetch(`${BACKEND_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Stage4C Coach Test Lead',
        age: 29,
        gender: 'male',
        height: 180,
        weight: 80,
        goal: 'muscleGain',
        activityLevel: 'moderate',
        foodPreference: 'non-vegetarian',
        favoriteFoods: 'Chicken breast, eggs, brown rice',
        allergies: 'None',
        phone: '+91 99887 76655',
        email: 'coach.test@pulsefit.example',
        language: 'en'
      })
    });
    const createData = await createRes.json();
    testCustomerId = createData.customer.id;
    console.log('✅ Test customer created with ID:', testCustomerId);
  }

  // 3. Check GET /api/customers with search filter
  console.log('\n3. Testing GET /api/customers?search=...');
  const firstCustomer = customersData.customers[0] || { name: 'Test' };
  const searchKeyword = firstCustomer.name.split(' ')[0];
  const searchRes = await fetch(`${BACKEND_URL}/api/customers?search=${encodeURIComponent(searchKeyword)}`);
  const searchData = await searchRes.json();
  assert.strictEqual(searchData.success, true);
  assert.ok(searchData.customers.length > 0, `Search for "${searchKeyword}" should return results`);
  console.log(`✅ Search for "${searchKeyword}" returned ${searchData.customers.length} result(s)`);

  // 4. Check GET /api/customers/:id
  console.log(`\n4. Testing GET /api/customers/${testCustomerId}...`);
  const detailRes = await fetch(`${BACKEND_URL}/api/customers/${testCustomerId}`);
  assert.strictEqual(detailRes.status, 200);
  const detailData = await detailRes.json();
  assert.strictEqual(detailData.success, true);
  assert.ok(detailData.customer, 'Should return customer object');
  assert.ok(Array.isArray(detailData.customer.dietPlans), 'Should include dietPlans array');
  assert.ok(Array.isArray(detailData.customer.trainerNotes), 'Should include trainerNotes array');
  console.log('✅ Customer details retrieved with', detailData.customer.dietPlans.length, 'saved plans');

  // 5. Check Trainer Notes CRUD: POST note
  console.log(`\n5. Testing POST /api/customers/${testCustomerId}/notes...`);
  const testNoteText = `Coach Follow-up at ${new Date().toISOString()}: Member requested higher morning carb intake before heavy squats.`;
  const addNoteRes = await fetch(`${BACKEND_URL}/api/customers/${testCustomerId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: testNoteText })
  });
  assert.strictEqual(addNoteRes.status, 201, 'POST note should return 201 Created');
  const addNoteData = await addNoteRes.json();
  assert.strictEqual(addNoteData.success, true);
  assert.strictEqual(addNoteData.note.note, testNoteText);
  const createdNoteId = addNoteData.note.id;
  console.log('✅ Trainer note successfully created with ID:', createdNoteId);

  // 6. Check Trainer Notes GET
  console.log(`\n6. Testing GET /api/customers/${testCustomerId}/notes...`);
  const getNotesRes = await fetch(`${BACKEND_URL}/api/customers/${testCustomerId}/notes`);
  assert.strictEqual(getNotesRes.status, 200);
  const getNotesData = await getNotesRes.json();
  assert.strictEqual(getNotesData.success, true);
  const matchingNote = getNotesData.notes.find(n => n.id === createdNoteId);
  assert.ok(matchingNote, 'Created note should be in notes list');
  console.log('✅ Trainer notes list contains created note');

  // 7. Check Trainer Notes DELETE
  console.log(`\n7. Testing DELETE /api/customers/${testCustomerId}/notes/${createdNoteId}...`);
  const deleteNoteRes = await fetch(`${BACKEND_URL}/api/customers/${testCustomerId}/notes/${createdNoteId}`, {
    method: 'DELETE'
  });
  assert.strictEqual(deleteNoteRes.status, 200);
  const deleteNoteData = await deleteNoteRes.json();
  assert.strictEqual(deleteNoteData.success, true);

  // Verify deletion
  const verifyNotesRes = await fetch(`${BACKEND_URL}/api/customers/${testCustomerId}/notes`);
  const verifyNotesData = await verifyNotesRes.json();
  const foundDeleted = verifyNotesData.notes.find(n => n.id === createdNoteId);
  assert.strictEqual(foundDeleted, undefined, 'Deleted note must not appear');
  console.log('✅ Trainer note successfully deleted and verified');

  console.log('\n🎉 ALL STAGE 4C ADMIN PORTAL BACKEND & DATABASE TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Stage 4C test failure:', err);
  process.exit(1);
});
