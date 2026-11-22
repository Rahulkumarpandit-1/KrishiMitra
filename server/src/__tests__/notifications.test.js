/**
 * Notifications API Tests
 */
const request = require('supertest');
const app = require('../index');

let token = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ mobile: '9999999999', password: 'admin123' });
  token = res.body.data?.token || '';
});

describe('Notifications API', () => {
  it('GET /api/notifications — requires auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/notifications — returns notification list', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const list = res.body.data?.notifications || res.body.data;
    expect(Array.isArray(list)).toBe(true);
  });

  it('GET /api/notifications/unread-count — returns count', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof (res.body.data?.count ?? res.body.count)).toBe('number');
  });

  it('PUT /api/notifications/read-all — marks all read', async () => {
    const res = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
    expect([200, 204]).toContain(res.status);
  });
});
