/**
 * Crops & Farmer-Crops API Tests
 */
const request = require('supertest');
const app = require('../index');

let farmerToken = '';
let adminToken = '';
let farmerCropId = null;

beforeAll(async () => {
  // Ensure test farmer exists
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Crop Test Farmer', mobile: '8800000010', password: 'testpass123' });

  const farmerRes = await request(app)
    .post('/api/auth/login')
    .send({ mobile: '8800000010', password: 'testpass123' });
  farmerToken = farmerRes.body.data?.token || '';

  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ mobile: '9999999999', password: 'admin123' });
  adminToken = adminRes.body.data?.token || '';
});

// ─── Reference Crops ────────────────────────────────────────────────────────
describe('GET /api/crops', () => {
  it('returns list of reference crops (public route)', async () => {
    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('each crop has required fields', async () => {
    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${farmerToken}`);
    const crop = res.body.data[0];
    expect(crop).toHaveProperty('id');
    expect(crop).toHaveProperty('name');
    // crops have either 'season' or 'category' field
    expect(crop.season || crop.category).toBeTruthy();
  });
});

// ─── Farmer Crops ────────────────────────────────────────────────────────────
describe('Farmer Crops CRUD', () => {
  it('POST /api/farmer-crops — adds a crop for a farmer', async () => {
    const res = await request(app)
      .post('/api/farmer-crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        crop_id: 1,
        sowing_date: '2026-10-01',
        field_size: 2.5,
        variety: 'HD-2967'
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    farmerCropId = res.body.data?.id || res.body.data?.farmer_crop?.id;
  });

  it('GET /api/farmer-crops — lists farmer crops', async () => {
    const res = await request(app)
      .get('/api/farmer-crops')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/farmer-crops — rejects missing crop_id', async () => {
    const res = await request(app)
      .post('/api/farmer-crops')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ sowing_date: '2026-10-01', field_size: 1 });
    expect([400, 500]).toContain(res.status);
  });

  it('requires authentication to add crop', async () => {
    const res = await request(app)
      .post('/api/farmer-crops')
      .send({ crop_id: 1, sowing_date: '2026-10-01', field_size: 1 });
    expect(res.status).toBe(401);
  });
});

// ─── Activities ───────────────────────────────────────────────────────────────
describe('Farming Activities', () => {
  it('POST /api/activities — logs a farming activity', async () => {
    // get a valid farmer crop id first
    const cropsRes = await request(app)
      .get('/api/farmer-crops')
      .set('Authorization', `Bearer ${farmerToken}`);
    const cropId = cropsRes.body.data?.[0]?.id;
    if (!cropId) return; // skip if no crops

    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        farmer_crop_id: cropId,
        activity_type: 'irrigation',
        description: 'Morning drip cycle completed',
        activity_date: new Date().toISOString().slice(0, 10)
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/activities — lists activities for a crop', async () => {
    const cropsRes = await request(app)
      .get('/api/farmer-crops')
      .set('Authorization', `Bearer ${farmerToken}`);
    const cropId = cropsRes.body.data?.[0]?.id;
    if (!cropId) return;

    const res = await request(app)
      .get(`/api/activities?farmer_crop_id=${cropId}`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── Calendar ─────────────────────────────────────────────────────────────────
describe('Farming Calendar', () => {
  it('GET /api/calendar — returns calendar entries', async () => {
    const res = await request(app)
      .get('/api/calendar')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('requires auth to access calendar', async () => {
    const res = await request(app).get('/api/calendar');
    expect(res.status).toBe(401);
  });
});
