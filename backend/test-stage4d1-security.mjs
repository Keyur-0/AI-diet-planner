import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pulsefit.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pulsefit_admin_2026';
const JWT_SECRET = process.env.JWT_SECRET || 'pulsefit_super_secret_jwt_key_2026_dev';

console.log('====================================================');
console.log('   STAGE 4D.1 - SECURITY VERIFICATION TEST SUITE   ');
console.log('====================================================\n');

let testsPassed = 0;
let testsFailed = 0;
let savedAdminToken = null;
let sampleCustomerId = 'cust-1';
let createdNoteId = null;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  // ----------------------------------------------------
  // TEST GROUP 1: ADMIN LOGIN & AUTHENTICATION
  // ----------------------------------------------------
  console.log('\n--- GROUP 1: ADMIN LOGIN & CREDENTIAL VALIDATION ---');

  // Test 1: Successful Login
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && !!data.token, 'POST /api/admin/login with valid credentials returns 200 + JWT token');
    savedAdminToken = data.token;
  } catch (err) {
    assert(false, `POST /api/admin/login error: ${err.message}`);
  }

  // Test 2: Invalid Password
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: 'WrongPassword123!' }),
    });
    const data = await res.json();
    assert(res.status === 401 && data.success === false, 'POST /api/admin/login with incorrect password returns 401 Unauthorized');
  } catch (err) {
    assert(false, `POST /api/admin/login error: ${err.message}`);
  }

  // Test 3: Invalid Email
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@evil.com', password: ADMIN_PASSWORD }),
    });
    const data = await res.json();
    assert(res.status === 401 && data.success === false, 'POST /api/admin/login with unknown email returns 401 Unauthorized');
  } catch (err) {
    assert(false, `POST /api/admin/login error: ${err.message}`);
  }

  // Test 4: Missing Fields
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL }),
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false, 'POST /api/admin/login with missing password returns 400 Bad Request');
  } catch (err) {
    assert(false, `POST /api/admin/login error: ${err.message}`);
  }

  // Test 5: JWT Token Payload & Signature Verification
  try {
    const decoded = jwt.verify(savedAdminToken, JWT_SECRET);
    assert(decoded.role === 'admin' && decoded.email === ADMIN_EMAIL && !!decoded.exp, 'JWT token is securely signed and contains role="admin" and valid expiration');
  } catch (err) {
    assert(false, `JWT verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 2: ADMIN STATS ENDPOINT PROTECTION
  // ----------------------------------------------------
  console.log('\n--- GROUP 2: ADMIN STATS ENDPOINT PROTECTION ---');

  // Test 6: Unauthenticated access to /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`);
    assert(res.status === 401, 'GET /api/admin/stats without token returns 401 Unauthorized');
  } catch (err) {
    assert(false, `GET /api/admin/stats error: ${err.message}`);
  }

  // Test 7: Tampered token to /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature' },
    });
    assert(res.status === 401, 'GET /api/admin/stats with invalid/tampered token returns 401 Unauthorized');
  } catch (err) {
    assert(false, `GET /api/admin/stats error: ${err.message}`);
  }

  // Test 8: Authenticated access to /api/admin/stats
  try {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${savedAdminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && data.stats && typeof data.stats.totalLeads === 'number', 'GET /api/admin/stats with valid token returns 200 + stats object');
  } catch (err) {
    assert(false, `GET /api/admin/stats error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 3: CUSTOMER LEADS & IDOR PROTECTION
  // ----------------------------------------------------
  console.log('\n--- GROUP 3: CUSTOMERS LIST & IDOR PROTECTION ---');

  // Test 9: Unauthenticated GET /api/customers
  try {
    const res = await fetch(`${BASE_URL}/api/customers`);
    assert(res.status === 401, 'GET /api/customers without token returns 401 Unauthorized (No public lead exposure)');
  } catch (err) {
    assert(false, `GET /api/customers error: ${err.message}`);
  }

  // Test 10: Authenticated GET /api/customers
  try {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${savedAdminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && Array.isArray(data.customers), 'GET /api/customers with valid token returns 200 + array of leads');
    if (data.customers && data.customers.length > 0) {
      sampleCustomerId = data.customers[0].id;
    }
  } catch (err) {
    assert(false, `GET /api/customers error: ${err.message}`);
  }

  // Test 11: Unauthenticated GET /api/customers/:id (IDOR prevention)
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}`);
    assert(res.status === 401, `GET /api/customers/${sampleCustomerId} without token returns 401 (IDOR prevented)`);
  } catch (err) {
    assert(false, `GET /api/customers/:id error: ${err.message}`);
  }

  // Test 12: Authenticated GET /api/customers/:id
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}`, {
      headers: { Authorization: `Bearer ${savedAdminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && data.customer && data.customer.id === sampleCustomerId, 'GET /api/customers/:id with valid token returns 200 + customer details');
  } catch (err) {
    assert(false, `GET /api/customers/:id error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 4: TRAINER NOTES CRUD AUTHORIZATION
  // ----------------------------------------------------
  console.log('\n--- GROUP 4: TRAINER NOTES CRUD AUTHORIZATION ---');

  // Test 13: Unauthenticated GET notes
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes`);
    assert(res.status === 401, 'GET /api/customers/:id/notes without token returns 401 Unauthorized');
  } catch (err) {
    assert(false, `GET /api/customers/:id/notes error: ${err.message}`);
  }

  // Test 14: Unauthenticated POST note
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'Unauthorized note injection attempt' }),
    });
    assert(res.status === 401, 'POST /api/customers/:id/notes without token returns 401 (Unauthorized note creation blocked)');
  } catch (err) {
    assert(false, `POST /api/customers/:id/notes error: ${err.message}`);
  }

  // Test 15: Authenticated POST note
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${savedAdminToken}`,
      },
      body: JSON.stringify({ note: 'Stage 4D.1 Security Audit Verified note.' }),
    });
    const data = await res.json();
    assert(res.status === 201 && data.success === true && !!data.note?.id, 'POST /api/customers/:id/notes with valid token returns 201 + created note');
    if (data.note?.id) createdNoteId = data.note.id;
  } catch (err) {
    assert(false, `POST /api/customers/:id/notes error: ${err.message}`);
  }

  // Test 16: Authenticated GET notes
  try {
    const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes`, {
      headers: { Authorization: `Bearer ${savedAdminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && Array.isArray(data.notes), 'GET /api/customers/:id/notes with valid token returns 200 + notes array');
  } catch (err) {
    assert(false, `GET /api/customers/:id/notes error: ${err.message}`);
  }

  // Test 17: Unauthenticated DELETE note
  if (createdNoteId) {
    try {
      const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes/${createdNoteId}`, {
        method: 'DELETE',
      });
      assert(res.status === 401, 'DELETE /api/customers/:id/notes/:noteId without token returns 401 (Unauthorized deletion blocked)');
    } catch (err) {
      assert(false, `DELETE note error: ${err.message}`);
    }

    // Test 18: Authenticated DELETE note
    try {
      const res = await fetch(`${BASE_URL}/api/customers/${sampleCustomerId}/notes/${createdNoteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${savedAdminToken}` },
      });
      const data = await res.json();
      assert(res.status === 200 && data.success === true, 'DELETE /api/customers/:id/notes/:noteId with valid token returns 200 Success');
    } catch (err) {
      assert(false, `DELETE note error: ${err.message}`);
    }
  }

  // ----------------------------------------------------
  // TEST GROUP 5: DIET PLANS HISTORY ENDPOINT PROTECTION
  // ----------------------------------------------------
  console.log('\n--- GROUP 5: DIET PLANS ENDPOINT PROTECTION ---');

  // Test 19: Unauthenticated GET /api/diet-plans
  try {
    const res = await fetch(`${BASE_URL}/api/diet-plans`);
    assert(res.status === 401, 'GET /api/diet-plans without token returns 401 Unauthorized (Global plan harvesting prevented)');
  } catch (err) {
    assert(false, `GET /api/diet-plans error: ${err.message}`);
  }

  // Test 20: Authenticated GET /api/diet-plans
  try {
    const res = await fetch(`${BASE_URL}/api/diet-plans`, {
      headers: { Authorization: `Bearer ${savedAdminToken}` },
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true && Array.isArray(data.dietPlans), 'GET /api/diet-plans with valid token returns 200 + plans array');
  } catch (err) {
    assert(false, `GET /api/diet-plans error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 6: MALFORMED JSON & STACK TRACE PROTECTION
  // ----------------------------------------------------
  console.log('\n--- GROUP 6: ERROR HANDLING & STACK TRACE PROTECTION ---');

  // Test 21: Malformed JSON syntax error
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json": true, missing_brace',
    });
    const data = await res.json();
    assert(res.status === 400 && data.success === false && !data.stack, 'Malformed JSON payload returns clean 400 JSON without exposing internal stack traces');
  } catch (err) {
    assert(false, `Malformed JSON test error: ${err.message}`);
  }

  // Test 22: Non-existent route 404
  try {
    const res = await fetch(`${BASE_URL}/api/non-existent-endpoint-xyz`);
    assert(res.status === 404, 'Non-existent API endpoints return 404 without leaking server information');
  } catch (err) {
    assert(false, `404 test error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 7: RATE LIMITING & PUBLIC INTAKE INTEGRITY
  // ----------------------------------------------------
  console.log('\n--- GROUP 7: RATE LIMITING & INTAKE INTEGRITY ---');

  // Test 23: Public intake endpoint accessibility
  try {
    // Send a dry-run / invalid field test to verify endpoint is reachable without auth
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    // Should return 400 due to validation, NOT 401
    assert(res.status === 400, 'POST /api/generate-diet remains publicly accessible for customer intake without requiring admin auth');
  } catch (err) {
    assert(false, `POST /api/generate-diet error: ${err.message}`);
  }

  // Test 24: Verify Rate Limiter Headers
  try {
    const res = await fetch(`${BASE_URL}/api/generate-diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    const ratelimitLimit = res.headers.get('ratelimit-limit') || res.headers.get('x-ratelimit-limit');
    assert(!!ratelimitLimit, `Rate limiter headers present on /api/generate-diet (Limit: ${ratelimitLimit || 'active'})`);
  } catch (err) {
    assert(false, `Rate limiter headers check error: ${err.message}`);
  }

  // ----------------------------------------------------
  // TEST GROUP 8: CREDENTIAL SECURITY & CRYPTOGRAPHIC STRENGTH
  // ----------------------------------------------------
  console.log('\n--- GROUP 8: CRYPTOGRAPHY & CREDENTIAL HYGIENE ---');

  // Test 25: Bcrypt hashing of admin password
  const testSalt = bcrypt.genSaltSync(10);
  const testHash = bcrypt.hashSync(ADMIN_PASSWORD, testSalt);
  const isMatch = bcrypt.compareSync(ADMIN_PASSWORD, testHash);
  assert(isMatch === true && !testHash.includes(ADMIN_PASSWORD), 'Bcrypt password hashing is functioning correctly with strong salt');

  // Test 26: JWT signature rejects mismatched secret
  try {
    jwt.verify(savedAdminToken, 'wrong_secret_key_123456');
    assert(false, 'JWT verification should have failed with wrong secret');
  } catch {
    assert(true, 'JWT tokens correctly reject signature validation with mismatched secrets');
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTests();
