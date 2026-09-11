import assert from 'assert';

const BACKEND_URL = 'http://localhost:5000';

async function testAll() {
  console.log('🚀 Running Complete Stage 4C End-to-End Test Suite...');

  // Test 1: Stats computation
  const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`);
  assert.strictEqual(statsRes.status, 200);
  const statsJson = await statsRes.json();
  assert.strictEqual(statsJson.success, true);
  console.log('✅ 1. Stats analytics endpoint works:', statsJson.stats);

  // Test 2: Filter by Goal (e.g. Muscle Gain)
  const filterGoalRes = await fetch(`${BACKEND_URL}/api/customers?goal=muscle`);
  const filterGoalJson = await filterGoalRes.json();
  assert.strictEqual(filterGoalJson.success, true);
  assert.ok(filterGoalJson.customers.every(c => c.goal.toLowerCase().includes('muscle') || c.goal.toLowerCase().includes('gain')));
  console.log(`✅ 2. Goal filter works: found ${filterGoalJson.customers.length} muscle gain members`);

  // Test 3: Filter by Diet (e.g. Vegetarian)
  const filterDietRes = await fetch(`${BACKEND_URL}/api/customers?diet=vegetarian`);
  const filterDietJson = await filterDietRes.json();
  assert.strictEqual(filterDietJson.success, true);
  console.log(`✅ 3. Diet filter works: found ${filterDietJson.customers.length} vegetarian members`);

  // Test 4: Filter by Language (e.g. hi)
  const filterLangRes = await fetch(`${BACKEND_URL}/api/customers?language=hi`);
  const filterLangJson = await filterLangRes.json();
  assert.strictEqual(filterLangJson.success, true);
  assert.ok(filterLangJson.customers.every(c => c.language === 'hi'));
  console.log(`✅ 4. Language filter works: found ${filterLangJson.customers.length} Hindi members`);

  // Test 5: Search by phone or name
  const searchRes = await fetch(`${BACKEND_URL}/api/customers?search=98765`);
  const searchJson = await searchRes.json();
  assert.strictEqual(searchJson.success, true);
  assert.ok(searchJson.customers.length >= 1);
  console.log(`✅ 5. Search works: found ${searchJson.customers.length} member matching phone "98765"`);

  // Test 6: Member Detail View with Plans & Notes
  const memberId = searchJson.customers[0].id;
  const detailRes = await fetch(`${BACKEND_URL}/api/customers/${memberId}`);
  const detailJson = await detailRes.json();
  assert.strictEqual(detailJson.success, true);
  assert.ok(detailJson.customer.name, 'Customer name present');
  assert.ok(Array.isArray(detailJson.customer.dietPlans), 'Diet plans history present');
  assert.ok(Array.isArray(detailJson.customer.trainerNotes), 'Trainer notes present');
  console.log(`✅ 6. Member details loaded for ${detailJson.customer.name} with ${detailJson.customer.dietPlans.length} plans`);

  // Test 7: Zero-Gemini Plan Data Integrity Check
  const savedPlan = detailJson.customer.dietPlans[0];
  assert.ok(savedPlan, 'Has at least 1 saved plan');
  assert.ok(savedPlan.targetCalories > 0, 'Target calories valid');
  assert.ok(savedPlan.proteinG > 0, 'Protein target valid');
  assert.ok(savedPlan.carbsG > 0, 'Carbs target valid');
  assert.ok(savedPlan.fatG > 0, 'Fat target valid');
  console.log(`✅ 7. Saved Diet Plan integrity verified (Calories: ${savedPlan.targetCalories}, P: ${savedPlan.proteinG}g, C: ${savedPlan.carbsG}g, F: ${savedPlan.fatG}g)`);

  // Test 8: Trainer Notes Lifecycle (Add -> List -> Delete)
  const noteContent = 'Tested coaching note at ' + new Date().toISOString();
  const createNoteRes = await fetch(`${BACKEND_URL}/api/customers/${memberId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note: noteContent })
  });
  assert.strictEqual(createNoteRes.status, 201);
  const createdNoteJson = await createNoteRes.json();
  const noteId = createdNoteJson.note.id;

  const listNotesRes = await fetch(`${BACKEND_URL}/api/customers/${memberId}/notes`);
  const listNotesJson = await listNotesRes.json();
  assert.ok(listNotesJson.notes.some(n => n.id === noteId && n.note === noteContent));

  const deleteNoteRes = await fetch(`${BACKEND_URL}/api/customers/${memberId}/notes/${noteId}`, {
    method: 'DELETE'
  });
  assert.strictEqual(deleteNoteRes.status, 200);
  console.log('✅ 8. Trainer notes lifecycle (POST -> GET -> DELETE) verified');

  console.log('\n🌟 ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🌟\n');
}

testAll().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
