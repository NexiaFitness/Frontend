# NEXIA Frontend

Professional fitness training management platform frontend built with Vite + React + TypeScript.

## Architecture

**Monorepo Structure:**
```
frontend/
├── apps/
│   └── web/                    # Main React application
├── packages/
│   ├── shared/                 # Shared business logic, Redux store, APIs
│   ├── ui-web/                 # Reusable web components
│   └── config/                 # Shared configurations
├── pnpm-workspace.yaml         # Workspace configuration
└── package.json                # Root package configuration
```

**Technology Stack:**
- **Framework:** Vite + React 18 + TypeScript 5
- **Package Manager:** pnpm (workspace configuration)
- **State Management:** Redux Toolkit + RTK Query (planned)
- **Styling:** Tailwind CSS (planned)
- **Testing:** Jest + React Testing Library (planned)

## Quick Start

### Prerequisites
- Node.js 20.16.0+ (20.19+ recommended)
- pnpm 8.0+

### Installation
```bash
# Clone repository
git clone https://github.com/NexiaFitness/Frontend.git
cd Frontend

# Install dependencies
pnpm install

# Start development server
cd apps/web
pnpm dev
```

The application will be available at `http://localhost:5173`

## Development Workflow

### Branch Strategy
- `main` - Production releases
- `develop` - Development integration
- `feature/*` - Feature branches

### Creating a Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Working with the Monorepo
```bash
# Install dependencies for all packages
pnpm install

# Run development server for web app
cd apps/web
pnpm dev

# Build all packages
pnpm build

# Run tests (when configured)
pnpm test
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch to GitHub
4. Create Pull Request: `feature/branch` → `develop`
5. Review and merge
6. Clean up local branch:
```bash
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

## Project Structure Detail

### apps/web/
Main React application built with Vite.

**Key Files:**
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main component
- `vite.config.ts` - Vite configuration
- `package.json` - Web app dependencies

### packages/shared/
Universal business logic, state management, and API integration.

**Planned Structure:**
```
packages/shared/
├── store/          # Redux Toolkit store
├── api/            # RTK Query API definitions  
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
├── types/          # TypeScript interfaces
└── validators/     # Form validation schemas
```

### packages/ui-web/
Reusable web-specific UI components.

**Planned Structure:**
```
packages/ui-web/
├── components/     # UI components
├── hooks/          # UI-specific hooks
└── styles/         # Styling utilities
```

### packages/config/
Shared configuration files and constants.

**Planned Structure:**
```
packages/config/
├── tailwind-preset.js
├── tsconfig.base.json
└── eslint-config.js
```

## Integration with Backend

**Backend API:** https://nexiaapp.com/api/v1

**Authentication:**
- JWT Bearer token authentication
- Roles: Admin, Trainer, Athlete

**Test Credentials:**
- Trainer: `trainer@test.com` / `YourPass123`
- Admin: `admin@test.com` / `AdminPass123`  
- Athlete: `athlete@test.com` / `AthletePass123`

## Future Roadmap

### Sprint 1: Authentication & Foundation
- Redux Toolkit + RTK Query setup
- JWT authentication flow
- Protected routes by role
- Basic layout structure

### Sprint 2: Client Onboarding
- Multi-step wizard component
- Complex form validation
- Anthropometric data tables
- Integration with client APIs

### Sprint 3: Dashboard & Analytics  
- Metrics visualization
- Charts integration (Recharts)
- Real-time data display
- Navigation structure

### Sprint 4: Training Planning
- Training plan creation workflow
- Advanced chart interactions
- Date/milestone management
- Progress tracking

### Sprint 5: Performance & Polish
- Code splitting optimization
- E2E testing with Playwright
- Mobile responsive design
- Error boundaries

### Sprint 6: Production Ready
- CI/CD pipeline setup
- Performance monitoring
- Documentation completion
- Production deployment

## React Native Preparation

This monorepo is architected to support React Native expansion:

**Shared packages:** All business logic in `packages/shared/` will be 100% reusable in mobile app.

**Future structure:**
```
apps/
├── web/           # Current React web app
└── mobile/        # Future React Native app

packages/
├── shared/        # Universal (web + mobile)
├── ui-web/        # Web-specific components
└── ui-native/     # Mobile-specific components (future)
```

## Commands Reference

```bash
# Development
pnpm dev                    # Start web development server
pnpm build                  # Build all packages
pnpm test                   # Run tests (when configured)

# Package Management  
pnpm install                # Install all dependencies
pnpm add <package>          # Add dependency to root
pnpm -F web add <package>   # Add dependency to web app
pnpm -F shared add <package> # Add dependency to shared

# Git Workflow
git checkout develop        # Switch to develop branch
git pull origin develop     # Update develop
git checkout -b feature/name # Create feature branch
git push origin feature/name # Push feature branch
```

## Environment Variables

**apps/web/.env:**
```bash
VITE_API_BASE_URL=https://nexiaapp.com/api/v1
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

## Contributing

1. Follow the established branch strategy
2. Create descriptive commit messages
3. Test changes locally before pushing
4. Create detailed Pull Request descriptions
5. Follow TypeScript best practices
6. Maintain code consistency

## Support

For technical questions or issues:
1. Check existing GitHub Issues
2. Create new issue with detailed description
3. Tag appropriate team members

---

**Last Updated:** August 2025  
**Architecture Version:** 1.0  
**Status:** Initial setup complete, ready for Sprint 1
