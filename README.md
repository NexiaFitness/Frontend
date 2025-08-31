# NEXIA Frontend

Professional fitness training management platform frontend built with Vite + React + TypeScript.

## Architecture

**Monorepo Structure:**
```
frontend/
├── apps/
│   └── web/                           # Main React application
│       ├── public/
│       │   └── vite.svg              # Static assets
│       ├── src/
│       │   ├── components/           # App-specific components
│       │   │   ├── auth/            # ✅ Authentication components (ready)
│       │   │   ├── dashboard/       # ✅ Dashboard components (ready)
│       │   │   └── layout/          # ✅ Layout components (ready)
│       │   ├── pages/
│       │   │   └── TestUi.tsx        # ✅ Test page for UI components
│       │   ├── assets/
│       │   │   └── react.svg         # React assets
│       │   ├── App.tsx               # ✅ Updated with React Router
│       │   ├── main.tsx              # ✅ Redux Provider + Router setup
│       │   ├── index.css             # Base CSS
│       │   └── vite-env.d.ts         # Vite type definitions
│       ├── index.html                # HTML template
│       ├── package.json              # ✅ Added react-router-dom dependency
│       ├── vite.config.ts            # ✅ Vite configuration with aliases
│       ├── tsconfig.app.json         # TypeScript app configuration
│       ├── tsconfig.json             # TypeScript configuration
│       ├── tsconfig.node.json        # TypeScript Node configuration
│       └── eslint.config.js          # ESLint configuration
├── packages/
│   ├── shared/                       # Universal business logic and state
│   │   ├── api/
│   │   │   ├── authApi.ts           # ✅ RTK Query authentication endpoints
│   │   │   └── baseApi.ts           # ✅ RTK Query base configuration
│   │   ├── config/
│   │   │   └── constants.ts         # ✅ Application constants
│   │   ├── store/
│   │   │   └── index.ts             # ✅ Redux Toolkit store configuration
│   │   ├── types/
│   │   │   └── auth.ts              # ✅ TypeScript authentication types
│   │   └── package.json             # Shared package configuration
│   ├── ui-web/                       # ✅ NEW: Web component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── feedback/        # ✅ Feedback components (alerts, toasts)
│   │   │   │   ├── forms/
│   │   │   │   │   └── Button.tsx   # ✅ Button component with variants
│   │   │   │   ├── layout/          # ✅ Layout components (headers, sidebars)
│   │   │   │   └── index.ts         # ✅ Component exports
│   │   │   ├── styles/
│   │   │   │   └── globals.css      # ✅ Tailwind base styles
│   │   │   └── index.ts             # ✅ Package entry point
│   │   ├── dist/                     # ✅ Build output directory
│   │   │   ├── index.js             # Compiled components
│   │   │   ├── index.d.ts           # TypeScript declarations
│   │   │   └── styles.css           # Compiled Tailwind CSS
│   │   ├── .gitignore               # Git ignore rules for ui-web
│   │   ├── LICENSE                  # Package license
│   │   ├── package.json             # ✅ Component library configuration
│   │   ├── postcss.config.js        # ✅ PostCSS configuration
│   │   ├── README.md                # Component library documentation
│   │   ├── tailwind.config.js       # ✅ Tailwind CSS configuration
│   │   ├── tsconfig.buildinfo       # TypeScript build info
│   │   └── tsconfig.json            # ✅ TypeScript configuration
│   └── config/                       # Shared configurations (placeholder)
│       └── package.json              # Config package (basic)
├── .gitignore                        # Git ignore rules
├── LICENSE                           # Project license
├── package.json                      # Root package configuration
├── pnpm-lock.yaml                    # ✅ Updated dependencies lockfile
├── pnpm-workspace.yaml               # Workspace configuration
├── README.md                         # This file
└── tsconfig.json                     # Root TypeScript configuration
```

**Technology Stack:**
- **Framework:** Vite + React 18 + TypeScript 5
- **Package Manager:** pnpm (workspace configuration)
- **State Management:** Redux Toolkit + RTK Query ✅ **IMPLEMENTED**
- **Authentication:** JWT Bearer tokens with automatic header injection
- **UI Components:** Custom component library with Tailwind CSS ✅ **IMPLEMENTED**
- **Routing:** React Router v7 ✅ **IMPLEMENTED**
- **Styling:** Tailwind CSS v3.4.17 ✅ **IMPLEMENTED**
- **Build System:** TypeScript + Tailwind CSS compilation ✅ **IMPLEMENTED**

## Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+ (current: requires upgrade from 20.16.0)
- pnpm 8.0+

### Installation
```bash
# Clone repository
git clone https://github.com/NexiaFitness/Frontend.git
cd Frontend

# Install dependencies for all packages
pnpm install

# Build component library
pnpm -F @nexia/ui-web build

# Start development server
cd apps/web
pnpm dev
```

The application will be available at:
- **Main app:** `http://localhost:5173`
- **Component test page:** `http://localhost:5173/test-ui`

## Development Workflow

### Branch Strategy
- `main` - Production releases
- `develop` - Development integration  
- `feature/*` - Feature branches

### Current Branch Status
**`feature/auth-ui-implementation`** ✅ COMPLETE
- Component library foundation implemented
- Tailwind CSS integrated and building
- Button component with variants functional
- React Router configured
- Ready for Pull Request

### Working with the Monorepo

```bash
# Install dependencies for all packages
pnpm install

# Build component library
pnpm -F @nexia/ui-web build

# Build CSS only (component library)
pnpm -F @nexia/ui-web run build:css

# Watch CSS changes (component library)
pnpm -F @nexia/ui-web run dev

# Start web app development server
cd apps/web && pnpm dev
```

### Component Development Workflow

```bash
# Create new component in ui-web
cd packages/ui-web/src/components/forms/
# Create NewComponent.tsx

# Export component
# Add export to packages/ui-web/src/components/index.ts

# Build component library
pnpm -F @nexia/ui-web build

# Use in web app
# Import from '@nexia/ui-web' in apps/web/src/
```

## Technical Implementation Details

### Component Library (`packages/ui-web/`)

**Current Components:**
- ✅ **Button** - Primary/Secondary variants, SM/MD/LG sizes, loading states

**Build Pipeline:**
```bash
# TypeScript compilation → dist/index.js + index.d.ts  
pnpm run build:ts

# Tailwind CSS compilation → dist/styles.css
pnpm run build:css

# Full build (both)
pnpm run build
```

**Usage in Web App:**
```typescript
import { Button } from '@nexia/ui-web';
import '@nexia/ui-web/styles';

export default function LoginForm() {
  return (
    <Button variant="primary" size="md">
      Sign In
    </Button>
  );
}
```

### Tailwind CSS Configuration

**Location:** `packages/ui-web/tailwind.config.js`

**Custom Theme Extensions:**
- Primary color palette (blue shades)
- Gray color palette for secondary elements
- Inter font family
- Custom component classes (`.btn-primary`, `.btn-secondary`)
- Forms plugin integrated
- Dark mode support (class-based)

**Content Paths:**
```javascript
content: ["./src/**/*.{js,ts,jsx,tsx}"]
```

### React Router Implementation

**Routes Available:**
- `/` - Home page
- `/test-ui` - Component library test page

**Authentication Routes (Planned):**
- `/auth/login` - Login form
- `/auth/register` - Registration form
- `/auth/forgot-password` - Password recovery

### Redux Toolkit + RTK Query

**Available API Hooks:**
```typescript
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery
} from '@shared/api/authApi';
```

**Backend Integration:**
- Base URL: `https://nexiaapp.com/api/v1`
- Automatic JWT token injection
- Role-based access (Admin/Trainer/Athlete)

**Test Credentials:**
- Trainer: `trainer@test.com` / `YourPass123`
- Admin: `admin@test.com` / `AdminPass123`
- Athlete: `athlete@test.com` / `AthletePass123`

## File Locations Reference

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `tailwind.config.js` | `packages/ui-web/` | Tailwind CSS configuration |
| `postcss.config.js` | `packages/ui-web/` | PostCSS configuration |
| `tsconfig.json` | `packages/ui-web/` | TypeScript config for components |
| `tsconfig.json` | `apps/web/` | TypeScript config for web app |
| `vite.config.ts` | `apps/web/` | Vite bundler configuration |
| `package.json` | `packages/ui-web/` | Component library package config |

### Component Architecture

**Atomic Design Structure (Prepared):**
```
packages/ui-web/src/components/
├── forms/                    # Form-related components
│   └── Button.tsx           # ✅ Implemented
├── atoms/                    # Basic building blocks (planned)
├── molecules/                # Component combinations (planned)  
├── organisms/                # Complex UI sections (planned)
├── templates/                # Page layouts (planned)
└── index.ts                 # ✅ Central exports
```

### Build Outputs

| Output | Location | Description |
|--------|----------|-------------|
| `index.js` | `packages/ui-web/dist/` | Compiled components |
| `index.d.ts` | `packages/ui-web/dist/` | TypeScript declarations |
| `styles.css` | `packages/ui-web/dist/` | Compiled Tailwind CSS (~10KB) |

## Commands Reference

### Development Commands
```bash
# Start development (from project root)
cd apps/web && pnpm dev

# Build component library
pnpm -F @nexia/ui-web build

# Watch CSS changes
pnpm -F @nexia/ui-web run dev

# Test component library
# Navigate to http://localhost:5173/test-ui
```

### Build Commands
```bash
# Build everything (when configured)
pnpm run build

# Build specific package
pnpm -F @nexia/ui-web build
pnpm -F web build
```

### Package Management
```bash
# Add dependency to component library
pnpm -F @nexia/ui-web add <package>

# Add dependency to web app
pnpm -F web add <package>

# Add dependency to shared
pnpm -F shared add <package>

# Add dev dependency
pnpm -F @nexia/ui-web add -D <package>
```

## Current Implementation Status

### ✅ COMPLETED (Foundation Phase)
- [x] Monorepo architecture with pnpm workspaces
- [x] Redux Toolkit + RTK Query integration
- [x] Component library infrastructure (`packages/ui-web/`)
- [x] Tailwind CSS configuration and build pipeline
- [x] TypeScript compilation for component exports
- [x] React Router implementation with test routes
- [x] Button component with variants and proper styling
- [x] Import/export system working between packages
- [x] Development and build workflows established

### 🚧 IN PROGRESS (Next Phase)
- [ ] Input component (text, email, password variants)
- [ ] LoginForm organism using Button + Input + RTK Query hooks
- [ ] RegisterForm organism with validation
- [ ] AuthLayout template for authentication pages
- [ ] Error handling and loading states

### 📋 PLANNED (Future Phases)
- [ ] Client onboarding wizard components
- [ ] Dashboard layout and components
- [ ] Training planning interface components
- [ ] Mobile responsive optimizations
- [ ] Component testing with Jest + React Testing Library
- [ ] Storybook documentation for component library

## React Native Preparation

This monorepo architecture supports React Native expansion:

**Shared Logic:** `packages/shared/` (Redux, APIs, types, utils) - 100% reusable in mobile

**Platform-Specific UI:**
```
packages/
├── ui-web/        # ✅ Web components (Tailwind CSS)
└── ui-native/     # 📋 Future mobile components (StyleSheet)
```

**Design Token Strategy:**
- Colors and spacing will be extracted to `packages/shared/tokens/`
- Web components use Tailwind classes consuming shared tokens
- Mobile components use StyleSheet consuming same shared tokens

## Performance Optimizations

- **CSS Optimization:** Tailwind purges unused classes (10KB output)
- **TypeScript:** Strict mode enabled with proper tree shaking
- **Build Pipeline:** Separate CSS and JS compilation for optimal loading
- **Component Architecture:** Atomic design prevents code duplication
- **Import Strategy:** Named exports for optimal bundle splitting

## Troubleshooting

### Common Issues

**"tailwindcss command not found"**
```bash
# Use full path or pnpm script
./node_modules/.bin/tailwindcss --help
# or
pnpm run build:css
```

**Import errors from @nexia/ui-web**
```bash
# Ensure component library is built
pnpm -F @nexia/ui-web build

# Check exports in packages/ui-web/src/components/index.ts
```

**Styles not applying**
```typescript
// Import styles in component
import '@nexia/ui-web/styles';
```

### Development Setup Issues

**Node.js Version Warning**
- Current: 20.16.0
- Required: 20.19+ or 22.12+
- Status: Non-critical, development works correctly

## Contributing

1. Follow established atomic design component structure
2. Use RTK Query for all API communications
3. Components must have TypeScript interfaces for all props
4. Include component in `packages/ui-web/src/components/index.ts` exports
5. Test components on `/test-ui` page before committing
6. Build component library before creating PR
7. Follow existing Tailwind CSS class patterns
8. Maintain code consistency with existing patterns

## Architecture Decisions

**Why Tailwind CSS in `packages/ui-web/`:**
- Platform-specific styling (React Native uses StyleSheet)
- Professional component library approach
- Optimal build pipeline with CSS compilation
- Scalable for large component libraries

**Why Atomic Design Structure:**
- Prevents component library chaos
- Clear component hierarchy and reusability
- Industry standard for design systems
- Scalable architecture for large applications

**Why Monorepo with pnpm:**
- Share business logic between web and future mobile
- Consistent TypeScript configuration
- Optimized dependency management
- Professional development workflow

## Support

For technical questions or issues:
1. Check component library build: `pnpm -F @nexia/ui-web build`
2. Verify imports and exports in test page
3. Check browser console for detailed error messages
4. Create GitHub issue with detailed description

---

**Last Updated:** August 31, 2025  
**Architecture Version:** 2.0  
**Current Branch:** `feature/auth-ui-implementation`  
**Status:** Foundation complete, ready for authentication forms development
