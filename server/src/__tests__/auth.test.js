/**
 * Auth API Tests — registration, login, JWT, RBAC
 */
const request = require('supertest');
const app = require('../index');

const FARMER_MOBILE = '8800000001';
const FARMER_PASS = 'testpass123';
const ADMIN_MOBILE = '9999999999';
const ADMIN_PASS = 'admin123';

let farmerToken = '';
let adminToken = '';

// ─── Registration ──────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('registers a new farmer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Farmer', mobile: FARMER_MOBILE, password: FARMER_PASS });
    // may already exist from previous run — both 201 and 400 (duplicate) are acceptable
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.user.role).toBe('farmer');
    }
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ mobile: '8800000002' }); // missing name & password
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
  });

  it('rejects registration with short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Short', mobile: '8800000003', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects duplicate mobile number', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup User', mobile: ADMIN_MOBILE, password: 'anypass123' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── Login ─────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  it('logs in an existing farmer', async () => {
    // ensure user exists first
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Farmer', mobile: FARMER_MOBILE, password: FARMER_PASS });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: FARMER_MOBILE, password: FARMER_PASS });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    farmerToken = res.body.data.token;
  });

  it('logs in admin with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: ADMIN_MOBILE, password: ADMIN_PASS });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe('admin');
    adminToken = res.body.data.token;
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: ADMIN_MOBILE, password: 'wrongpass' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects non-existent mobile', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '0000000000', password: 'anypass123' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects request with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: ADMIN_MOBILE }); // no password
    expect(res.status).toBe(400);
  });
});

// ─── /me (authenticated identity) ──────────────────────────────────────────
describe('GET /api/auth/me', () => {
  it('returns current user when token is valid', async () => {
    // get a fresh token
    await request(app).post('/api/auth/register')
      .send({ name: 'Test Farmer', mobile: FARMER_MOBILE, password: FARMER_PASS });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ mobile: FARMER_MOBILE, password: FARMER_PASS });
    const token = loginRes.body.data?.token || farmerToken;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid / expired token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
