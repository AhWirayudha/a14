import { WeatherData, UsrPrefs, UserSettings } from '../source/weatherModel';

describe('WeatherModel', () => {
  describe('WeatherData interface', () => {
    it('should accept valid weather data object', () => {
      const weatherData: WeatherData = {
        id: 1,
        city: 'London',
        temperature: 22,
        conditions: 'Sunny',
        humidity: 65,
        wind_speed: 10,
        date_recorded: '2023-01-01T12:00:00Z'
      };

      expect(weatherData.city).toBe('London');
      expect(weatherData.temperature).toBe(22);
      expect(weatherData.conditions).toBe('Sunny');
      expect(weatherData.humidity).toBe(65);
      expect(weatherData.wind_speed).toBe(10);
    });

    it('should accept weather data with minimal fields', () => {
      const weatherData: WeatherData = {
        city: 'Paris'
      };

      expect(weatherData.city).toBe('Paris');
      expect(weatherData.temperature).toBeUndefined();
      expect(weatherData.conditions).toBeUndefined();
    });
  });

  describe('UsrPrefs interface', () => {
    it('should accept valid user preferences', () => {
      const userPrefs: UsrPrefs = {
        usrId: 1,
        favoriteCity: 'New York',
        tempratureUnit: 'celsius', // Note: typo is intentional as per the interface
        notificationsEnabled: true
      };

      expect(userPrefs.usrId).toBe(1);
      expect(userPrefs.favoriteCity).toBe('New York');
      expect(userPrefs.tempratureUnit).toBe('celsius');
      expect(userPrefs.notificationsEnabled).toBe(true);
    });
  });

  describe('UserSettings interface', () => {
    it('should accept valid user settings', () => {
      const userSettings: UserSettings = {
        userId: 1,
        defaultCity: 'Berlin',
        tempUnit: 'fahrenheit',
        notifications: false
      };

      expect(userSettings.userId).toBe(1);
      expect(userSettings.defaultCity).toBe('Berlin');
      expect(userSettings.tempUnit).toBe('fahrenheit');
      expect(userSettings.notifications).toBe(false);
    });
  });
});
