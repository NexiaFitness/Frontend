# Testing Framework Documentation - NEXIA

> **Nota:** Este documento describe el **framework de testing** (Vitest, MSW, cómo escribir tests).  
> Para documentación del **módulo de Testing** (pruebas físicas de clientes), ver [testing/](../testing/README.md)

Esta carpeta contiene toda la documentación relacionada con el framework de testing en el proyecto NEXIA.

## 📚 Documentos Disponibles

### 1. [TESTING.md](./TESTING.md)
**Documentación completa del framework de testing**
- Stack tecnológico (Vitest, React Testing Library, MSW)
- Estructura de tests y organización de archivos
- Fixtures y handlers MSW (completos y disponibles)
- Mocks de React Router y Redux
- Utilidades de testing (render, setup, providers)
- Cobertura de código y configuración
- Ejemplos prácticos (componentes, integración, Redux)
- Estado actual y cobertura (tests implementados, problemas conocidos)
- Qué falta por implementar
- Mejores prácticas
- Arquitectura y mejoras futuras

### 2. [TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md)
**Guía rápida de arquitectura y patrones**
- Filosofía core (MSW-First, Integration over Unit)
- Patrones de estructura de tests
- Estrategia de handlers MSW (Hybrid Approach)
- Patrones comunes (form testing, error testing, navigation)
- Quick reference (queries, mocks, async patterns)
- Mejores prácticas resumidas

## 🎯 ¿Qué Documento Leer?

- **Empezando con tests:** Lee [TESTING.md](./TESTING.md) para entender el framework completo, estructura, fixtures, handlers, y estado actual
- **Escribiendo tests:** Lee [TESTING_ARCHITECTURE.md](./TESTING_ARCHITECTURE.md) para patrones rápidos, mejores prácticas y guía de referencia

---

**Última actualización:** 2025-01-XX  
**Mantenido por:** Frontend Team - NEXIA Fitness

