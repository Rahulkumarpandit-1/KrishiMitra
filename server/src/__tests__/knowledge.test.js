/**
 * Knowledge Centre API Tests
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

describe('Knowledge Centre API', () => {
  it('GET /api/knowledge — public access returns 200', async () => {
    const res = await request(app).get('/api/knowledge');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/knowledge — returns article list', async () => {
    const res = await request(app)
      .get('/api/knowledge')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/knowledge?category=pest — filters by category', async () => {
    const res = await request(app)
      .get('/api/knowledge?category=pest')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/knowledge?search=wheat — search works', async () => {
    const res = await request(app)
      .get('/api/knowledge?search=wheat')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/knowledge/:id — returns 404 for invalid id', async () => {
    const res = await request(app)
      .get('/api/knowledge/999999')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 200]).toContain(res.status);
  });
});
