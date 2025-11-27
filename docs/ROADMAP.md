# NEXIA Roadmap

## Overview
This roadmap outlines the planned development phases of the NEXIA platform.  
The strategy ensures incremental delivery of value to administrators, trainers, and athletes while maintaining scalability, testing coverage, and clean architecture.

---

## Phase 1 – Dashboard Core (MVP Base)
- Complete authentication flows: login, register, logout, reset password.  
- Role-based access: Admin, Trainer, Athlete.  
- Initial dashboards for each role with protected routes.  
- Comprehensive testing of auth flows (>90% coverage).  

---

## Phase 2 – Client Management
- CRUD operations for clients (create, edit, deactivate).  
- Profile management with basic data and initial metrics.  
- Role-based views (Trainer sees only their clients).  
- Internal notifications for new clients, deactivations, or updates.  

---

## Phase 3 – Training Plans
- Training plan creation by trainers.  
- Reusable templates and assignment to athletes.  
- Validation of load and progression control.  
- Workflow and form testing.  

---

## Phase 4 – Sessions & Execution
- Session logging: attendance, sets, repetitions.  
- Daily/weekly tracking of training execution.  
- Initial integration with wearables (metrics ingestion).  
- Basic progress reports for athletes and trainers.  

---

## Phase 5 – Analytics & Reporting
- Performance dashboards for athletes and trainers.  
- Downloadable reports (PDF/Excel) with metrics.  
- Smart alerts: inactivity, overload, lack of progress.  
- Initial AI modules: plan suggestions and auto-adjustments.  

---

## Phase 6 – Mobile + PWA
- Mobile app (React Native) integrated with `packages/shared` for business logic.
- React Native UI layer implemented independently.  
- Offline mode with data synchronization.  
- Push notifications for trainers and athletes.  
- Full mobile-first optimization.  

---

## Guiding Principles
- Each phase must deliver **complete functional value** for at least one user role (Admin, Trainer, Athlete).  
- Testing and CI/CD are mandatory in every phase.  
- Architecture documentation must be kept up to date with every iteration.  
- Backend modularization and microservices will be considered when traffic and complexity increase.  

---

**Last Updated**: January 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), CTO, Backend Team
