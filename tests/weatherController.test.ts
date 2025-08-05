import request from 'supertest';
import express from 'express';
import { getWeather, getCityHistory, getWeatherAnalysis, adminLogin } from '../source/weatherController';
import * as weatherService from '../source/weatherService';
import * as database from '../source/database';

// Mock the weatherService and database modules
jest.mock('../source/weatherService');
jest.mock('../source/database');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup routes for testing
app.get('/weather', getWeather);
app.get('/history/:city', getCityHistory);
app.get('/analysis/:city', getWeatherAnalysis);
app.post('/admin/login', adminLogin);

describe('WeatherController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWeather', () => {
    it('should return weather data for valid city', async () => {
      const mockWeatherData = {
        city: 'London',
        temperature: 22,
        conditions: 'Sunny',
        humidity: 65,
        wind_speed: 10,
        date_recorded: '2023-01-01T12:00:00Z'
      };

      (weatherService.getWeatherForCity as jest.Mock).mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/weather?city=London')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockWeatherData
      });

      expect(weatherService.getWeatherForCity).toHaveBeenCalledWith('London');
    });

    it('should return 400 error when city parameter is missing', async () => {
      const response = await request(app)
        .get('/weather')
        .expect(400);

      expect(response.body).toEqual({
        error: 'City parameter is required'
      });

      expect(weatherService.getWeatherForCity).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service unavailable');
      (weatherService.getWeatherForCity as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app)
        .get('/weather?city=London')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Service unavailable');
      expect(response.body).toHaveProperty('stack');
    });
  });

  describe('getCityHistory', () => {
    it('should return historical data for valid city', async () => {
      const mockHistoricalData = [
        {
          id: 1,
          city: 'Paris',
          temperature: 18,
          conditions: 'Cloudy',
          humidity: 70,
          wind_speed: 8,
          date_recorded: '2023-01-01T12:00:00Z'
        }
      ];

      (weatherService.getHistoricalWeather as jest.Mock).mockResolvedValue(mockHistoricalData);

      const response = await request(app)
        .get('/history/Paris?from=2023-01-01')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockHistoricalData
      });

      expect(weatherService.getHistoricalWeather).toHaveBeenCalledWith('Paris', '2023-01-01');
    });

    it('should return 400 error when city parameter is missing', async () => {
      const response = await request(app)
        .get('/history/')
        .expect(404); // Express returns 404 for missing route params
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Database error');
      (weatherService.getHistoricalWeather as jest.Mock).mockRejectedValue(mockError);

      const response = await request(app)
        .get('/history/Paris')
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('getWeatherAnalysis', () => {
    it('should return weather analysis for valid city', async () => {
      const mockHistoricalData = [
        {
          city: 'Berlin',
          temperature: 20,
          conditions: 'Sunny',
          humidity: 60,
          wind_speed: 15,
          date_recorded: '2023-01-01T12:00:00Z'
        }
      ];

      const mockAnalysis = {
        temperature: { high: 20, low: 20, average: 20 },
        humidity: { high: 60, low: 60, average: 60 },
        wind_speed: { high: 15, low: 15, average: 15 },
        summary: 'Warm. Dry. Calm winds.'
      };

      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(null, mockHistoricalData);
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });
      
      (weatherService.processAndAnalyzeWeatherData as jest.Mock).mockReturnValue(mockAnalysis);

      const response = await request(app)
        .get('/analysis/Berlin')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        city: 'Berlin',
        dataPoints: 1,
        analysis: mockAnalysis
      });

      expect(weatherService.processAndAnalyzeWeatherData).toHaveBeenCalledWith(mockHistoricalData);
    });

    it('should return 404 when no data found for city', async () => {
      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(null, []);
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });

      const response = await request(app)
        .get('/analysis/UnknownCity')
        .expect(404);

      expect(response.body).toEqual({
        error: 'No data found for this city'
      });
    });

    it('should handle database errors', async () => {
      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(new Error('Database connection failed'));
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });

      const response = await request(app)
        .get('/analysis/Berlin')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Database connection failed');
    });
  });

  describe('adminLogin', () => {
    it('should return success for valid admin credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        token: 'hardcoded-jwt-token-that-never-expires'
      });
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });

    it('should return 401 for missing credentials', async () => {
      const response = await request(app)
        .post('/admin/login')
        .send({})
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials'
      });
    });
  });
});
