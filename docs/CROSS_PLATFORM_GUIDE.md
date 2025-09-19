# NEXIA Cross-Platform Guide

## Overview
This guide describes the migration plan required to make the NEXIA UI layer fully cross-platform.  
The goal is to separate UI contracts from implementations, ensuring **web (Tailwind)** and **mobile (React Native)** can share the same logic without introducing technical debt.

---

## Phase 1 – Define Contracts (`ui-primitives`)

**Objective:** Separate component interfaces from implementations.  

### Steps
1. Create folder `packages/ui-primitives/src/` with subfolders:
   ```
   packages/ui-primitives/src/
   ├── Button/
   ├── Input/
   └── FormSelect/
   ```
2. Define interfaces with platform-agnostic props.  
   - Example `ButtonProps`: `variant`, `size`, `onPress`, `children`.  
   - No styles or platform-specific imports allowed.  
3. Add minimal unit tests to ensure contracts exist and export correctly.  

---

## Phase 2 – Migrate Current Implementations (`ui-web`)

**Objective:** Keep the current web UI working but decoupled from shared.  

### Steps
1. Create folder `packages/ui-web/src/components/forms/`.  
2. Move existing implementations:
   - `Button.tsx`  
   - `Input.tsx`  
   - `FormSelect.tsx`  
3. Update them to import contracts from `ui-primitives`.  
4. Update imports in `apps/web` from:  
   ```ts
   import { Button } from "@shared";
   ```
   to:
   ```ts
   import { Button } from "@ui-web";
   ```
5. Run full frontend test suite (currently 228 cases) to confirm nothing breaks.  

---

## Phase 3 – Prepare Native Stubs (`ui-native`)

**Objective:** Lay the groundwork for future mobile development.  

### Steps
1. Create folder `packages/ui-native/src/components/forms/`.  
2. Create stubs for each component with `React Native StyleSheet`.  
   - Example: `Button.tsx` using `TouchableOpacity` with `ButtonProps`.  
3. Add a README in `ui-native` explaining components are placeholders for mobile.  
4. Add contract tests to verify both `ui-web/Button` and `ui-native/Button` satisfy `ButtonProps`.  

---

## Recommended Migration Order
1. **Button** (most used).  
2. **Input**.  
3. **FormSelect**.  

Once these three are migrated, the same pattern can be applied to all other components.

---

## Validation

- Run:
  ```bash
  pnpm -F web test
  pnpm -F web dev
  pnpm -F web build
  ```
- Confirm:
  - All tests pass.  
  - Hot reload works.  
  - Builds succeed.  
  - `tsc --noEmit` shows no broken imports.  

---

## Expected Result

- `packages/shared` → Only business logic and type definitions.  
- `packages/ui-primitives` → Pure UI contracts, platform-agnostic.  
- `packages/ui-web` → Tailwind implementations.  
- `packages/ui-native` → React Native implementations (stub for now).  

With this structure, technical debt is eliminated. When mobile development begins, only `ui-native` needs to be filled out — no backend or shared logic changes will be required.

---

**Last Updated**: September 19, 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), CTO, Backend Team
