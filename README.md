# NEXIA Frontend

Professional fitness training management platform frontend built with Vite + React + TypeScript.

## Architecture

**Monorepo Structure:**
```
frontend/
├── apps/
│   └── web/                           # Main React application
│       ├── public/
│       │   └── assets/               # ✅ Logo and static assets
│       ├── src/
│       │   ├── components/           # App-specific components
│       │   │   ├── auth/            # ✅ Authentication components
│       │   │   │   ├── AuthLayout.tsx    # ✅ 50/50 glassmorphism layout
│       │   │   │   ├── LoginForm.tsx     # ✅ Complete login form with validation
│       │   │   │   ├── RegisterForm.tsx  # ✅ Complete register form with validation
│       │   │   │   └── NexiaLogo.tsx     # ✅ Reusable logo component
│       │   │   ├── dashboard/       # 📋 Planned dashboard components
│       │   │   └── layout/          # 📋 Layout components (planned)
│       │   ├── pages/
│       │   │   ├── auth/            # ✅ Authentication pages
│       │   │   │   ├── Login.tsx         # ✅ Login page implementation
│       │   │   │   ├── Register.tsx      # ✅ Register page implementation  
│       │   │   │   └── ForgotPassword.tsx # ✅ Password recovery page
│       │   │   └── TestUi.tsx        # ✅ Component library test page
│       │   ├── App.tsx               # ✅ React Router setup
│       │   ├── main.tsx              # ✅ Redux Provider + Router
│       │   └── index.css             # Base CSS with gradients
│       ├── vite.config.ts            # ✅ Vite configuration with monorepo aliases
│       └── package.json              # ✅ Dependencies and scripts
├── packages/
│   ├── shared/                       # ✅ Universal business logic and state
│   │   ├── src/                     # ✅ CONSISTENT src/ structure
│   │   │   ├── api/
│   │   │   │   ├── authApi.ts       # ✅ RTK Query authentication endpoints
│   │   │   │   └── baseApi.ts       # ✅ RTK Query base configuration
│   │   │   ├── config/
│   │   │   │   └── constants.ts     # ✅ Application constants
│   │   │   ├── store/
│   │   │   │   ├── index.ts         # ✅ Redux Toolkit store configuration
│   │   │   │   └── authSlice.ts     # ✅ Authentication slice
│   │   │   ├── types/
│   │   │   │   └── auth.ts          # ✅ TypeScript authentication types
│   │   │   └── index.ts             # ✅ Package re-exports
│   │   ├── package.json             # ✅ Shared package configuration
│   │   └── tsconfig.json            # ✅ TypeScript configuration
│   ├── ui-shared/                   # ✅ NEW: Shared hooks and validation
│   │   ├── src/                     # ✅ CONSISTENT src/ structure  
│   │   │   ├── hooks/
│   │   │   │   └── useAuthForm.ts   # ✅ Reusable form hook for auth
│   │   │   ├── utils/
│   │   │   │   └── validation.ts    # ✅ Form validation utilities
│   │   │   └── index.ts             # ✅ Package exports
│   │   ├── package.json             # ✅ Package configuration
│   │   └── tsconfig.json            # ✅ TypeScript configuration
│   └── ui-web/                      # ✅ Web component library
│       ├── src/                     # ✅ CONSISTENT src/ structure
│       │   ├── components/
│       │   │   ├── auth/            # ✅ Auth-specific components
│       │   │   │   └── ServerErrorBanner.tsx # ✅ Error display component
│       │   │   ├── feedback/        # ✅ Feedback components
│       │   │   ├── forms/
│       │   │   │   ├── Button.tsx   # ✅ Button component with variants
│       │   │   │   └── Input.tsx    # ✅ Input component with validation
│       │   │   └── layout/          # ✅ Layout components
│       │   ├── styles/
│       │   │   ├── backgrounds.ts   # ✅ Background gradient utilities
│       │   │   └── globals.css      # ✅ Tailwind base styles
│       │   └── index.ts             # ✅ Package entry point
│       ├── dist/                    # ✅ Build output directory
│       ├── package.json             # ✅ Component library configuration
│       ├── postcss.config.js        # ✅ PostCSS configuration
│       ├── tailwind.config.js       # ✅ Tailwind CSS configuration
│       └── tsconfig.json            # ✅ TypeScript configuration
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package configuration
├── pnpm-lock.yaml                   # ✅ Updated dependencies lockfile
├── pnpm-workspace.yaml              # Workspace configuration
├── README.md                        # This file
└── tsconfig.json                    # Root TypeScript configuration
```

**Technology Stack:**
- **Framework:** Vite + React 18 + TypeScript 5
- **Package Manager:** pnpm (monorepo workspace)
- **State Management:** Redux Toolkit + RTK Query ✅ **IMPLEMENTED**
- **Authentication:** JWT Bearer tokens with automatic header injection ✅ **IMPLEMENTED**
- **UI Components:** Custom component library with Tailwind CSS ✅ **IMPLEMENTED**
- **Routing:** React Router DOM ✅ **IMPLEMENTED**  
- **Styling:** Tailwind CSS v3.4+ with custom gradients ✅ **IMPLEMENTED**
- **Build System:** TypeScript + Tailwind CSS compilation ✅ **IMPLEMENTED**
- **Node.js:** v22.19.0 LTS ✅ **UPGRADED**

## Quick Start

### Prerequisites
- **Node.js v22.19.0+ LTS** ✅ **VERIFIED COMPATIBLE**
- **pnpm 10.15.0+**

### Installation
```bash
# Clone repository
git clone https://github.com/NexiaFitness/Frontend.git
cd Frontend

# Install dependencies for all packages
pnpm install

# Build all packages in correct order
pnpm -F shared build
pnpm -F @nexia/ui-shared build
pnpm -F @nexia/ui-web build

# Start development server
pnpm -F web dev
```

**Application URLs:**
- **Main app:** `http://localhost:5173/`
- **Login page:** `http://localhost:5173/login`
- **Register page:** `http://localhost:5173/register` 
- **Component test:** `http://localhost:5173/test-ui`

## Development Workflow

### Branch Strategy
- `main` - Production releases
- `develop` - Development integration  
- `feature/*` - Feature branches

### Current Branch Status
**`feature/auth-pages`** ✅ **COMPLETE & FUNCTIONAL**
- ✅ **Monorepo architecture** with consistent `src/` structure
- ✅ **Authentication system** complete (login, register, forgot password)
- ✅ **Backend integration** with RTK Query + FastAPI
- ✅ **Component library** operational with reusable components
- ✅ **Form validation** with custom hooks and utilities
- ✅ **UI/UX implementation** following Figma designs
- **Status:** Ready for Pull Request to develop

## Architecture Implementation Details

### Consistent Monorepo Structure ✅ **IMPLEMENTED**

**All packages follow consistent `src/` structure:**
```
packages/
├── shared/src/          # Business logic, store, APIs  
├── ui-shared/src/       # Hooks, validations, utilities
└── ui-web/src/          # UI components, styles
```

### Authentication System ✅ **COMPLETE**

**Pages Implemented:**
- **Login (`/login`)** - Email/password with validation and error handling
- **Register (`/register`)** - Full registration form with confirmation
- **Forgot Password (`/forgot-password`)** - Password recovery workflow

**Backend Integration:**
```typescript
// RTK Query hooks available
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation
} from "@shared/api/authApi";
```

**Form Management:**
```typescript
// Reusable form hook
import { useAuthForm, validateLoginForm } from "@nexia/ui-shared";
```

### Component Library ✅ **OPERATIONAL**

**Available Components:**
```typescript
import { 
  Button,           // Primary/Secondary variants, sizes, loading states
  Input,            // Text/email/password with validation display
  ServerErrorBanner // Error handling component
} from "@nexia/ui-web";
```

**Styling System:**
- **Tailwind CSS** with custom configuration
- **Glassmorphism effects** for auth layouts
- **Corporate gradients** matching brand identity
- **Responsive design** mobile-first approach

### Build System ✅ **OPTIMIZED**

**Build Commands:**
```bash
# Build all packages
pnpm -F shared build        # TypeScript compilation
pnpm -F @nexia/ui-shared build  # Hooks and utilities
pnpm -F @nexia/ui-web build     # UI components + CSS

# Development server
pnpm -F web dev              # Vite dev server with HMR
```

**Alias Configuration:**
```typescript
// Vite aliases configured
"@shared"          → "packages/shared/src"
"@nexia/ui-shared" → "packages/ui-shared/src" 
"@nexia/ui-web"    → "packages/ui-web/src"
```

## Current Implementation Status

### ✅ **COMPLETED - Authentication Foundation**
- [x] **Node.js v22.19.0** upgrade and compatibility verification
- [x] **Monorepo architecture** with consistent src/ structure across packages
- [x] **Authentication pages** - Login, Register, Forgot Password
- [x] **Form validation** - Custom hooks with error handling
- [x] **Backend integration** - RTK Query with FastAPI endpoints
- [x] **Component library** - Button, Input, ServerErrorBanner
- [x] **Routing system** - React Router with authentication routes
- [x] **State management** - Redux Toolkit with auth slice
- [x] **UI/UX implementation** - Glassmorphism layouts matching Figma
- [x] **Build pipeline** - All packages compiling and functional
- [x] **Development workflow** - Hot reload and monorepo imports working

### 🚧 **IN PROGRESS - Next Sprint**
- [ ] **Dashboard layout** - Main application interface
- [ ] **Client onboarding** - Multi-step wizard implementation  
- [ ] **Navigation system** - Sidebar and header components
- [ ] **Protected routes** - Authentication guards

### 📋 **PLANNED - Future Development**
- [ ] **Training planning** - Workout creation interface
- [ ] **Client management** - CRUD operations for clients
- [ ] **Data visualization** - Charts and analytics components
- [ ] **Mobile responsiveness** - Tablet and phone optimizations
- [ ] **Testing implementation** - Jest + React Testing Library
- [ ] **React Native app** - Mobile application using shared packages

## Backend Integration

**API Configuration:**
- **Base URL:** `https://nexiaapp.com/api/v1`
- **Authentication:** JWT Bearer tokens
- **Role System:** Admin, Trainer, Athlete

**Test Credentials:**
```javascript
// Available for development testing
trainer@test.com / YourPass123
admin@test.com / AdminPass123
athlete@test.com / AthletePass123
```

**RTK Query Integration:**
```typescript
// Automatic token management
const { data, error, isLoading } = useLoginMutation();
```

## Commands Reference

### Development Commands
```bash
# Start development server
pnpm -F web dev

# Build component library
pnpm -F @nexia/ui-web build

# Build all packages
pnpm -F shared build && pnpm -F @nexia/ui-shared build && pnpm -F @nexia/ui-web build

# Clean all builds
rm -rf packages/*/dist/
```

### Package Management
```bash
# Add dependency to specific package
pnpm -F @nexia/ui-web add <package>
pnpm -F web add <package>
pnpm -F shared add <package>

# Add dev dependency
pnpm -F <package> add -D <package>
```

### Git Workflow
```bash
# Current feature branch
git status                           # Check current changes
git add .                           # Stage changes
git commit -m "feat: description"   # Commit with semantic versioning
git push origin feature/auth-pages   # Push to remote branch

# Create Pull Request to develop branch
```

## Troubleshooting

### Build Issues

**Package resolution errors:**
```bash
# Clean and rebuild in correct order
rm -rf packages/*/dist/
pnpm -F shared build
pnpm -F @nexia/ui-shared build  
pnpm -F @nexia/ui-web build
```

**Import resolution errors:**
```typescript
// Verify alias configuration in apps/web/vite.config.ts
resolve: {
  alias: {
    "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    "@nexia/ui-shared": path.resolve(__dirname, "../../packages/ui-shared/src"),
    "@nexia/ui-web": path.resolve(__dirname, "../../packages/ui-web/src"),
  }
}
```

### Development Issues

**Node.js version compatibility:**
- **Required:** v22.19.0+ LTS
- **Current:** ✅ v22.19.0 verified
- **Status:** Fully compatible with Vite 7.1.4

**Hot reload not working:**
```bash
# Clear Vite cache
rm -rf apps/web/node_modules/.vite
pnpm -F web dev
```

## Performance Optimizations

- **CSS Purging:** Tailwind removes unused classes (optimized output)
- **Tree Shaking:** TypeScript + Vite eliminate dead code
- **Component Splitting:** Atomic design prevents code duplication  
- **Build Pipeline:** Separate compilation for optimal loading
- **Import Strategy:** Named exports for bundle optimization

## Contributing

### Development Standards
1. **Consistent architecture** - All packages use `src/` structure
2. **TypeScript strict mode** - No `any` types, proper interfaces
3. **Component documentation** - Header comments for all files
4. **Professional git commits** - Semantic versioning with detailed messages
5. **Testing integration** - Components tested before merging
6. **Code review process** - All PRs reviewed before develop merge

### Component Development
```bash
# 1. Create component in appropriate package
cd packages/ui-web/src/components/forms/
# Create NewComponent.tsx

# 2. Export component  
# Add to packages/ui-web/src/components/index.ts

# 3. Build package
pnpm -F @nexia/ui-web build

# 4. Test in app
# Import in apps/web/src/ and test functionality

# 5. Commit and push
git add . && git commit -m "feat(ui-web): add NewComponent"
```

## Architecture Decisions

**Why Consistent src/ Structure:**
- **Predictable navigation** - All packages follow same pattern
- **Import consistency** - Aliases work uniformly across packages
- **Scalability** - Easy to add new packages following pattern
- **Professional standard** - Industry best practice for monorepos

**Why Three Package Split:**
- **`shared/`** - Universal business logic (APIs, store, types)
- **`ui-shared/`** - Reusable hooks and utilities  
- **`ui-web/`** - Platform-specific UI components
- **Future:** `ui-native/` for React Native components

**Why RTK Query Over Other Solutions:**
- **Automatic caching** - Optimized API call management
- **TypeScript integration** - Full type safety end-to-end
- **Redux DevTools** - Excellent debugging capabilities
- **Backend compatibility** - Works seamlessly with FastAPI

## Support

**Technical Issues:**
1. **Check build status:** Verify all packages compiled successfully
2. **Verify Node.js version:** Must be v22.19.0+ for compatibility
3. **Clear caches:** Remove `node_modules/.vite` and `dist/` folders
4. **Check browser console:** Look for detailed error messages
5. **Create GitHub issue:** Include error details and reproduction steps

**Development Questions:**
- **Architecture:** Reference this README for structure guidelines
- **Components:** Check `/test-ui` page for component examples  
- **API Integration:** Review RTK Query hooks in `shared/api/`
- **Styling:** Examine Tailwind configuration in `ui-web/`

---

**Last Updated:** September 4, 2025  
**Architecture Version:** 3.0  
**Current Branch:** `feature/auth-pages`  
**Status:** ✅ Complete authentication system, ready for dashboard development  
**Node.js:** v22.19.0 LTS  
**Total Development Time:** 2 days intensive implementation
