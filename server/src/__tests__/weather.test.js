/**
 * Weather API Tests — authenticated access, fallback, error handling
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

describe('GET /api/weather', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(401);
  });

  it('returns weather data for valid coordinates', async () => {
    const res = await request(app)
      .get('/api/weather?lat=28.6139&lng=77.2090')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('current');
    expect(res.body.data).toHaveProperty('daily');
    expect(Array.isArray(res.body.data.daily)).toBe(true);
    expect(res.body.data.daily.length).toBeGreaterThanOrEqual(7);
  });

  it('returns weather for default location when no coords given', async () => {
    const res = await request(app)
      .get('/api/weather')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.current).toHaveProperty('temperature');
    expect(res.body.data.current).toHaveProperty('humidity');
  });

  it('current weather has required fields', async () => {
    const res = await request(app)
      .get('/api/weather?lat=19.0760&lng=72.8777')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);
    expect(res.status).toBe(200);
    const { current } = res.body.data;
    expect(current).toHaveProperty('temperature');
    expect(current).toHaveProperty('humidity');
    expect(current).toHaveProperty('wind_speed');
    expect(current).toHaveProperty('weather_description');
  });

  it('daily forecast has correct structure', async () => {
    const res = await request(app)
      .get('/api/weather?lat=28.6139&lng=77.2090')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);
    expect(res.status).toBe(200);
    const day = res.body.data.daily[0];
    expect(day).toHaveProperty('date');
    expect(day).toHaveProperty('temp_max');
    expect(day).toHaveProperty('temp_min');
    expect(day).toHaveProperty('precipitation_probability');
  });

  it('never returns 500 (always has fallback)', async () => {
    // Invalid coords — should still get 200 with fallback
    const res = await request(app)
      .get('/api/weather?lat=999&lng=999')
      .set('Authorization', `Bearer ${token}`)
      .timeout(12000);
    // Should be 200 (fallback) or possibly 200 from open-meteo error handling
    expect([200, 400]).toContain(res.status);
  });
});
