/**
 * Soil Analysis API Tests
 */
const request = require('supertest');
const app = require('../index');

let token = '';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ mobile: '9876543210', password: 'password123' });
  token = res.body.data?.token || '';
  if (!token) {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ mobile: '9999999999', password: 'admin123' });
    token = adminRes.body.data?.token || '';
  }
});

describe('POST /api/soil — Soil Analysis', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/soil')
      .send({ soil_type: 'black', ph_level: 6.5, nitrogen: 'medium' });
    expect(res.status).toBe(401);
  });

  it('analyzes soil and returns crop recommendations', async () => {
    const res = await request(app)
      .post('/api/soil')
      .set('Authorization', `Bearer ${token}`)
      .send({
        soil_type: 'black',
        ph_level: 6.5,
        nitrogen: 'medium',
        phosphorus: 'high',
        potassium: 'low',
        organic_matter: 'medium',
        field_size: 2.5,
        location: 'Maharashtra'
      });
    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('recommendations');
  });

  it('handles alluvial soil type', async () => {
    const res = await request(app)
      .post('/api/soil')
      .set('Authorization', `Bearer ${token}`)
      .send({ soil_type: 'alluvial', ph_level: 7.0, nitrogen: 'high' });
    expect([200, 201, 400]).toContain(res.status);
  });
});

describe('GET /api/soil — Soil Records', () => {
  it('returns soil records for authenticated user', async () => {
    const res = await request(app)
      .get('/api/soil')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/soil');
    expect(res.status).toBe(401);
  });
});
