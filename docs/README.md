# Documentación del Frontend - NEXIA Fitness

**Versión:** v5.5.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice General

Esta documentación está organizada por módulos principales del frontend. Cada módulo tiene su propia carpeta con documentación completa.

### Módulos Principales

1. **[Auth](./auth/README.md)** - Autenticación y autorización
   - Login, registro, verificación de email
   - Recuperación de contraseña
   - Protección de rutas

2. **[Dashboard](./dashboard/README.md)** - Dashboards por rol
   - Trainer Dashboard con KPIs
   - Admin Dashboard
   - Athlete Dashboard

3. **[Clients](./clients/README.md)** - Gestión de clientes
   - Onboarding de clientes
   - Edición de clientes
   - Progreso y métricas
   - Gráficos de evolución

4. **[Training Plans](./trainingPlans/README.md)** - Planificación de entrenamiento
   - Macrociclos, mesociclos, microciclos
   - Milestones (hitos)
   - Gráficos de volumen/intensidad

5. **[Exercises](./exercises/README.md)** - Base de datos de ejercicios
   - Catálogo de ejercicios
   - Filtros por músculo, equipamiento, nivel
   - Estadísticas

6. **[Sessions](./sessions/README.md)** - Programación y agendamiento
   - Scheduling (citas agendadas)
   - Session Programming (sesiones de entrenamiento)
   - Plantillas de sesiones

7. **[Account](./account/README.md)** - Gestión de cuenta
   - Perfil de usuario
   - Cambio de contraseña
   - Eliminación de cuenta

8. **[Reports](./reports/README.md)** - Generación de reportes
   - Reportes de progreso
   - Reportes de entrenamiento
   - Múltiples formatos

9. **[Testing](./testing/README.md)** - Módulo de Pruebas Físicas
   - Crear resultados de tests físicos
   - Tests estándar y personalizados
   - Historial de pruebas de clientes
   - Historial de pruebas

10. **[Home](./home/README.md)** - Landing page
    - Hero section
    - Features, FAQ, Contact

11. **[UI Components](./ui/README.md)** - Componentes compartidos
    - Buttons, Forms, Cards
    - Feedback, Layout
    - Utilidades

---

## 📚 Documentación General

### Arquitectura y Guías

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura general del proyecto
- **[CROSS_PLATFORM_GUIDE.md](./CROSS_PLATFORM_GUIDE.md)** - Guía de arquitectura cross-platform
- **[CROSS_PLATFORM_ROLE_ARCHITECTURE.md](./CROSS_PLATFORM_ROLE_ARCHITECTURE.md)** - Arquitectura de roles
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Guía de contribución
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de despliegue

### Backend

- **[backend/API_ENDPOINTS.md](./backend/API_ENDPOINTS.md)** - Auditoría completa de endpoints backend vs frontend
  - Estado de implementación por módulo
  - Endpoints faltantes
  - Cobertura y recomendaciones

### Testing Framework

- **[tests/](./tests/)** - Documentación del framework de testing (Vitest, MSW, cómo escribir tests)
  - [TESTING.md](./tests/TESTING.md) - Guía general completa
  - [TESTING_ARCHITECTURE.md](./tests/TESTING_ARCHITECTURE.md) - Arquitectura y patrones

---

## 🗂️ Estructura de Documentación

```
frontend/docs/
├── README.md                    # Este archivo (índice general)
│
├── auth/                        # Autenticación
│   └── README.md
│
├── dashboard/                   # Dashboards
│   └── README.md
│
├── clients/                     # Clientes
│   ├── README.md
│   ├── client-onboarding.md
│   ├── client-edit.md
│   └── client-progress.md
│
├── trainingPlans/               # Planes de entrenamiento
│   ├── README.md
│   ├── training-plans.md
│   ├── macrocycles.md
│   ├── mesocycles.md
│   ├── microcycles.md
│   └── milestones.md
│
├── exercises/                   # Ejercicios
│   └── README.md
│
├── sessions/                    # Sesiones
│   └── README.md
│
├── account/                     # Cuenta
│   └── README.md
│
├── reports/                     # Reportes
│   └── README.md
│
├── testing/                     # Módulo de Pruebas Físicas (funcionalidad de negocio)
│   └── README.md
│
├── home/                        # Landing page
│   └── README.md
│
├── ui/                          # Componentes UI
│   └── README.md
│
└── tests/                       # Framework de Testing (Vitest, MSW, desarrollo)
    ├── README.md
    ├── TESTING.md
    └── TESTING_ARCHITECTURE.md
```

---

## 🚀 Inicio Rápido

### Para Desarrolladores Nuevos

1. Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura del proyecto
2. Revisa [CROSS_PLATFORM_GUIDE.md](./CROSS_PLATFORM_GUIDE.md) para entender la arquitectura
3. Consulta el README del módulo específico que vas a trabajar

### Para Trabajar en un Módulo

1. Ve a la carpeta del módulo (ej: `clients/`)
2. Lee el `README.md` principal del módulo
3. Consulta los documentos específicos si existen (ej: `client-onboarding.md`)

### Para Agregar Documentación

1. Crea o actualiza el `README.md` en la carpeta del módulo
2. Sigue el formato estándar usado en otros módulos
3. Incluye: visión general, estructura de archivos, rutas, tipos, API, componentes, hooks, flujos, validaciones, estado actual

---

## 📝 Convenciones de Documentación

### Estructura Estándar de README

Cada módulo debe tener un `README.md` con:

1. **Visión General** - Qué hace el módulo
2. **Estructura de Archivos** - Organización del código
3. **Rutas y Navegación** - Rutas de React Router
4. **Tipos TypeScript** - Interfaces y tipos principales
5. **API y Endpoints** - Endpoints RTK Query y backend
6. **Componentes UI** - Componentes principales
7. **Hooks Personalizados** - Hooks de negocio
8. **Flujos de Datos** - Flujos principales paso a paso
9. **Validaciones** - Reglas de validación
10. **Estado Actual** - Qué está implementado y qué falta

### Formato

- Usa Markdown estándar
- Incluye rutas completas de archivos cuando sea relevante
- Usa bloques de código con sintaxis highlighting
- Mantén ejemplos de código actualizados
- Incluye referencias a otros módulos cuando sea necesario

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Repositorio
- **Frontend:** Monorepo con `apps/web` y `packages/shared`
- **Backend:** FastAPI (repositorio separado)

---

## 📊 Estado de Documentación

### ✅ Completado

- [x] Auth - Documentación completa
- [x] Dashboard - Documentación completa
- [x] Clients - Documentación completa
- [x] Training Plans - Documentación completa
- [x] Exercises - Documentación completa
- [x] Sessions - Documentación completa
- [x] Account - Documentación completa
- [x] Reports - Documentación completa
- [x] Testing - Documentación completa
- [x] Home - Documentación completa
- [x] UI Components - Documentación completa

### 🚧 Pendiente

- [ ] Actualizar documentación cuando se agreguen nuevas features
- [ ] Agregar diagramas de flujo visuales
- [ ] Agregar ejemplos de código más detallados

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0

