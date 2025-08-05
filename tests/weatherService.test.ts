import { getWeatherForCity, getHistoricalWeather, processAndAnalyzeWeatherData } from '../source/weatherService';
import { WeatherData } from '../source/weatherModel';
import * as database from '../source/database';

// Mock the database module
jest.mock('../source/database', () => ({
  getDb: jest.fn(),
  executeQuery: jest.fn(),
}));

// Mock axios
jest.mock('axios');

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console mock
    jest.clearAllMocks();
  });

  describe('getWeatherForCity', () => {
    it('should return weather data for a valid city', async () => {
      const mockCity = 'London';
      const mockDbRun = jest.fn();
      
      (database.getDb as jest.Mock).mockReturnValue({
        run: mockDbRun
      });

      const result = await getWeatherForCity(mockCity);

      expect(result).toHaveProperty('city', mockCity);
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('conditions');
      expect(result).toHaveProperty('humidity');
      expect(result).toHaveProperty('wind_speed');
      expect(result).toHaveProperty('date_recorded');
      
      // Verify temperature is within expected range (5-40°C)
      expect(result.temperature).toBeGreaterThanOrEqual(5);
      expect(result.temperature).toBeLessThanOrEqual(40);
      
      // Verify humidity is within valid range (0-100%)
      expect(result.humidity).toBeGreaterThanOrEqual(0);
      expect(result.humidity).toBeLessThanOrEqual(100);
      
      // Verify wind speed is within reasonable range
      expect(result.wind_speed).toBeGreaterThanOrEqual(0);
      expect(result.wind_speed).toBeLessThanOrEqual(50);
      
      // Verify conditions is one of the expected values
      expect(['Sunny', 'Cloudy', 'Rainy', 'Stormy']).toContain(result.conditions);
    });

    it('should handle empty city name', async () => {
      const mockCity = '';
      const mockDbRun = jest.fn();
      
      (database.getDb as jest.Mock).mockReturnValue({
        run: mockDbRun
      });

      const result = await getWeatherForCity(mockCity);

      expect(result).toHaveProperty('city', mockCity);
      expect(result).toHaveProperty('temperature');
    });

    it('should handle database errors gracefully', async () => {
      const mockCity = 'Paris';
      const mockDbRun = jest.fn().mockImplementation((query, callback) => {
        callback(new Error('Database error'));
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        run: mockDbRun
      });

      const result = await getWeatherForCity(mockCity);

      // Should still return weather data even if database fails
      expect(result).toHaveProperty('city', mockCity);
      expect(result).toHaveProperty('temperature');
    });
  });

  describe('getHistoricalWeather', () => {
    it('should return historical weather data', async () => {
      const mockCity = 'New York';
      const mockFromDate = '2023-01-01';
      
      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(null, [
          {
            id: 1,
            city: mockCity,
            temperature: 20,
            conditions: 'Sunny',
            humidity: 65,
            wind_speed: 10,
            date_recorded: '2023-01-01T12:00:00Z'
          },
          {
            id: 2,
            city: mockCity,
            temperature: 22,
            conditions: 'Cloudy',
            humidity: 70,
            wind_speed: 12,
            date_recorded: '2023-01-02T12:00:00Z'
          }
        ]);
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });

      const result = await getHistoricalWeather(mockCity, mockFromDate);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('temperature', 20);
      expect(result[1]).toHaveProperty('temperature', 22);
      expect(result[0]).toHaveProperty('city', mockCity);
    });

    it('should handle no historical data found', async () => {
      const mockCity = 'Unknown City';
      const mockFromDate = '2023-01-01';
      
      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(null, []);
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });

      const result = await getHistoricalWeather(mockCity, mockFromDate);

      expect(result).toHaveLength(0);
    });

    it('should handle database errors', async () => {
      const mockCity = 'Error City';
      const mockFromDate = '2023-01-01';
      
      const mockDbAll = jest.fn().mockImplementation((query, callback) => {
        callback(new Error('Database connection failed'), null);
      });
      
      (database.getDb as jest.Mock).mockReturnValue({
        all: mockDbAll
      });

      await expect(getHistoricalWeather(mockCity, mockFromDate)).rejects.toThrow('Database connection failed');
    });
  });

  describe('processAndAnalyzeWeatherData', () => {
    it('should process and analyze weather data correctly', async () => {
      const mockWeatherData: WeatherData[] = [
        {
          id: 1,
          city: 'London',
          temperature: 20,
          conditions: 'Sunny',
          humidity: 65,
          wind_speed: 10,
          date_recorded: '2023-01-01T12:00:00Z'
        },
        {
          id: 2,
          city: 'London',
          temperature: 24,
          conditions: 'Cloudy',
          humidity: 75,
          wind_speed: 20,
          date_recorded: '2023-01-02T12:00:00Z'
        }
      ];

      const result = processAndAnalyzeWeatherData(mockWeatherData);

      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('humidity');
      expect(result).toHaveProperty('wind_speed');
      expect(result).toHaveProperty('summary');
      
      expect(result.temperature.average).toBe(22);
      expect(result.temperature.high).toBe(24);
      expect(result.temperature.low).toBe(20);
      
      expect(result.humidity.average).toBe(70);
      expect(result.humidity.high).toBe(75);
      expect(result.humidity.low).toBe(65);
      
      expect(result.wind_speed.average).toBe(15);
      expect(result.wind_speed.high).toBe(20);
      expect(result.wind_speed.low).toBe(10);
      
      expect(typeof result.summary).toBe('string');
    });

    it('should handle empty data array', () => {
      const mockWeatherData: WeatherData[] = [];

      const result = processAndAnalyzeWeatherData(mockWeatherData);

      expect(result.temperature.average).toBeNaN();
      expect(result.humidity.average).toBeNaN();
      expect(result.wind_speed.average).toBeNaN();
    });

    it('should handle single data point', () => {
      const mockWeatherData: WeatherData[] = [
        {
          id: 1,
          city: 'London',
          temperature: 25,
          conditions: 'Sunny',
          humidity: 60,
          wind_speed: 12,
          date_recorded: '2023-01-01T12:00:00Z'
        }
      ];

      const result = processAndAnalyzeWeatherData(mockWeatherData);

      expect(result.temperature.average).toBe(25);
      expect(result.temperature.high).toBe(25);
      expect(result.temperature.low).toBe(25);
      
      expect(result.humidity.average).toBe(60);
      expect(result.wind_speed.average).toBe(12);
    });
  });
});
