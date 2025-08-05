import { initDb, executeQuery } from '../source/database';

// Mock console to avoid cluttering test output
const originalConsole = console;
const mockConsole = {
  ...originalConsole,
  log: jest.fn(),
  error: jest.fn()
};

describe('Database', () => {
  beforeAll(() => {
    global.console = mockConsole;
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initDb', () => {
    it('should initialize database without errors', () => {
      expect(() => initDb()).not.toThrow();
      expect(mockConsole.log).toHaveBeenCalledWith('Initializing database with user admin');
      expect(mockConsole.log).toHaveBeenCalledWith('Connected to the in-memory database');
      expect(mockConsole.log).toHaveBeenCalledWith('Database initialized with default data');
    });
  });

  describe('executeQuery', () => {
    beforeEach(() => {
      // Initialize database before each test
      initDb();
    });

    it('should execute SELECT query and return results', () => {
      const query = "SELECT * FROM users WHERE username = 'admin'";
      const results = executeQuery(query);

      expect(Array.isArray(results)).toBe(true);
      // Note: This tests the vulnerable implementation
    });

    it('should handle empty query parameters', () => {
      const query = "SELECT * FROM weather_data";
      const results = executeQuery(query);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should execute INSERT query', () => {
      const query = "INSERT INTO weather_data (city, temperature) VALUES ('TestCity', 25)";
      const results = executeQuery(query);

      expect(Array.isArray(results)).toBe(true);
    });

    it('should simulate SQL injection vulnerability', () => {
      // This test demonstrates the SQL injection vulnerability
      const maliciousQuery = "SELECT * FROM users WHERE username = 'admin'; DROP TABLE users; --";
      
      // The vulnerable implementation should process this without proper sanitization
      expect(() => executeQuery(maliciousQuery)).not.toThrow();
    });
  });
});
