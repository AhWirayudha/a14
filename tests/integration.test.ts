import request from 'supertest';
import app from '../source/app';

// Integration tests for the weather API
describe('Weather API Integration', () => {
  beforeAll(() => {
    // Any setup needed for integration tests
  });

  afterAll(() => {
    // Cleanup after tests
  });

  describe('GET /api/weather/current', () => {
    it('should return weather data for valid city', async () => {
      const response = await request(app)
        .get('/api/weather/current?city=London')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('city', 'London');
      expect(response.body.data).toHaveProperty('temperature');
      expect(response.body.data).toHaveProperty('conditions');
      expect(response.body.data).toHaveProperty('humidity');
      expect(response.body.data).toHaveProperty('wind_speed');
    });

    it('should return 400 for missing city parameter', async () => {
      const response = await request(app)
        .get('/api/weather/current')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'City parameter is required');
    });
  });

  describe('GET /api/weather/search', () => {
    it('should return search results', async () => {
      const response = await request(app)
        .get('/api/weather/search?q=London')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('results');
      expect(response.body.message).toContain('London');
    });
  });

  describe('POST /api/weather/admin/login', () => {
    it('should authenticate admin user', async () => {
      const response = await request(app)
        .post('/api/weather/admin/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/weather/admin/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});
