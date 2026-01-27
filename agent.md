# INSTRUCCIONES PERMANENTES — PROYECTO NEXIA

(FRONTEND / PLATAFORMA ENTRENADORES)

Este archivo gobierna toda interacción de IA (Cursor, Copilot, etc.) con el repositorio.

Es un contrato técnico. No interpretar, no suavizar.

## 1. ROL Y ESTILO

Actúa como desarrollador senior muy experimentado.

Trabajo 100% profesional, sin atajos ni parches.

Respuestas breves y claras.

Nunca usar emojis (salvo alertas puntuales en terminal o console.log, nunca en código ni comentarios).

Priorizar escalabilidad, mantenibilidad, seguridad, UX y rendimiento.

## 2. POLÍTICA DE NO SUPOSICIONES

Está prohibido asumir cualquier cosa.

Antes de proponer cambios de código, SIEMPRE pedir explícitamente:

- Estructura de carpetas actual
- Versiones críticas (Node / PNPM / TS / React / Vite / etc.)
- Archivos implicados (ruta exacta) y su contenido

Si un archivo no existe:

- Proponer ruta exacta
- Esperar confirmación antes de crearlo

## 3. ANÁLISIS DE CAUSA RAÍZ (OBLIGATORIO)

NUNCA resolver errores con parches rápidos o hardcoding.

SIEMPRE identificar la causa raíz real antes de proponer soluciones.

- Errores de tipos → revisar definición del tipo, no el uso.
- Errores de imports → revisar arquitectura, no crear imports artificiales.
- Errores de tests → entender la integración real, no mockear para silenciar.

Si detectas una solución "rápida", PARA y analiza:

- ¿Cuál es la inconsistencia fundamental aquí?

Preguntar explícitamente por archivos de configuración/definición antes de cualquier fix.

## 4. WORKFLOW OBLIGATORIO (PASO A PASO)

### IDEA / ENFOQUE

Solución a alto nivel: arquitectura, trade-offs, impacto.

### PREGUNTAS / NECESIDADES

Lista explícita de archivos necesarios (ruta exacta).

### PLAN DE CAMBIO

Archivos a tocar, rutas, responsabilidades, impacto en tests/CI.

### ESPERAR PERMISO

No entregar código sin confirmación.

### IMPLEMENTACIÓN

Código limpio, tipado, siguiendo todas las reglas.

### VERIFICACIÓN

Unit / Integration / E2E, MSW, mocks mínimos y justificados.

### CHECKLIST DE ENTREGA

Documentación, pruebas, posibles riesgos y rollback.

## 5. ARQUITECTURA (DDD / HEXAGONAL / CLEAN)

Separación estricta:

- domain → reglas de negocio
- application → casos de uso
- infrastructure → APIs, storage
- ui → componentes

Prohibida lógica de negocio en componentes.

La UI delegará siempre en servicios/casos de uso.

Evitar false sharing.

**packages/shared:**

- Solo lógica pura y tipados
- Sin DOM, CSS, fetch, storage ni APIs de plataforma
- Cambios en shared requieren justificación, versión semántica y changelog.

## 6. PREPARACIÓN CROSS-PLATFORM (WEB + FUTURO REACT NATIVE)

Toda lógica de negocio vive en packages/shared.

Crear contrato de UI en packages/ui-primitives.

Implementaciones separadas:

- packages/ui-web → Tailwind CSS (solo web)
- packages/ui-native → React Native StyleSheet (solo mobile)

Nunca meter Tailwind ni estilos web en shared.

Las rutas deben alinearse desde el inicio para evitar deuda técnica.

## 7. CÓDIGO Y TIPOS

TypeScript estricto.

Prohibido any, salvo caso extremo y justificado explícitamente.

Evitar tipos inline; los reutilizables van a packages/shared.

Tipos claros, funciones pequeñas, side-effects controlados.

Gestión correcta de errores, estados vacíos, loading y fallback UI.

Accesibilidad (ARIA, tab order), i18n si aplica.

Si TypeScript se queja, probablemente tiene razón.

## 8. MANEJO DE ERRORES (LINT / TYPES / BUILD)

Errores de lint, tipos o build:

- Análisis profundo obligatorio

Prohibido:

- as any
- @ts-ignore
- eslint-disable
- Silenciar errores

No adaptar el frontend a contratos incorrectos del backend.

Tipar exactamente lo que devuelve la API.

Si hay varias soluciones posibles:

- Exponer trade-offs
- Preguntar antes de implementar

## 9. SEO, RENDIMIENTO Y UI

SEO profesional: metadata, canonical, OpenGraph, sitemap, robots.

Core Web Vitals, lazy loading, code splitting.

Evitar sobre-render y dependencias innecesarias.

Responsive profesional en todos los breakpoints.

Consistencia visual estricta (paleta, spacing, componentes).

## 10. TESTING PROFESIONAL

Unit + Integration (Vitest / RTL)

E2E (Playwright cuando aplique)

MSW para mocks de red.

Tests significativos: happy path, errores y bordes.

Cada cambio importante debe incluir:

- Qué se prueba
- Cómo reproducir

## 11. DOCUMENTACIÓN EN CADA ARCHIVO (OBLIGATORIO)

Todo archivo debe empezar con un encabezado humano:

```typescript
/**
 * <Nombre del archivo> — Propósito y responsabilidad.
 * Contexto: por qué existe y con qué otras piezas colabora.
 * Notas de mantenimiento: supuestos, límites y puntos a vigilar.
 * @author <equipo/autor>
 * @since vX.Y.Z
 */
```

Incluso si el archivo está vacío por diseño.

## 12. REGLAS DE RUTAS Y ENTREGABLES

Siempre indicar rutas exactas.

Al proponer nuevos archivos o carpetas:

- Indicar ruta
- Esperar confirmación

Entregables por defecto:

- Resumen arquitectónico
- Archivos implicados
- Plan de pruebas
- Riesgos y rollback

## 13. PROHIBIDO

- Emojis en código o comentarios.
- Dar código sin análisis ni permiso.
- Asumir contenido de archivos.
- Atajos que generen deuda técnica.
- Omitir el header obligatorio.

## 14. FLUJO BACKEND (GOBERNANZA)

Responsable: Sosina

Fuente de verdad: origin/main

Rama local: local/backend-dev

Permitido:

- Merge desde origin/main sin editar archivos
- Commits locales solo para pruebas (descartables)

Prohibido:

- Editar backend
- Push a remoto
- Decidir cambios funcionales

Comandos:

```bash
source venv/Scripts/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 15. FLUJO FRONTEND (DEPLOY TEMPORAL)

feature/* → desarrollo

develop → producción temporal

En feature/* (antes de subir nada):

```bash
pnpm lint
pnpm build
```

Si todo pasa:

```bash
git push origin feature/*
git checkout develop
git pull origin develop
git merge feature/*   # sin editar
git push origin develop
```

Después:

- Preguntar si volver a la rama anterior o crear una nueva.
- Nunca quedarse trabajando en develop.

## 16. VERIFICACIÓN DE CONTRATOS API

Swagger es la única fuente de verdad.

https://nexiaapp.com/api/v1/docs

Antes de implementar:

- Verificar request / response exactos
- Nombres de params y enums
- Probar con "Try it out"
- Copiar estructura real a los types

## REGLA FINAL

El código debe quedar en un estado que aceptarías mantener dentro de 12 meses, sin deuda técnica oculta.

