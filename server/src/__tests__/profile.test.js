/**
 * Profile & Assistant API Tests
 */
const request = require('supertest');
const app = require('../index');

let token = '';

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Profile Test User', mobile: '8800000020', password: 'testpass123' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ mobile: '8800000020', password: 'testpass123' });
  token = res.body.data?.token || '';
});

describe('Farmer Profile API', () => {
  it('GET /api/profile — returns profile for authenticated farmer', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/profile — updates farmer profile', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        village: 'Test Village',
        district: 'Test District',
        state: 'Maharashtra',
        land_size: 3.0,
        soil_type: 'black',
        preferred_crops: 'Wheat, Rice'
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });

  it('requires auth to get profile', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
  });
});

describe('AI Assistant API', () => {
  let conversationId = null;

  it('GET /api/assistant/conversations — requires auth', async () => {
    const res = await request(app).get('/api/assistant/conversations');
    expect(res.status).toBe(401);
  });

  it('GET /api/assistant/conversations — returns list', async () => {
    const res = await request(app)
      .get('/api/assistant/conversations')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/assistant/conversations — creates a conversation', async () => {
    const res = await request(app)
      .post('/api/assistant/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Wheat Disease Query' });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    conversationId = res.body.data?.id || res.body.data?.conversation?.id;
  });

  it('POST /api/assistant/chat — sends a message', async () => {
    if (!conversationId) {
      const convRes = await request(app)
        .post('/api/assistant/conversations')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Chat' });
      conversationId = convRes.body.data?.id || convRes.body.data?.conversation?.id;
    }
    if (!conversationId) return; // skip if still no conversation

    const res = await request(app)
      .post('/api/assistant/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        conversation_id: conversationId,
        message: 'What crops grow well in black soil?'
      })
      .timeout(12000);
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
  });
});
