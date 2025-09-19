# NEXIA Testing Architecture Guide

## Overview

The NEXIA frontend testing architecture is built on modern testing principles with a focus on **integration testing** over isolated unit tests. Our approach emphasizes testing user behavior and component interactions rather than implementation details.

### Testing Philosophy

- **Integration-First**: Tests should verify complete user workflows
- **MSW for API Testing**: Mock Service Worker provides realistic API responses
- **Centralized Mocks**: Reusable mock implementations across test suites
- **Real Store**: Use actual Redux store for authentic state behavior
- **User-Centric**: Tests written from user perspective, not implementation details

### Technology Stack

- **Test Runner**: Vitest (fast, ESM-native alternative to Jest)
- **Testing Library**: React Testing Library (user-centric testing utilities)
- **API Mocking**: MSW (Mock Service Worker) for realistic HTTP interception
- **DOM Environment**: jsdom for browser-like testing environment
- **Type Safety**: Full TypeScript support with strict type checking

## Directory Structure

```
apps/web/src/test-utils/
├── fixtures/                      # Static test data
│   └── authFixtures.ts            # Authentication-related test data
├── mocks/                         # Mock implementations
│   ├── handlers/                  # MSW request handlers
│   │   └── authHandlers.ts        # Auth endpoint handlers
│   ├── authApiMocks.ts            # RTK Query API mocks
│   ├── reactReduxMocks.ts         # Redux store mocks
│   ├── reactRouterMocks.ts        # Router navigation mocks
│   └── index.ts                   # Centralized mock exports
├── utils/                         # Testing utilities
│   ├── msw.ts                     # MSW server configuration
│   └── store.ts                   # Test store utilities
├── render.tsx                     # Custom render function with providers
├── setup.ts                       # Global test configuration
└── TestProviders.tsx              # React providers wrapper for tests
```

### File Responsibilities

#### Core Testing Infrastructure

**`setup.ts`** - Global test environment configuration
- Configures jest-dom matchers for enhanced assertions
- Initializes MSW server for API mocking
- Sets up DOM and browser API mocks (matchMedia, ResizeObserver, etc.)
- Handles test cleanup between runs

**`render.tsx`** - Custom render function
- Wraps components with necessary providers (Redux, Router)
- Re-exports common Testing Library utilities
- Provides consistent testing environment across all test files

**`TestProviders.tsx`** - Provider wrapper component
- Combines Redux Provider with real store
- Includes BrowserRouter for routing tests
- Centralized provider setup for future additions (Theme, i18n)

#### Mock Infrastructure

**`mocks/handlers/authHandlers.ts`** - MSW request handlers
- Defines realistic API responses for auth endpoints
- Handles success and error scenarios
- Aligned with actual backend response format

**`mocks/authApiMocks.ts`** - RTK Query mocks
- Intercepts @shared/api/authApi imports
- Provides mockable mutation functions
- Maintains RTK Query hook signatures

**`mocks/reactRouterMocks.ts`** - Router mocks
- Mocks useNavigate and useLocation hooks
- Provides helper functions for route testing
- Includes Navigate component mock for redirect testing

**`utils/msw.ts`** - MSW server configuration
- Sets up MSW server with centralized handlers
- Configured for Node.js testing environment

#### Test Data

**`fixtures/authFixtures.ts`** - Static test data
- Reusable user objects, credentials, and tokens
- Consistent test data across test suites
- Prevents test data duplication

## Testing Patterns & Rules

### ✅ DO: Correct Approaches

#### 1. Use MSW for API Integration Testing

```typescript
// ✅ CORRECT: Use existing MSW handlers
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"

it("handles registration error correctly", async () => {
  // Override default handler for this test
  server.use(
    http.post("*/auth/register", async () => {
      return HttpResponse.json(
        { message: "Este email ya está registrado" },
        { status: 409 }
      )
    })
  )

  // Test actual user workflow
  const user = userEvent.setup()
  render(<RegisterForm />)

  // Fill form and submit
  await fillForm(user)
  await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

  // Verify error handling
  expect(await screen.findByText(/este email ya está registrado/i))
    .toBeInTheDocument()
})
```

#### 2. Extend Handlers for Request Body Verification

```typescript
// ✅ CORRECT: Capture and verify request payloads
server.use(
  http.post("*/auth/register", async ({ request }) => {
    const body = await request.json()

    // Verify request payload
    expect(body).toEqual({
      email: "test@example.com",
      nombre: "Nelson",
      apellidos: "Valero",
      role: "trainer",
      password: "password123"
    })

    return HttpResponse.json({
      message: "Cuenta creada exitosamente"
    })
  })
)
```

#### 3. Use Centralized Fixtures and Mocks

```typescript
// ✅ CORRECT: Import from centralized locations
import { render } from "@/test-utils/render"
import { mockNavigate, clearRouterMocks } from "@/test-utils/mocks"
import { validUser, validCredentials } from "@/test-utils/fixtures/authFixtures"

describe("Component", () => {
  beforeEach(() => {
    clearRouterMocks()
  })
})
```

#### 4. Test User Workflows, Not Implementation

```typescript
// ✅ CORRECT: Test complete user workflows
it("successfully registers user and redirects to login", async () => {
  const user = userEvent.setup()
  render(<RegisterForm />)

  // User fills form
  await user.type(screen.getByLabelText(/correo/i), "test@example.com")
  await user.type(screen.getByLabelText(/nombre/i), "Nelson")
  await user.type(screen.getByLabelText(/apellidos/i), "Valero")
  await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), "trainer")
  await user.type(screen.getByLabelText(/contraseña/i), "password123")
  await user.type(screen.getByLabelText(/confirmar/i), "password123")

  // User submits form
  await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

  // Verify expected outcome
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
      state: expect.objectContaining({
        message: expect.stringMatching(/cuenta creada exitosamente/i),
        email: "test@example.com"
      })
    })
  })
})
```

#### 5. Use Real Store for Authentic State Behavior

```typescript
// ✅ CORRECT: TestProviders uses real Redux store
export function TestProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>  {/* Real store, not mock */}
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}
```

### ❌ DON'T: Anti-Patterns to Avoid

#### 1. Don't Create Inline MSW Handlers

```typescript
// ❌ WRONG: Inline handlers in every test
it("handles error", async () => {
  setupServer(
    http.post("*/auth/login", () => {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    })
  ).listen()

  // Test code...
})
```

#### 2. Don't Mock APIs Individually in Each Test

```typescript
// ❌ WRONG: Individual mocks in test files
vi.mock("@shared/api/authApi", () => ({
  useLoginMutation: () => [vi.fn(), { isLoading: false }]
}))
```

#### 3. Don't Duplicate Test Data

```typescript
// ❌ WRONG: Hardcoded data in every test
const testUser = {
  email: "test@example.com",
  name: "Test User"
}

// ✅ CORRECT: Use centralized fixtures
import { validUser } from "@/test-utils/fixtures/authFixtures"
```

#### 4. Don't Test Implementation Details

```typescript
// ❌ WRONG: Testing internal state or methods
expect(component.state.isLoading).toBe(false)

// ✅ CORRECT: Test user-visible behavior
expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
```

## Configuration Files

### Vitest Configuration (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },
  test: {
    environment: 'jsdom',           // Browser-like environment
    globals: true,                  // Global test functions
    setupFiles: ['./src/test-utils/setup.ts'],  // Global setup
  },
})
```

### TypeScript Configuration (`tsconfig.vitest.json`)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": [
      "vitest/globals",            // Vitest global functions
      "@testing-library/jest-dom"  // Enhanced matchers
    ],
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "vitest.config.ts"
  ]
}
```

## Step-by-Step Workflows

### 1. Testing Form Components with API Integration

```typescript
/**
 * Complete workflow for testing form submission with API integration
 */

import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import { mockNavigate, clearRouterMocks } from "@/test-utils/mocks"

describe("FormComponent", () => {
  beforeEach(() => {
    clearRouterMocks()
  })

  it("submits form and handles success", async () => {
    const user = userEvent.setup()
    render(<FormComponent />)

    // 1. Fill form fields
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")

    // 2. Submit form
    await user.click(screen.getByRole("button", { name: /submit/i }))

    // 3. Verify API call and response handling
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/success")
    })
  })

  it("handles validation errors", async () => {
    const user = userEvent.setup()
    render(<FormComponent />)

    // 1. Submit empty form
    await user.click(screen.getByRole("button", { name: /submit/i }))

    // 2. Verify validation errors appear
    expect(await screen.findByText(/email is required/i))
      .toBeInTheDocument()
  })

  it("handles server errors", async () => {
    // 1. Override MSW handler to return error
    server.use(
      http.post("*/api/endpoint", async () => {
        return HttpResponse.json(
          { message: "Server error" },
          { status: 500 }
        )
      })
    )

    const user = userEvent.setup()
    render(<FormComponent />)

    // 2. Fill and submit form
    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.click(screen.getByRole("button", { name: /submit/i }))

    // 3. Verify error handling
    expect(await screen.findByText(/server error/i))
      .toBeInTheDocument()
  })
})
```

### 2. Adding Request Body Verification to Existing Handlers

```typescript
/**
 * How to extend existing MSW handlers to verify request payloads
 */

// Extend existing handler with request verification
server.use(
  http.post("*/auth/register", async ({ request }) => {
    const body = await request.json() as RegisterCredentials

    // Verify specific fields
    expect(body.email).toBe("test@example.com")
    expect(body.role).toBe("trainer")
    expect(body.password).toBe("password123")

    // Verify complete payload structure
    expect(body).toEqual({
      email: "test@example.com",
      nombre: "Nelson",
      apellidos: "Valero",
      role: "trainer",
      password: "password123"
    })

    // Return success response
    return HttpResponse.json({
      message: "Cuenta creada exitosamente"
    })
  })
)
```

### 3. Creating New Test Files Following Established Patterns

```typescript
/**
 * Template for new test files following project conventions
 */

/**
 * ComponentName Test Suite
 *
 * Brief description of what this component does and testing approach.
 * Integration tests with MSW for API interactions.
 *
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { render } from "@/test-utils/render"
import { server } from "@/test-utils/utils/msw"
import { http, HttpResponse } from "msw"
import {
  mockNavigate,
  clearRouterMocks,
  clearAuthMocks
} from "@/test-utils/mocks"
import { ComponentName } from "../ComponentName"

describe("ComponentName", () => {
  beforeEach(() => {
    clearRouterMocks()
    clearAuthMocks()
  })

  describe("Rendering & Basic UI", () => {
    it("renders all elements correctly", () => {
      render(<ComponentName />)

      expect(screen.getByRole("button", { name: /action/i }))
        .toBeInTheDocument()
    })
  })

  describe("User Interactions", () => {
    it("handles user action successfully", async () => {
      const user = userEvent.setup()
      render(<ComponentName />)

      await user.click(screen.getByRole("button", { name: /action/i }))

      expect(await screen.findByText(/success/i))
        .toBeInTheDocument()
    })
  })

  describe("API Integration (MSW)", () => {
    it("handles API success", async () => {
      const user = userEvent.setup()
      render(<ComponentName />)

      await user.click(screen.getByRole("button", { name: /submit/i }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/success")
      })
    })

    it("handles API errors", async () => {
      server.use(
        http.post("*/api/endpoint", async () => {
          return HttpResponse.json(
            { message: "Error occurred" },
            { status: 400 }
          )
        })
      )

      const user = userEvent.setup()
      render(<ComponentName />)

      await user.click(screen.getByRole("button", { name: /submit/i }))

      expect(await screen.findByText(/error occurred/i))
        .toBeInTheDocument()
    })
  })
})
```

## Request Body Verification Pattern

### Basic Request Verification

```typescript
// Verify request body in MSW handler
server.use(
  http.post("*/auth/login", async ({ request }) => {
    const body = await request.json()

    // Basic field verification
    expect(body.email).toBe("test@example.com")
    expect(body.password).toBe("password123")

    return HttpResponse.json({
      access_token: "fake-token",
      user: { id: 1, email: body.email }
    })
  })
)
```

### Advanced Request Verification with Custom Matchers

```typescript
// Create custom verification helpers
const expectValidRegistrationPayload = (body: any) => {
  expect(body).toEqual({
    email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    nombre: expect.any(String),
    apellidos: expect.any(String),
    role: expect.stringMatching(/^(trainer|athlete|admin)$/),
    password: expect.stringMatching(/.{6,}/)
  })
}

// Use in handler
server.use(
  http.post("*/auth/register", async ({ request }) => {
    const body = await request.json()
    expectValidRegistrationPayload(body)

    return HttpResponse.json({
      message: "Cuenta creada exitosamente"
    })
  })
)
```

### Conditional Response Based on Request

```typescript
// Different responses based on request content
server.use(
  http.post("*/auth/login", async ({ request }) => {
    const body = await request.json()

    if (body.email === "admin@example.com") {
      return HttpResponse.json({
        access_token: "admin-token",
        user: { id: 1, email: body.email, role: "admin" }
      })
    }

    if (body.email === "blocked@example.com") {
      return HttpResponse.json(
        { message: "Account suspended" },
        { status: 403 }
      )
    }

    // Default success response
    return HttpResponse.json({
      access_token: "user-token",
      user: { id: 2, email: body.email, role: "trainer" }
    })
  })
)
```

## Examples from Codebase

### RegisterForm Integration Test

```typescript
// From: apps/web/src/components/auth/__tests__/RegisterForm.test.tsx

describe("API Integration Tests (MSW)", () => {
  const fillValidForm = async (user: ReturnType<typeof userEvent.setup>, role = "athlete") => {
    await user.type(screen.getByLabelText(/correo electrónico/i), "test@example.com")
    await user.type(screen.getByLabelText(/^nombre/i), "Nelson")
    await user.type(screen.getByLabelText(/apellidos/i), "Valero")
    await user.selectOptions(screen.getByLabelText(/tipo de cuenta/i), role)
    await user.type(screen.getByLabelText(/^contraseña/i), "password123")
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "password123")
  }

  it("successful registration redirects to login with success message", async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await fillValidForm(user, "trainer")
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
        state: expect.objectContaining({
          message: expect.stringMatching(/cuenta creada exitosamente/i),
          email: "test@example.com",
        }),
      })
    })
  })

  it("displays error when email already exists (409)", async () => {
    server.use(
      http.post("https://nexiaapp.com/api/v1/auth/register", async () => {
        return HttpResponse.json(
          { message: "Este email ya está registrado" },
          { status: 409 }
        )
      })
    )

    const user = userEvent.setup()
    render(<RegisterForm />)

    await fillValidForm(user)
    await user.click(screen.getByRole("button", { name: /crear cuenta/i }))

    expect(await screen.findByText(/este email ya está registrado/i))
      .toBeInTheDocument()

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
```

### Button Component Unit Test

```typescript
// From: apps/web/src/components/ui/buttons/__tests__/Button.test.tsx

describe("Button", () => {
  describe("Rendering & Basic Functionality", () => {
    it("renders with default props", () => {
      render(<Button>Test Button</Button>)

      const button = screen.getByRole("button", { name: "Test Button" })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass("bg-primary-600") // default primary variant
      expect(button).toHaveClass("px-4", "py-2") // default md size
    })

    it("handles click events", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(<Button onClick={handleClick}>Click me</Button>)

      await user.click(screen.getByRole("button", { name: "Click me" }))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("Loading State", () => {
    it("shows loading state and disables interaction", () => {
      render(<Button isLoading>Loading Button</Button>)

      const button = screen.getByRole("button")
      expect(button).toBeDisabled()
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })
  })
})
```

### Router Mock Usage

```typescript
// From: apps/web/src/components/auth/__tests__/LoginForm.test.tsx

import { setMockLocation, mockNavigate, clearRouterMocks } from "@/test-utils/mocks"

describe("LoginForm", () => {
  beforeEach(() => {
    clearRouterMocks()
    setMockLocation("/", {})
  })

  it("displays success message when coming from registration", () => {
    setMockLocation("/auth/login", {
      message: "Cuenta creada exitosamente. Inicia sesión con tus credenciales.",
      email: "test@example.com"
    })

    render(<LoginForm />)

    expect(screen.getByText(/cuenta creada exitosamente/i))
      .toBeInTheDocument()
  })

  it("navigates to register page", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /regístrate aquí/i }))

    expect(mockNavigate).toHaveBeenCalledWith("/auth/register")
  })
})
```

## MSW vs RTK Query Mocks Usage Patterns

### When to Use MSW (Preferred)

**✅ Use MSW for:**
- **Integration Tests**: Testing complete user workflows with API interactions
- **Form Submissions**: Verifying request payloads and response handling
- **Error Scenarios**: Testing different HTTP status codes and error responses
- **Realistic API Simulation**: When you need to simulate actual network behavior

```typescript
// MSW Example: Testing complete registration flow
it("handles registration with email conflict", async () => {
  server.use(
    http.post("*/auth/register", async ({ request }) => {
      const body = await request.json()

      // Verify request structure
      expect(body).toMatchObject({
        email: "existing@example.com",
        role: "trainer"
      })

      return HttpResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      )
    })
  )

  // Test actual user interaction...
})
```

### When to Use RTK Query Mocks

**✅ Use RTK Query Mocks for:**
- **Isolated Component Testing**: When you only need to verify component behavior
- **Loading States**: Testing loading/disabled states without network timing
- **Simple Unit Tests**: When API interaction is not the focus

```typescript
// RTK Query Mock Example: Testing loading state
it("disables form during submission", async () => {
  // Mock loading state
  vi.mocked(useRegisterMutation).mockReturnValue([
    vi.fn(),
    { isLoading: true }
  ])

  render(<RegisterForm />)

  const submitButton = screen.getByRole("button", { name: /crear cuenta/i })
  expect(submitButton).toBeDisabled()
  expect(submitButton).toHaveTextContent(/creando cuenta/i)
})
```

### Combined Usage Pattern

```typescript
// Use both approaches in the same test suite
describe("RegisterForm", () => {
  describe("UI Behavior (RTK Query Mocks)", () => {
    it("shows loading state", () => {
      // RTK Query mock for simple state testing
    })
  })

  describe("API Integration (MSW)", () => {
    it("submits registration data", async () => {
      // MSW for complete workflow testing
    })
  })
})
```

## Best Practices Summary

### Test Organization
1. **Group by functionality**, not by test type (unit/integration)
2. **Use descriptive test names** that explain the user scenario
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Clean up between tests** using beforeEach hooks

### Mock Strategy
1. **Prefer MSW for API testing** - more realistic than mocking RTK Query
2. **Use centralized handlers** in `authHandlers.ts`
3. **Override handlers per test** for specific scenarios
4. **Verify request payloads** when testing form submissions

### Test Data
1. **Use fixtures** for consistent test data
2. **Create helper functions** for common form filling
3. **Avoid hardcoded values** in individual tests

### Error Testing
1. **Test both happy path and error scenarios**
2. **Verify error messages are user-friendly**
3. **Test error recovery flows**

### Accessibility
1. **Use semantic queries** (getByRole, getByLabelText)
2. **Test keyboard navigation** where applicable
3. **Verify ARIA attributes** for complex components

This testing architecture ensures our frontend is robust, maintainable, and provides confidence in our user-facing functionality while following modern testing best practices.

---

**Last Updated**: September 19, 2025
**Testing Framework Version**: Vitest 2.1.1 + RTL + MSW
**Coverage Target**: >90% for critical user flows