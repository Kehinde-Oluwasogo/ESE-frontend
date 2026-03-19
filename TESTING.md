# Frontend Testing Documentation

## Overview

This frontend application uses **Vitest** and **React Testing Library** to ensure code quality and reliability. The testing strategy covers authentication, domain logic (bookings), and key user workflows.

## Test Coverage

### 1. **Authentication Tests** (`Login.test.jsx`, `Register.test.jsx`, `ForgotPassword.test.jsx`, `AuthContext.test.jsx`)

**Coverage:**
- ✅ User login with valid credentials
- ✅ Login error handling
- ✅ User registration flow
- ✅ Password validation
- ✅ Email format validation
- ✅ Password reset request
- ✅ Token storage and retrieval
- ✅ User session management
- ✅ Token refresh logic
- ✅ Logout functionality

**Test Count:** ~30 tests

### 2. **Booking Domain Logic** (`BookingForm.test.jsx`, `BookingList.test.jsx`)

**Coverage:**
- ✅ Create new booking
- ✅ View booking list
- ✅ Edit existing booking
- ✅ Delete booking with confirmation
- ✅ Form validation
- ✅ Date/time picker validation
- ✅ Service selection
- ✅ Empty state handling
- ✅ Loading states
- ✅ Error handling
- ✅ Booking status filtering

**Test Count:** ~20 tests

### 3. **Profile Management** (`Profile.test.jsx`)

**Coverage:**
- ✅ Display user profile
- ✅ Edit profile information
- ✅ Profile picture display
- ✅ Loading states
- ✅ Error handling

**Test Count:** ~8 tests

### 4. **Integration Tests** (`integration.test.jsx`)

**Coverage:**
- ✅ Complete authentication workflow
- ✅ End-to-end booking workflow
- ✅ Protected route handling
- ✅ Session persistence
- ✅ API error handling across app
- ✅ Navigation flows

**Test Count:** ~6 tests

## Running Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests in CI mode
```bash
npm run test:run
```

### Run tests with coverage
```bash
npm run test:run -- --coverage
```

### Run specific test file
```bash
npm test Login.test.jsx
```

### Watch mode (for development)
```bash
npm test
```

## Test Structure

### Unit Tests
Test individual components in isolation with mocked dependencies.

**Example:**
```javascript
it("submits credentials and stores tokens on success", async () => {
  const onLogin = vi.fn();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ access: "token", refresh: "refresh" }),
  }));
  
  render(<Login onLogin={onLogin} />);
  await userEvent.type(screen.getByLabelText(/username/i), "testuser");
  await userEvent.type(screen.getByLabelText(/password/i), "password");
  await userEvent.click(screen.getByRole("button", { name: /login/i }));
  
  expect(localStorage.getItem("access_token")).toBe("token");
  expect(onLogin).toHaveBeenCalled();
});
```

### Integration Tests
Test complete user workflows across multiple components.

**Example:**
```javascript
it("complete booking workflow: login -> create -> view -> edit -> delete", async () => {
  // Test full user journey
});
```

## Mocking Strategy

### API Calls
```javascript
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: "mock data" }),
}));
```

### Context
```javascript
vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, username: "testuser" },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
```

### LocalStorage
```javascript
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("access_token", "test-token");
});
```

## Test Quality Metrics

### Current Status
- **Total Test Files:** 8
- **Total Tests:** ~64+ assertions
- **Coverage Areas:**
  - ✅ Authentication (30+ tests)
  - ✅ Booking CRUD (20+ tests)
  - ✅ Profile Management (8+ tests)
  - ✅ Integration Workflows (6+ tests)

### Quality Standards
- ✅ Tests are independent (no shared state)
- ✅ Tests use meaningful assertions
- ✅ Tests follow AAA pattern (Arrange, Act, Assert)
- ✅ Tests cover happy paths and error cases
- ✅ Tests verify user interactions
- ✅ Tests check API integration
- ✅ Tests validate form inputs

## CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request
- Before deployment

See `.github/workflows/ci.yml` for configuration.

## Best Practices Followed

1. **Descriptive Test Names:** Clear description of what is being tested
2. **Minimal Mocking:** Only mock external dependencies
3. **User-Centric:** Tests simulate real user behavior
4. **Accessible:** Uses semantic queries (getByRole, getByLabelText)
5. **Async Handling:** Proper use of waitFor and async/await
6. **Cleanup:** All mocks restored between tests
7. **Coverage:** Both success and failure scenarios tested

## Future Improvements

Potential areas for additional testing:
- [ ] E2E tests with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing (a11y)
- [ ] Load testing for API endpoints
- [ ] Component snapshot testing

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure tests pass locally
3. Verify CI pipeline passes
4. Aim for meaningful coverage, not just high percentages

## Documentation References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles/)
