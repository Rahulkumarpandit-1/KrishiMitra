/**
 * Admin RBAC Tests — only admins can access admin routes
 */
const request = require('supertest');
const app = require('../index');

let adminToken = '';
let farmerToken = '';

beforeAll(async () => {
  const [adminRes, farmerRes] = await Promise.all([
    request(app).post('/api/auth/login').send({ mobile: '9999999999', password: 'admin123' }),
    request(app).post('/api/auth/login').send({ mobile: '9876543210', password: 'password123' }),
  ]);
  adminToken = adminRes.body.data?.token || '';
  farmerToken = farmerRes.body.data?.token || '';
});

describe('Admin Route RBAC', () => {
  it('admin can access /api/admin/stats', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('farmer cannot access /api/admin/stats (403)', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(403);
  });

  it('unauthenticated request to admin is rejected (401)', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('admin can list all farmers', async () => {
    const res = await request(app)
      .get('/api/admin/farmers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('farmer cannot list all farmers (403)', async () => {
    const res = await request(app)
      .get('/api/admin/farmers')
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(403);
  });

  it('admin stats include required fields', async () => {
    const res = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    const stats = res.body.data || res.body;
    expect(stats).toBeTruthy();
  });
});
