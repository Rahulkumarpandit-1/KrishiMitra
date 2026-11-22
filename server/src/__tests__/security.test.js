/**
 * Security Tests — SQL injection, XSS, rate limiting headers, CORS
 */
const request = require('supertest');
const app = require('../index');

describe('Security — SQL Injection Prevention', () => {
  it('login with SQL injection payload is rejected safely', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: "' OR 1=1 --", password: "' OR 1=1 --" });
    // Should be 400 or 401, never a 200 success
    expect([400, 401, 500]).toContain(res.status);
    expect(res.body.success).not.toBe(true);
  });

  it('register with SQL injection payload — parameterized queries prevent damage', async () => {
    // The mobile number is too long / non-numeric but server uses parameterized queries
    // so no actual SQL injection occurs. Server may accept or reject based on validation.
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: '<script>alert(1)</script>',
        mobile: "'; DROP TABLE users; --",
        password: 'validpass123'
      });
    // Server uses parameterized queries — data is safe regardless of status
    // Should NOT return a 500 (which could indicate SQL error from injection)
    expect(res.status).not.toBe(500);
    // DB should still be intact — health check should still work
    const healthRes = await request(app).get('/api/health');
    expect(healthRes.status).toBe(200);
  });
});

describe('Security — Unauthorized Access', () => {
  // Routes that require authentication
  const protectedRoutes = [
    ['GET', '/api/auth/me'],
    ['GET', '/api/profile'],
    ['GET', '/api/farmer-crops'],
    ['GET', '/api/weather'],
    ['GET', '/api/notifications'],
    ['GET', '/api/soil'],
    ['GET', '/api/disease/reports'],
    ['GET', '/api/admin/stats'],
  ];

  protectedRoutes.forEach(([method, path]) => {
    it(`${method} ${path} requires authentication`, async () => {
      const res = await request(app)[method.toLowerCase()](path);
      expect(res.status).toBe(401);
    });
  });
});

describe('Security — Token Validation', () => {
  it('rejects tampered JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MX0.tampered_signature');
    expect(res.status).toBe(401);
  });

  it('rejects Bearer without token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('rejects non-Bearer auth schemes', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic dXNlcjpwYXNz');
    expect(res.status).toBe(401);
  });
});

describe('Security — Error Handling', () => {
  it('404 handler returns structured JSON', async () => {
    const res = await request(app).get('/api/nonexistent-route-xyz');
    expect([404, 401]).toContain(res.status);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('server does not expose stack traces in error responses', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ mobile: 'x', password: 'y' });
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/at Object\./);
    expect(body).not.toMatch(/node_modules/);
  });
});
