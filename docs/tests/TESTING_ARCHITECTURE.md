# NEXIA Testing Architecture Guide

## Quick Start

### Core Philosophy
- **MSW-First**: Mock Service Worker for realistic API testing
- **Integration over Unit**: Test complete user workflows  
- **Real Store**: Use actual Redux store, not mocks
- **User-Centric**: Test what users see and do

### Test Structure Pattern
Every test file follows this structure:
```
describe("Component", () => {
  describe("Rendering & Basic UI")     // What users see
  describe("Form Validation")          // Client-side validation
  describe("Navigation")               // Router interactions  
  describe("API Integration")          // MSW handlers
  describe("Loading States")           // Loading/disabled states
  describe("Error Recovery")           // Error handling flows
})
```

## Essential Imports & Setup

```typescript
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { specificHandlers } from "@/test-utils/mocks/handlers/authHandlers";
import { mockNavigate, clearRouterMocks } from "@/test-utils/mocks";

describe("Component", () => {
    beforeEach(() => {
        clearRouterMocks();
    });
});
```

## MSW Handler Strategy (Hybrid Approach)

### Centralized Handlers (`authHandlers.ts`)
```typescript
// Basic handlers for common scenarios
export const authHandlers = [
    http.post("*/auth/login", /* default success */),
    http.post("*/auth/register", /* default success */),
    // ...
];

// Specific handlers for advanced testing
export const loginRetryHandler = /* server error → success */
export const loginRateLimitHandler = /* 429 → success */  
export const resetPasswordValidationHandler = /* 422 validation error */
```

### Usage in Tests
```typescript
// ✅ CORRECT: Use specific handlers
it("handles server error with retry", async () => {
    server.use(loginRetryHandler);
    // test retry logic...
});

// ❌ WRONG: Inline handlers
it("test", async () => {
    server.use(http.post("*/auth/login", () => /* inline handler */));
});
```

## Common Patterns

### Form Testing Pattern
```typescript
const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
};

it("submits form successfully", async () => {
    const user = userEvent.setup();
    render(<FormComponent />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/success");
    });
});
```

### Error Testing Pattern
```typescript
it("displays server error", async () => {
    server.use(specificErrorHandler);

    const user = userEvent.setup();  
    render(<Component />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText(/error message/i))
        .toBeInTheDocument();
});
```

### Navigation Testing Pattern  
```typescript
it("navigates to login", async () => {
    const user = userEvent.setup();
    render(<Component />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
});
```

## File Structure

```
src/test-utils/
├── fixtures/authFixtures.ts        # Test data
├── mocks/handlers/authHandlers.ts   # MSW handlers (hybrid)
├── mocks/index.ts                   # Centralized exports
├── utils/msw.ts                     # MSW server setup
├── render.tsx                       # Custom render with providers
└── setup.ts                        # Global test config
```

## Handler Categories

### Basic Handlers (Always Available)
- `authHandlers` - Default success responses
- Imported automatically in MSW server setup

### Specific Handlers (Import as Needed) 
- `loginRetryHandler` - Server error → success on retry
- `loginRateLimitHandler` - Rate limit → success  
- `resetPasswordValidationHandler` - Validation error (422)
- `resetPasswordNetworkErrorHandler` - Network error
- `passwordValidationHandler` - Password requirements error

### Usage Decision Tree
```
Need basic success/error? → Use default handlers
Need specific scenario? → Import specific handler  
Need custom logic? → Create specific handler following pattern
```

## Best Practices

### ✅ DO
- Use `screen.getByRole()` and `screen.getByLabelText()`
- Test complete user workflows  
- Use specific handlers for edge cases
- Clear mocks in `beforeEach`
- Use `waitFor()` for async assertions

### ❌ DON'T  
- Mock RTK Query directly in tests
- Create inline MSW handlers
- Test implementation details
- Use hardcoded test data (use fixtures)
- Skip error scenarios

## Quick Reference

### Common Queries
```typescript
screen.getByRole("button", { name: /submit/i })
screen.getByLabelText(/email/i)  
screen.getByPlaceholderText("Enter email")
screen.findByText(/error message/i)  // async
```

### Mock Utilities
```typescript
mockNavigate("/path")                 // Navigation
clearRouterMocks()                   // Reset router mocks
server.use(specificHandler)          // Override MSW handler
server.resetHandlers()               // Reset to defaults
```

### Async Patterns
```typescript
await user.click(button)             // User interaction
await waitFor(() => expect(...))     // Wait for DOM changes  
await screen.findByText(/text/i)     // Find element (async)
```

## Coverage Targets

- **Auth Components**: 100% (Critical user flows)  
- **UI Components**: 90%+ (Reusable components)
- **Integration Tests**: Priority over unit tests
- **Error Scenarios**: Must include happy path + error cases

## Example Test Structure

```typescript
describe("LoginForm", () => {
    beforeEach(() => {
        clearRouterMocks();
    });

    describe("Rendering & Basic UI", () => {
        it("renders all form elements correctly", () => {
            render(<LoginForm />);
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });
    });

    describe("API Integration", () => {
        it("handles login success", async () => {
            const user = userEvent.setup();
            render(<LoginForm />);

            await user.type(screen.getByLabelText(/email/i), "test@example.com");
            await user.type(screen.getByLabelText(/password/i), "password123");
            await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
            });
        });

        it("handles server errors", async () => {
            server.use(loginErrorHandler);
            // test error handling...
        });
    });
});
```

---

**Current Status**: 239/239 tests passing | MSW Hybrid Architecture Validated  
**Coverage**: Auth 100% | UI Components 90%+ | Integration-First Testing  
**Last Updated**: September 2025