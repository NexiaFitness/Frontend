# NEXIA Cross-Platform Guide

## Overview
This guide describes the approach chosen for the cross-platform architecture of the NEXIA project.  
The goal is to keep **business logic and type definitions fully shared** while allowing each platform (web and native) to develop and maintain its **own UI layer** independently.  

This approach avoids unnecessary abstraction layers at this stage and follows a professional pattern seen in many large companies:  
- **Shared package** → Business logic, state, APIs, validation, types.  
- **Web app** → Tailwind-based UI, optimized for browser.  
- **Mobile app** (future) → React Native UI, optimized for native platforms.  

No `ui-primitives` package is created. Contracts will be naturally enforced through TypeScript types in `shared`, while each platform owns its own rendering and styling system.

---

## Current Decision

### packages/shared
- **Responsibility:** Business logic, store, API clients, hooks, validation schemas, types.  
- **Forbidden:** React components, Tailwind imports, DOM APIs.  
- **Status:** Already implemented cleanly.

### apps/web
- **Responsibility:** UI components built with Tailwind CSS and React.  
- **Scope:** Authentication forms, buttons, modals, layouts, dashboards.  
- **Relation with shared:** Imports only logic and types (`store`, `api`, `utils`, `validation`).  

### apps/mobile (future)
- **Responsibility:** Own UI built with React Native (`TouchableOpacity`, `StyleSheet`, `TextInput`, etc.).  
- **Scope:** Replicates the UX patterns of the web app but using native components.  
- **Relation with shared:** Reuses exactly the same business logic, APIs, store, and validation.  

---

## Why Not Use `ui-primitives`?
We evaluated creating a `ui-primitives` package (contracts for UI components) with `ui-web` and `ui-native` implementations.  
Although this is a valid approach in some architectures, we decided **not** to adopt it for NEXIA right now because:  

1. **Team Size** → The project is currently developed by a single frontend developer (plus backend). Managing three UI packages would add unnecessary complexity and slow down feature delivery.  
2. **Simplicity** → Each platform can own its own UI. This is a common and professional approach in many production systems.  
3. **Scalability** → The real cross-platform layer is in `shared`. That’s what guarantees logic consistency across web and mobile.  
4. **Future Flexibility** → If later a design system abstraction (`ui-primitives`) becomes necessary (e.g. multiple web apps or design tokens shared across platforms), it can still be added. Nothing in the current architecture blocks that move.  

---

## Future Development (Mobile App)
When the mobile app is implemented:  
- **Reused directly from `shared`:** Redux store, RTK Query APIs, validation schemas, types, utils.  
- **New in RN:** UI layer implemented with React Native components.  
- **Testing:** Shared logic tests will remain valid; UI will require its own test suite (Jest + React Native Testing Library).  

---

## Expected Result
- `packages/shared` → Only business logic and type definitions.  
- `apps/web` → Tailwind-based UI.  
- `apps/mobile` → React Native UI (future).  

This structure eliminates technical debt by ensuring that the **shared logic remains platform-agnostic**, while each platform develops its UI in a way that feels natural and professional for its ecosystem.  

---

**Last Updated:** September 19, 2025  
**Maintainer:** Nelson Valero (Frontend Lead Developer)  
