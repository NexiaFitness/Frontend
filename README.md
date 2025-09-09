# NEXIA Frontend

Professional fitness training management platform frontend built with modern web technologies.

## Architecture

**Simplified Monorepo Structure:**
```
frontend/
├── apps/
│   └── web/                           # React application (Vite + TS)
│       ├── dist/                      # Build output
│       ├── node_modules/
│       ├── public/
│       │   ├── assets/
│       │   │   └── Logo sin fondo blanco.png
│       │   └── vite.svg
│       ├── src/
│       │   ├── assets/
│       │   │   └── react.svg
│       │   ├── components/
│       │   │   ├── auth/              # Auth-specific components
│       │   │   │   ├── AuthLayout.tsx
│       │   │   │   ├── ForgotPasswordForm.tsx
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   ├── LoginForm.tsx.backup
│       │   │   │   ├── NexiaLogo.tsx
│       │   │   │   ├── ProtectedRoute.tsx
│       │   │   │   ├── RegisterForm.tsx
│       │   │   │   └── ResetPasswordForm.tsx
│       │   │   ├── dashboard/
│       │   │   │   └── DashboardLayout.tsx
│       │   │   ├── forms/
│       │   │   │   └── index.ts        # Components migrated to @shared
│       │   │   └── shared/
│       │   │       ├── index.ts
│       │   │       └── ServerErrorBanner.tsx
│       │   ├── pages/                  # Page-level components
│       │   │   ├── auth/
│       │   │   │   ├── ForgotPassword.tsx
│       │   │   │   ├── Login.tsx
│       │   │   │   ├── Register.tsx
│       │   │   │   └── ResetPassword.tsx
│       │   │   ├── dashboard/
│       │   │   │   └── TrainerDashboard.tsx
│       │   │   └── TestUi.tsx
│       │   ├── utils/
│       │   │   └── backgrounds.ts
│       │   ├── App.css
│       │   ├── App.tsx
│       │   ├── index.css
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── README.md
│       ├── tailwind.config.js
│       ├── tsconfig.app.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── tsconfig.tsbuildinfo
│       └── vite.config.ts
├── packages/
│   ├── config/
│   │   └── package.json                # Minimal package config
│   └── shared/                         # Cross-platform shared logic
│       ├── src/
│       │   ├── api/
│       │   │   ├── authApi.ts
│       │   │   └── baseApi.ts
│       │   ├── components/
│       │   │   ├── forms/              # Reusable form components
│       │   │   │   ├── Button.tsx      # Button with variants and sizes
│       │   │   │   ├── FormSelect.tsx  # Select with role selector capability
│       │   │   │   ├── Input.tsx       # Input with validation states
│       │   │   │   └── index.ts        # Centralized exports
│       │   │   └── index.ts            # Component exports
│       │   ├── config/
│       │   │   └── constants.ts
│       │   ├── hooks/
│       │   │   └── useAuthForm.ts
│       │   ├── store/
│       │   │   ├── authSlice.ts
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   └── auth.ts
│       │   ├── utils/
│       │   │   └── validation.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.json
```

**Technology Stack:**
- **Framework:** Vite + React 18 + TypeScript 5
- **Package Manager:** pnpm (monorepo workspace)
- **State Management:** Redux Toolkit + RTK Query
- **Authentication:** JWT Bearer tokens with automatic header injection
- **UI Components:** Centralized component library in shared package with Tailwind CSS
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
- **Dynamic role selector** in registration (Trainer/Athlete options)
- Form validation with custom hooks and error handling
- Backend integration via RTK Query with FastAPI
- JWT token management with automatic header injection
- Glassmorphism UI design matching Figma specifications
- Hot reload fully functional

**Component Architecture - MIGRATED TO SHARED:**
- **Form components centralized** in packages/shared for web/mobile reusability
- Button, Input, FormSelect components with consistent Tailwind styling
- Unified import system via @shared namespace
- TypeScript strict mode with proper exports and type definitions
- Visual consistency between all form elements

## Core Components

### Authentication Components
```typescript
// Available in src/components/auth/
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";       // Now includes role selector
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
```

### Form Components (Shared Package)
```typescript
// Available from shared package - centralized for web/mobile
import { Button, Input, FormSelect } from "@shared";
import type { ButtonVariant, ButtonSize } from "@shared";
import type { InputType, InputSize } from "@shared";
import type { SelectOption, SelectSize } from "@shared";
```

### Shared Components
```typescript
// Available in src/components/shared/
import { ServerErrorBanner } from "@/components/shared/ServerErrorBanner"; // Error handling
```

### Business Logic Hooks
```typescript
// Available from shared package
import { useAuthForm } from "@shared";
import { validateLoginForm, validateRegisterForm, validateResetPasswordForm } from "@shared";
```

### Configuration and Constants
```typescript
// Available from shared package
import { USER_ROLES, API_CONFIG, AUTH_CONFIG, ROUTES } from "@shared";
```

## Registration System

### Role-Based Registration
The registration system now includes dynamic role selection:

```typescript
// Available roles for public registration
const roleOptions = [
    { value: USER_ROLES.TRAINER, label: "Entrenador Personal" },
    { value: USER_ROLES.ATHLETE, label: "Atleta" },
    // ADMIN role excluded from public registration
];
```

**Security Features:**
- Admin role creation restricted to internal processes
- Role validation integrated with form validation system
- Dynamic form behavior based on selected role

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

**Registration Flow:**
```typescript
// RegisterForm now sends dynamic role data
const credentials: RegisterCredentials = {
  email: formData.email,
  password: formData.password,
  nombre: formData.nombre,
  apellidos: formData.apellidos,
  role: formData.role, // Dynamic role selection
};
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
# Build shared package (required after component changes)
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

### Component Migration to Shared Package
Components have been migrated from apps/web to packages/shared for scalability:

**Benefits Achieved:**
- **Cross-platform reusability:** Ready for future mobile development
- **Consistent styling:** All form components use identical Tailwind classes
- **Centralized maintenance:** Single source of truth for UI components
- **Type safety:** Proper TypeScript exports with shared type definitions
- **Development efficiency:** Unified import system via @shared namespace

### Form Component Consistency
All form components now maintain visual and behavioral consistency:

```typescript
// Consistent styling approach across Button, Input, and FormSelect
const baseStyles = `block w-full rounded-md border transition-colors 
  focus:outline-none focus:ring-2 focus:ring-primary-600 
  focus:border-primary-600 focus:ring-offset-2 disabled:opacity-50 
  disabled:cursor-not-allowed`;
```

**Visual Features:**
- Identical label styling with white asterisks for required fields
- Consistent error and helper text styling
- Dynamic color states (gray-400 for placeholders, gray-900 for values)
- Unified size variants (sm, md, lg) across all components

### Role-Based Architecture
Aligned with backend's unified RBAC API:
- Single login endpoint for all user roles
- Dynamic role selection in registration form
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

### TypeScript Configuration
```json
// packages/shared/tsconfig.json - Optimized for component compilation
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Tailwind Configuration
```javascript
// apps/web/tailwind.config.js - Optimized for component scanning
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  "../../packages/shared/src/**/*.{js,ts,jsx,tsx}", // Include shared components
]
```

## Performance Optimizations

- **CSS Purging:** Tailwind removes unused classes in production
- **Tree Shaking:** TypeScript + Vite eliminate dead code
- **Component Co-location:** Related components grouped for optimal loading
- **Shared Package Compilation:** Pre-built components for faster development
- **Hot Reload:** Immediate feedback during development
- **Centralized Dependencies:** Reduced bundle size through shared components

## Development Standards

### File Organization
- **Form Components:** Centralized in packages/shared/src/components/forms/
- **App Components:** Feature-specific components in apps/web/src/components/
- **Hooks:** Business logic hooks in shared, UI hooks in web app
- **Utils:** Validation and helpers separated by concern
- **Types:** TypeScript interfaces centralized in shared package

### Code Quality
- **TypeScript Strict Mode:** No `any` types, proper interfaces
- **Component Documentation:** Header comments for all files
- **Professional Git Commits:** Semantic versioning with detailed messages
- **Import Consistency:** Standardized alias usage (@shared for shared components)

### Import Guidelines
```typescript
// Correct import patterns
import { Button, Input, FormSelect } from "@shared";           // Form components
import { useAuthForm, validateRegisterForm } from "@shared";   // Business logic
import { USER_ROLES } from "@shared";                         // Configuration
import { Component } from "@/components/feature/Component";    // App-specific components
```

## Troubleshooting

### Build Issues
```bash
# Clear caches and rebuild shared package first
rm -rf packages/shared/dist
pnpm -F shared build

# Then clear web app cache
rm -rf apps/web/node_modules/.vite
pnpm -F web dev
```

### Component Import Issues
```bash
# Ensure shared package is built and exported correctly
pnpm -F shared build
cat packages/shared/src/components/forms/index.ts  # Verify exports
cat packages/shared/src/index.ts                   # Verify main exports
```

### Development Issues
```bash
# Verify Node.js version
node --version  # Should be v22.19.0+

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Recent Changes (Migration v2.1)

### Component Architecture Migration
- **Button.tsx, Input.tsx** migrated from apps/web to packages/shared
- **FormSelect.tsx** created in packages/shared with consistent styling
- **Import updates** across 12 files from @/components/forms to @shared
- **Role selector** implemented in RegisterForm with dynamic validation

### Technical Improvements
- **Visual consistency** achieved across all form components  
- **TypeScript configuration** optimized for shared package compilation
- **Dependencies management** with clsx added to shared package
- **Export structure** centralized with proper type definitions

## Contributing

### Development Process
1. **Create feature branch** from `develop`
2. **Build shared package** after component changes: `pnpm -F shared build`
3. **Implement changes** with proper TypeScript types
4. **Test functionality** across all authentication flows
5. **Commit with semantic versioning** (feat:, fix:, docs:)
6. **Create pull request** to `develop` branch

### Component Development
```bash
# When creating/modifying shared components:
cd packages/shared
# Make changes to src/components/
pnpm run build
cd ../apps/web
pnpm run dev  # Test changes in web app
```

### Code Style
- **Consistent imports:** Use @shared for shared components, @ for app components
- **Component structure:** Follow established patterns in existing components
- **Type safety:** Maintain strict TypeScript compliance
- **Visual consistency:** Use established styling patterns from Input.tsx
- **Documentation:** Update README for architectural changes

## Support

**For technical issues:**
1. **Build shared package first:** `pnpm -F shared build`
2. Check build status and clear caches
3. Verify Node.js version compatibility
4. Review browser console for detailed errors
5. Create GitHub issue with reproduction steps

**For development questions:**
- Reference authentication flow implementations
- Check component examples in packages/shared/src/components/
- Review RTK Query integration patterns
- Examine Tailwind configuration for styling
- Follow established import patterns with @shared namespace

---

**Last Updated:** September 9, 2025  
**Architecture Version:** 2.1 (Post-Component Migration)  
**Current Branch:** `feature/reusable-form-components`  
**Status:** Authentication system with role selector complete, components migrated to shared package  
**Node.js:** v22.19.0 LTS
