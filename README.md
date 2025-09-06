# NEXIA Frontend

Professional fitness training management platform frontend built with modern web technologies.

## Architecture

**Simplified Monorepo Structure:**
```
frontend/
├── apps/
│   └── web/                           # React application
│       ├── public/
│       │   └── assets/               # Logo and static assets
│       ├── src/
│       │   ├── components/           # All UI components centralized
│       │   │   ├── auth/            # Authentication components
│       │   │   │   ├── AuthLayout.tsx    # 50/50 glassmorphism layout
│       │   │   │   ├── LoginForm.tsx     # Complete login form with validation
│       │   │   │   ├── RegisterForm.tsx  # Complete register form with validation
│       │   │   │   ├── ForgotPasswordForm.tsx # Password recovery form
│       │   │   │   ├── ResetPasswordForm.tsx  # Password reset form
│       │   │   │   └── NexiaLogo.tsx     # Reusable logo component
│       │   │   ├── dashboard/       # Dashboard components
│       │   │   │   └── TrainerDashboard.tsx
│       │   │   ├── forms/           # Reusable form components
│       │   │   │   ├── Button.tsx   # Button component with variants
│       │   │   │   └── Input.tsx    # Input component with validation
│       │   │   ├── layout/          # Layout components
│       │   │   └── shared/          # Cross-role shared components
│       │   │       └── ServerErrorBanner.tsx # Error display component
│       │   ├── pages/
│       │   │   ├── auth/            # Authentication pages
│       │   │   │   ├── Login.tsx         # Login page implementation
│       │   │   │   ├── Register.tsx      # Register page implementation  
│       │   │   │   ├── ForgotPassword.tsx # Password recovery page
│       │   │   │   └── ResetPassword.tsx  # Password reset page
│       │   │   └── dashboard/       # Dashboard pages
│       │   │       └── TrainerDashboard.tsx
│       │   ├── hooks/               # UI-specific custom hooks
│       │   ├── utils/               # UI utilities and helpers
│       │   ├── styles/              # Styling files
│       │   │   └── backgrounds.ts   # Background gradient utilities
│       │   ├── App.tsx              # React Router setup
│       │   ├── main.tsx             # Redux Provider + Router
│       │   └── index.css            # Base CSS with Tailwind directives
│       ├── tailwind.config.js       # Tailwind CSS configuration
│       ├── postcss.config.js        # PostCSS configuration
│       ├── vite.config.ts           # Vite configuration with aliases
│       └── package.json             # Dependencies and scripts
├── packages/
│   └── shared/                      # Cross-platform business logic
│       ├── src/
│       │   ├── api/
│       │   │   ├── authApi.ts       # RTK Query authentication endpoints
│       │   │   └── baseApi.ts       # RTK Query base configuration
│       │   ├── config/
│       │   │   └── constants.ts     # Application constants
│       │   ├── store/
│       │   │   ├── index.ts         # Redux Toolkit store configuration
│       │   │   └── authSlice.ts     # Authentication slice
│       │   ├── types/
│       │   │   └── auth.ts          # TypeScript authentication types
│       │   ├── hooks/               # Business logic hooks
│       │   │   └── useAuthForm.ts   # Reusable form hook for auth
│       │   ├── utils/
│       │   │   └── validation.ts    # Form validation utilities
│       │   └── index.ts             # Package re-exports
│       ├── package.json             # Package configuration
│       └── tsconfig.json            # TypeScript configuration
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package configuration
├── pnpm-lock.yaml                   # Dependencies lockfile
├── pnpm-workspace.yaml              # Workspace configuration
├── README.md                        # This file
└── tsconfig.json                    # Root TypeScript configuration
```

**Technology Stack:**
- **Framework:** Vite + React 18 + TypeScript 5
- **Package Manager:** pnpm (monorepo workspace)
- **State Management:** Redux Toolkit + RTK Query
- **Authentication:** JWT Bearer tokens with automatic header injection
- **UI Components:** Centralized component library with Tailwind CSS
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS v3.4+ with custom gradients
- **Build System:** TypeScript + Tailwind CSS compilation
- **Node.js:** v22.19.0 LTS

## Quick Start

### Prerequisites
- **Node.js v22.19.0+ LTS**
- **pnpm 10.15.0+**

### Installation
```bash
# Clone repository
git clone https://github.com/NexiaFitness/Frontend.git
cd Frontend

# Install dependencies for all packages
pnpm install

# Build shared package
pnpm -F shared build

# Start development server
pnpm -F web dev
```

**Application URLs:**
- **Main app:** `http://localhost:5173/`
- **Login page:** `http://localhost:5173/login`
- **Register page:** `http://localhost:5173/register` 
- **Password recovery:** `http://localhost:5173/auth/forgot-password`

## Development Workflow

### Branch Strategy
- `main` - Production releases
- `develop` - Development integration  
- `feature/*` - Feature branches

### Current Implementation Status

**Authentication System - COMPLETE:**
- Login, Register, Forgot Password, Reset Password pages
- Form validation with custom hooks and error handling
- Backend integration via RTK Query with FastAPI
- JWT token management with automatic header injection
- Glassmorphism UI design matching Figma specifications
- Hot reload fully functional

**Architecture - OPTIMIZED:**
- Eliminated packages/ui-web and packages/ui-shared
- Centralized all UI components in apps/web/src/components/
- Simplified import paths and dependency management
- Tailwind CSS configuration unified in web app
- Resolved hot reload issues for improved development experience

## Core Components

### Authentication Components
```typescript
// Available in src/components/auth/
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
```

### Form Components
```typescript
// Available in src/components/forms/
import { Button } from "@/components/forms/Button";        // Primary/Secondary variants
import { Input } from "@/components/forms/Input";          // Text/email/password with validation
```

### Shared Components
```typescript
// Available in src/components/shared/
import { ServerErrorBanner } from "@/components/shared/ServerErrorBanner"; // Error handling
```

### Business Logic Hooks
```typescript
// Available from shared package
import { useAuthForm } from "@shared/hooks/useAuthForm";
import { validateLoginForm, validateResetPasswordForm } from "@shared/utils/validation";
```

## Backend Integration

**API Configuration:**
- **Base URL:** `https://nexiaapp.com/api/v1`
- **Authentication:** JWT Bearer tokens
- **Role System:** Admin, Trainer, Athlete

**Available Endpoints:**
```typescript
// RTK Query hooks available
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} from "@shared/api/authApi";
```

**Test Credentials:**
```javascript
// Available for development testing
trainer@test.com / YourPass123
admin@test.com / AdminPass123
athlete@test.com / AthletePass123
```

## Available Scripts

### Development Commands
```bash
# Start development server with hot reload
pnpm -F web dev

# Build for production
pnpm -F web build

# Preview production build
pnpm -F web preview

# Type checking
pnpm -F web type-check
```

### Package Management
```bash
# Build shared package
pnpm -F shared build

# Add dependency to web app
pnpm -F web add <package>

# Add dependency to shared package
pnpm -F shared add <package>

# Install all dependencies
pnpm install
```

### Linting and Formatting
```bash
# Run ESLint
pnpm -F web lint

# Fix ESLint issues
pnpm -F web lint:fix

# Format code with Prettier
pnpm -F web format
```

## Architecture Decisions

### Why Simplified Structure
The previous architecture with separate ui-web and ui-shared packages created unnecessary complexity:

**Problems Solved:**
- **Hot reload issues:** Tailwind changes now reflect immediately
- **Over-engineering:** Eliminated component library for single consumer
- **Development friction:** No more manual rebuilds between changes
- **Import complexity:** Simplified import paths and dependencies

**Benefits Achieved:**
- **Faster development:** Hot reload works seamlessly
- **Clearer organization:** All UI components in logical locations
- **Better maintainability:** Single source of truth for UI components
- **Scalable preparation:** Ready for mobile while keeping shared business logic

### Role-Based Architecture
Aligned with backend's unified RBAC API:
- Single login endpoint for all user roles
- Conditional routing based on user role after authentication
- Shared components across admin, trainer, and athlete interfaces
- Centralized state management for cross-role functionality

## Project Configuration

### Vite Configuration
```typescript
// apps/web/vite.config.ts - Key aliases
resolve: {
  alias: {
    "@": path.resolve(__dirname, "src"),
    "@shared": path.resolve(__dirname, "../../packages/shared/src"),
  }
}
```

### Tailwind Configuration
```javascript
// apps/web/tailwind.config.js - Optimized for component scanning
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

## Performance Optimizations

- **CSS Purging:** Tailwind removes unused classes in production
- **Tree Shaking:** TypeScript + Vite eliminate dead code
- **Component Co-location:** Related components grouped for optimal loading
- **Centralized Imports:** Simplified dependency resolution
- **Hot Reload:** Immediate feedback during development

## Development Standards

### File Organization
- **Components:** Organized by feature/role in logical directories
- **Hooks:** Business logic hooks in shared, UI hooks in web app
- **Utils:** Validation and helpers separated by concern
- **Types:** TypeScript interfaces centralized in shared package

### Code Quality
- **TypeScript Strict Mode:** No `any` types, proper interfaces
- **Component Documentation:** Header comments for all files
- **Professional Git Commits:** Semantic versioning with detailed messages
- **Import Consistency:** Standardized alias usage across codebase

## Troubleshooting

### Build Issues
```bash
# Clear caches and rebuild
rm -rf apps/web/node_modules/.vite
rm -rf packages/shared/dist
pnpm -F shared build
pnpm -F web dev
```

### Development Issues
```bash
# Verify Node.js version
node --version  # Should be v22.19.0+

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Contributing

### Development Process
1. **Create feature branch** from `develop`
2. **Implement changes** with proper TypeScript types
3. **Test functionality** across all authentication flows
4. **Commit with semantic versioning** (feat:, fix:, docs:)
5. **Create pull request** to `develop` branch

### Code Style
- **Consistent imports:** Use configured aliases (@, @shared)
- **Component structure:** Follow established patterns in existing components
- **Type safety:** Maintain strict TypeScript compliance
- **Documentation:** Update README for architectural changes

## Support

**For technical issues:**
1. Check build status and clear caches
2. Verify Node.js version compatibility
3. Review browser console for detailed errors
4. Create GitHub issue with reproduction steps

**For development questions:**
- Reference authentication flow implementations
- Check component examples in established directories
- Review RTK Query integration patterns
- Examine Tailwind configuration for styling

---

**Last Updated:** September 6, 2025  
**Architecture Version:** 2.0 (Post-Migration)  
**Current Branch:** `develop`  
**Status:** Authentication system complete, ready for dashboard development  
**Node.js:** v22.19.0 LTS
