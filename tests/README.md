# Testing Documentation

This project uses a comprehensive testing setup with **Vitest**, **React Testing Library**, and **Cypress** to ensure code quality and reliability.

## Testing Stack

- **Vitest** - Fast unit and integration testing
- **React Testing Library** - Component testing
- **Cypress** - End-to-end testing
- **MSW** - API mocking for tests

## Test Structure

```
tests/
├── setup.ts                     # Test setup and global mocks
├── lib/                         # Unit tests for utilities
│   └── progress-tracker.test.ts
├── api/                         # API route tests
│   ├── tasks.test.ts
│   ├── flashcards.test.ts
│   └── notes.test.ts
└── components/                  # Component tests
    └── progress-dashboard.test.tsx

cypress/
├── e2e/                         # End-to-end tests
│   ├── progress-tracking.cy.ts
│   └── main-flows.cy.ts
├── support/
│   ├── e2e.ts
│   └── commands.ts              # Custom Cypress commands
└── fixtures/                    # Test data

```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch specific tests
npm test -- progress-tracker
```

### End-to-End Tests (Cypress)

```bash
# Open Cypress UI
npm run cypress

# Run Cypress headless
npm run cypress:headless

# Run E2E tests with dev server
npm run e2e

# Run E2E tests headless
npm run e2e:headless
```

### Run All Tests

```bash
# Run unit, integration, and e2e tests
npm run test:all
```

## Writing Tests

### Unit Tests

Unit tests are for testing individual functions and utilities:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { incrementDailyProgress } from '@/lib/progress-tracker'

describe('Progress Tracker', () => {
  it('should increment task count', async () => {
    // Test implementation
  })
})
```

### Component Tests

Component tests use React Testing Library:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### API Route Tests

API route tests mock database calls and test request/response handling:

```typescript
import { GET } from '@/app/api/tasks/route'
import { NextRequest } from 'next/server'

describe('Tasks API', () => {
  it('should return tasks', async () => {
    const request = new NextRequest('http://localhost/api/tasks')
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests

E2E tests use Cypress to test the full application flow:

```typescript
describe('Task Management', () => {
  it('should create and complete a task', () => {
    cy.visit('/tasks')
    cy.get('[data-testid="new-task"]').click()
    cy.get('input[name="title"]').type('My Task')
    cy.get('button[type="submit"]').click()
    cy.contains('My Task').should('exist')
  })
})
```

## Test Coverage

Test coverage reports are generated in the `coverage/` directory:

```bash
npm run test:coverage
```

View the HTML report:
```bash
open coverage/index.html
```

## Mocking

### Mocking Modules

```typescript
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))
```

### Mocking API Calls

```typescript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  })
)
```

## Custom Cypress Commands

### Login

```typescript
cy.login('user@example.com', 'password')
```

### Create Task

```typescript
cy.createTask('My Task', { priority: 1, completed: false })
```

### Create Flashcard

```typescript
cy.createFlashcard('Front', 'Back', 'deck-id')
```

## Testing Best Practices

1. **Test User Behavior** - Test what users do, not implementation details
2. **Use Data Test IDs** - Add `data-testid` attributes for reliable selectors
3. **Mock External Dependencies** - Mock API calls, database, and third-party services
4. **Keep Tests Isolated** - Each test should be independent
5. **Test Error Cases** - Don't just test the happy path
6. **Use Descriptive Names** - Test names should clearly describe what they test

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Before deployments

Example GitHub Actions workflow:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      - run: npm run e2e:headless
```

## Debugging Tests

### Vitest

```bash
# Run single test file
npm test -- progress-tracker

# Run tests matching pattern
npm test -- --grep "should track"

# Show verbose output
npm test -- --reporter=verbose
```

### Cypress

```bash
# Open Cypress UI for debugging
npm run cypress

# Run specific test
npx cypress run --spec "cypress/e2e/progress-tracking.cy.ts"

# Take screenshots on failure
npx cypress run --config screenshotOnRunFailure=true
```

## Troubleshooting

### Tests Hanging

- Check for missing `await` keywords
- Verify mocks are properly setup
- Check for infinite loops in components

### Tests Failing Intermittently

- Add proper `waitFor` calls
- Increase timeouts if needed
- Check for race conditions

### Mock Not Working

- Ensure mock is defined before import
- Use `vi.clearAllMocks()` in `beforeEach`
- Check mock path matches actual import

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
