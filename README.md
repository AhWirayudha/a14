# Weather Checker App Backend

A simple weather checker application backend with TypeScript, Express, and SQLite.

## Warning

This project is **intentionally insecure** and contains:
- Code smells
- Hardcoded secrets
- SQL injection vulnerabilities
- Zombie code (unused code)

It is meant for educational purposes only to demonstrate common security and code quality issues.

## Project Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Lint the code
npm run lint

# Clean build directory
npm run clean
```

## Testing

The project includes comprehensive unit and integration tests:

- **Unit Tests**: 35 tests covering all modules
- **Coverage**: ~67% code coverage
- **Integration Tests**: End-to-end API testing
- **Mocking**: Database and external API calls are properly mocked

### Test Files:
- `tests/weatherService.test.ts` - Service layer tests
- `tests/weatherController.test.ts` - Controller tests  
- `tests/weatherModel.test.ts` - Model validation tests
- `tests/database.test.ts` - Database operation tests
- `tests/integration.test.ts` - API integration tests

### CI/CD Pipeline

The project includes a GitHub Actions workflow that:
- Runs on Node.js 18
- Installs dependencies with caching
- Runs linting with ESLint
- Executes all tests with coverage reporting
- Builds the TypeScript project
- Uploads coverage to Codecov
- Runs SonarCloud analysis for code quality

## API Endpoints

- `GET /api/weather/current?city={city}` - Get current weather for a city
- `GET /api/weather/history/{city}?from={date}` - Get weather history for a city
- `GET /api/weather/analysis/{city}` - Get weather analysis for a city
- `POST /api/weather/admin/login` - Admin login (username: admin, password: admin123)

## Security Issues (Intentional)

This application intentionally contains the following security issues:

1. **Hardcoded Secrets**: API keys and database credentials are hardcoded in the source code
2. **SQL Injection**: User input is directly concatenated into SQL queries
3. **Exposed Error Details**: Stack traces are returned to the client
4. **No Input Validation**: User input is used without proper validation
5. **Insecure Dependencies**: Using outdated packages with known vulnerabilities
6. **Dangerous Use of eval()**: Dynamic evaluation of code

## Code Quality Issues (Intentional)

1. **Zombie Code**: Unused functions and commented code fragments
2. **Code Smells**: Functions with multiple responsibilities, poor naming conventions
3. **Duplicate Code**: Similar functions repeated with slight variations
4. **Inconsistent Error Handling**: Different approaches to error handling throughout the codebase
