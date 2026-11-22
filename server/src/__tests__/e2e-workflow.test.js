/**
 * End-to-End System Workflow Integration Test
 * Simulates a complete, multi-step farmer journey across all subsystems
 */
const request = require('supertest');
const app = require('../index');

const UNIQUE_MOBILE = '77' + Math.floor(10000000 + Math.random() * 90000000);
const PASSWORD = 'strongPassword123';

describe('Comprehensive End-to-End Farmer User Journey', () => {
  let token = '';
  let userId = null;
  let farmerCropId = null;
  let conversationId = null;

  // Step 1: Registration
  it('1. Farmer registers with complete profile data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'E2E Test Farmer',
        mobile: UNIQUE_MOBILE,
        password: PASSWORD,
        preferred_language: 'hi',
        village: 'Kalyanpur',
        district: 'Meerut',
        state: 'Uttar Pradesh',
        land_size: 4.5,
        soil_type: 'alluvial',
        irrigation_available: true,
        irrigation_type: 'Tube Well',
        preferred_crops: 'Wheat, Mustard'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    token = res.body.data.token;
    userId = res.body.data.user.id;
  });

  // Step 2: Login
  it('2. Farmer logs in and receives authenticated JWT session', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: UNIQUE_MOBILE, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.mobile).toBe(UNIQUE_MOBILE);
    token = res.body.data.token;
  });

  // Step 3: Fetch & Update Profile
  it('3. Farmer reads and updates agricultural profile', async () => {
    const getRes = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);

    const updateRes = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ village: 'Kalyanpur North', land_size: 5.0 });
    expect([200, 201]).toContain(updateRes.status);
    expect(updateRes.body.success).toBe(true);
  });

  // Step 4: Discover Crop Catalog
  it('4. Farmer inspects reference crop catalog', async () => {
    const res = await request(app)
      .get('/api/crops')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // Step 5: Add Active Crop
  it('5. Farmer adds an active wheat crop with sowing date', async () => {
    const res = await request(app)
      .post('/api/farmer-crops')
      .set('Authorization', `Bearer ${token}`)
      .send({
        crop_id: 1,
        variety: 'HD-3086 (Pusa Gautami)',
        sowing_date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
        field_size: 3.5
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    farmerCropId = res.body.data?.id || res.body.data?.farmer_crop?.id;
  });

  // Step 6: Log Farm Activity
  it('6. Farmer logs an irrigation and fertilizer event', async () => {
    if (!farmerCropId) return;

    const res = await request(app)
      .post('/api/activities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmer_crop_id: farmerCropId,
        activity_type: 'irrigation',
        description: 'First Crown Root Initiation (CRI) irrigation completed with tube well',
        activity_date: new Date().toISOString().slice(0, 10)
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  // Step 7: View Dynamic Calendar
  it('7. Farmer views generated agricultural calendar', async () => {
    const res = await request(app)
      .get('/api/calendar')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // Step 8: Weather & Agro Alerts
  it('8. Farmer queries real-time agro-meteorological forecast', async () => {
    const res = await request(app)
      .get('/api/weather?lat=28.9845&lng=77.7064')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('current');
    expect(res.body.data).toHaveProperty('daily');
    expect(res.body.data).toHaveProperty('alerts');
  });

  // Step 9: Soil Health Analysis
  it('9. Farmer tests soil nutrient metrics for fertilizer calculation', async () => {
    const res = await request(app)
      .post('/api/soil')
      .set('Authorization', `Bearer ${token}`)
      .send({
        soil_type: 'alluvial',
        ph: 7.2,
        nitrogen: 240,
        phosphorus: 18,
        potassium: 160,
        notes: 'Pre-sowing soil fertility sample'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.data).toHaveProperty('recommendations');
  });

  // Step 10: AI Advisory Interaction
  it('10. Farmer consults AI assistant with an agronomic question', async () => {
    const convRes = await request(app)
      .post('/api/assistant/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Wheat Rust Management', crop_id: 1 });

    expect([200, 201]).toContain(convRes.status);
    conversationId = convRes.body.data?.id || convRes.body.data?.conversation?.id;

    if (conversationId) {
      const chatRes = await request(app)
        .post('/api/assistant/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversation_id: conversationId,
          message: 'What fungicide should I use if I see yellow rust on wheat leaves?',
          crop_id: 1
        })
        .timeout(12000);

      expect([200, 201]).toContain(chatRes.status);
      expect(chatRes.body.success).toBe(true);
    }
  });

  // Step 11: Notifications Management
  it('11. Farmer reviews notifications and marks all as read', async () => {
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);

    const markRes = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(markRes.status);

    const unreadRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(unreadRes.status).toBe(200);
    const count = unreadRes.body.data?.count ?? unreadRes.body.count;
    expect(count).toBe(0);
  });
});
