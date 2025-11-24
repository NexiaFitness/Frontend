# Plan de Implementación: Sistema Completo de Tests Físicos

**Fecha:** 2025-11-20  
**Estado:** Pendiente de implementación  
**Prioridad:** Media-Alta

---

## Resumen Ejecutivo

Actualmente el sistema de Tests Físicos muestra resultados por cliente en la pestaña "Tests" del detalle del cliente, pero faltan dos vistas clave:

1. **Catálogo de Tests del Entrenador** (global) - Para gestionar definiciones de tests
2. **Historial Completo de Resultados** (por cliente) - Para gestionar todos los resultados

Este plan detalla cómo implementar estas vistas aprovechando los endpoints disponibles que aún no se están usando.

---

## 1. Catálogo de Tests del Entrenador (Vista Global)

### Objetivo
Permitir al entrenador gestionar su biblioteca de tests físicos (definiciones) que estarán disponibles para todos sus clientes.

### Ubicación
- **Ruta:** `/dashboard/tests/catalog`
- **Acceso:** 
  - Nuevo item en el side menu del trainer: "Tests" (junto a "Planes de entrenamiento", "Ejercicios", etc.)
  - Botón en Quick Actions del dashboard: "Gestionar Tests" → lleva a esta vista
  - Botón "Catálogo de Tests" en la pestaña Tests del cliente (para crear/editar definiciones)

### Endpoints a Usar

| Método | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/api/v1/physical-tests/` | Listar todas las definiciones de tests (con filtros: categoría, estándar/personalizado) |
| `POST` | `/api/v1/physical-tests/` | Crear nueva definición de test personalizado |
| `GET` | `/api/v1/physical-tests/{test_id}` | Obtener detalles de un test para editar |
| `PUT` | `/api/v1/physical-tests/{test_id}` | Actualizar definición de test |
| `DELETE` | `/api/v1/physical-tests/{test_id}` | Eliminar test (solo si no tiene resultados asociados) |

### UX/UI Propuesta

#### Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│  Catálogo de Tests Físicos                             │
│  [Filtros: Categoría ▼] [Búsqueda...] [+ Crear Test]  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tabla de Tests                                  │  │
│  │  ┌──────┬──────────┬─────────┬────────┬────────┐│  │
│  │  │ Nombre│Categoría│Unidad  │Tipo    │Acciones││  │
│  │  ├──────┼──────────┼─────────┼────────┼────────┤│  │
│  │  │Sentadilla│Fuerza│kg      │Estándar│[Editar]││  │
│  │  │1RM     │        │        │        │[Borrar]││  │
│  │  ├──────┼──────────┼─────────┼────────┼────────┤│  │
│  │  │Test    │Potencia│W       │Personal│[Editar]││  │
│  │  │Custom  │        │        │        │[Borrar]││  │
│  │  └──────┴──────────┴─────────┴────────┴────────┘│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Componentes Necesarios
- **Tabla de Tests** (similar a `ExerciseList.tsx`)
  - Columnas: Nombre, Categoría, Unidad, Tipo (Estándar/Personalizado), Acciones
  - Filtros: Categoría (dropdown), Búsqueda por nombre
  - Paginación si hay muchos tests
- **Formulario Crear/Editar Test** (drawer lateral o modal grande)
  - Campos: nombre, categoría, unidad, descripción (opcional)
  - Validación: nombre único, categoría requerida
  - Botón "Usar en Cliente" → redirige a `CreateTestResult` con ese test preseleccionado

#### Flujos de Usuario
1. **Crear Test Personalizado:**
   - Click en "+ Crear Test" → Abre drawer con formulario
   - Al guardar → Test aparece en la tabla y queda disponible para todos los clientes
   - Opción: "Usar ahora" → redirige a seleccionar cliente y crear resultado

2. **Editar Test:**
   - Click en "Editar" → Abre drawer con datos precargados
   - Solo se puede editar si no tiene resultados asociados (o mostrar warning)
   - Guardar → Actualiza la definición

3. **Eliminar Test:**
   - Click en "Borrar" → Modal de confirmación
   - Solo permite borrar si no tiene resultados (validar en backend)
   - Si tiene resultados → Mostrar mensaje: "No se puede eliminar. Tiene X resultados asociados"

---

## 2. Historial Completo de Resultados (Por Cliente)

### Objetivo
Permitir al entrenador ver y gestionar todos los resultados de tests de un cliente específico en una vista tabular completa.

### Ubicación
- **Ruta:** `/dashboard/clients/:clientId/tests/history` (o como sub-tab dentro de la pestaña Tests)
- **Acceso:**
  - Botón "Ver Historial Completo" en la pestaña Tests del cliente
  - Link desde las cards de "Latest Tests" → "Ver todos los resultados"

### Endpoints a Usar

| Método | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/api/v1/physical-tests/results?client_id={id}` | Listar todos los resultados del cliente (con filtros: categoría, test_id, fecha desde/hasta) |
| `GET` | `/api/v1/physical-tests/results/{result_id}` | Obtener detalles completos de un resultado específico |
| `GET` | `/api/v1/physical-tests/results/{result_id}/progress` | Obtener métricas de progreso vs baseline |
| `PUT` | `/api/v1/physical-tests/results/{result_id}` | Actualizar resultado (editar valor, notas, etc.) |
| `DELETE` | `/api/v1/physical-tests/results/{result_id}` | Eliminar resultado |
| `GET` | `/api/v1/physical-tests/results/test/{test_id}/client/{client_id}` | Obtener progresión completa de un test específico (para gráfico individual) |

### UX/UI Propuesta

#### Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│  Historial de Tests - [Nombre Cliente]                   │
│  [Filtros: Categoría ▼] [Test ▼] [Fecha desde/hasta]   │
│  [+ Añadir Test] [Exportar CSV]                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tabla de Resultados                              │  │
│  │  ┌──────┬──────┬──────┬──────┬──────┬──────────┐│  │
│  │  │Fecha │Test  │Valor │Unidad│% Base│Acciones  ││  │
│  │  ├──────┼──────┼──────┼──────┼──────┼──────────┤│  │
│  │  │07 nov│Sentad│96.27 │kg    │-22.3%│[Ver][Ed] ││  │
│  │  │      │illa  │      │      │      │[Borrar]  ││  │
│  │  │      │1RM   │      │      │      │          ││  │
│  │  ├──────┼──────┼──────┼──────┼──────┼──────────┤│  │
│  │  │07 oct│Press │115.2 │kg    │+12.2%│[Ver][Ed] ││  │
│  │  │      │Banca │      │      │      │[Borrar]  ││  │
│  │  └──────┴──────┴──────┴──────┴──────┴──────────┘│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Componentes Necesarios
- **Tabla de Resultados** (similar a otras tablas del sistema)
  - Columnas: Fecha, Test, Valor, Unidad, % vs Baseline, Acciones
  - Filtros: Categoría, Test específico, Rango de fechas
  - Ordenamiento: Por fecha (más reciente primero) o por test
  - Badge de color en "% vs Baseline" (verde si positivo, rojo si negativo)
- **Vista Detalle de Resultado** (drawer o página completa)
  - Muestra todos los campos: fecha, test, valor, unidad, surface, condiciones, notas
  - Badge con progreso vs baseline (usando `/progress` endpoint)
  - Botones: Editar, Eliminar, Ver Progresión (gráfico individual)
- **Gráfico Individual de Test** (opcional, en vista detalle)
  - Usa `GET /physical-tests/results/test/{test_id}/client/{client_id}`
  - Muestra línea de progresión solo de ese test específico

#### Flujos de Usuario
1. **Ver Historial:**
   - Click en "Ver Historial Completo" → Abre tabla con todos los resultados
   - Filtros permiten buscar por categoría, test específico, rango de fechas
   - Click en fila → Abre vista detalle

2. **Editar Resultado:**
   - Click en "Editar" → Abre formulario (reutiliza `CreateTestResult` en modo edición)
   - Permite cambiar: valor, fecha, notas, surface, condiciones
   - Guardar → Actualiza el resultado y refresca la tabla

3. **Eliminar Resultado:**
   - Click en "Borrar" → Modal de confirmación
   - Eliminar → Resultado desaparece de la tabla y del summary

4. **Ver Progresión Individual:**
   - Click en "Ver Progresión" (en vista detalle) → Muestra gráfico de línea solo de ese test
   - Útil para analizar tendencia de un test específico a lo largo del tiempo

---

## 3. Integración con Vistas Existentes

### Pestaña Tests del Cliente (Actual)
**Mantener:**
- Tabs por categoría (Fuerza, Potencia, etc.)
- Cards de "Latest Tests"
- Gráfico de progresión (múltiples tests)
- Radar Chart (Physical Qualities Profile)

**Añadir:**
- Botón "Ver Historial Completo" → Lleva a la nueva vista de historial
- Botón "Catálogo de Tests" → Lleva a la vista global del catálogo
- Botón "+ Añadir Test" → Sigue llevando a `CreateTestResult` (sin cambios)

### Dashboard del Trainer
**Añadir en Quick Actions:**
- Nueva card: "Gestionar Tests"
  - Icono: gráfico de barras o test tube
  - Texto: "Catálogo de Tests"
  - Descripción: "Gestiona tus tests personalizados"
  - Acción: Navega a `/dashboard/tests/catalog`

**Añadir en Side Menu:**
- Nuevo item: "Tests" (entre "Planes de entrenamiento" y "Ejercicios")
  - Submenu opcional: "Catálogo" → `/dashboard/tests/catalog`

---

## 4. Flujo Completo de Navegación

```
Dashboard Trainer
  ├─ Quick Actions → "Gestionar Tests" → Catálogo Global
  └─ Side Menu → "Tests" → Catálogo Global

Catálogo Global (/dashboard/tests/catalog)
  ├─ Listar todos los tests (estándar + personalizados)
  ├─ Crear test personalizado
  ├─ Editar test
  ├─ Eliminar test
  └─ "Usar en Cliente" → Seleccionar cliente → CreateTestResult

Cliente Detail → Tab "Tests"
  ├─ Vista Resumen (actual)
  │   ├─ Tabs por categoría
  │   ├─ Cards latest tests
  │   ├─ Gráfico progresión
  │   └─ Radar chart
  ├─ Botón "Ver Historial Completo" → Historial Tabular
  ├─ Botón "Catálogo de Tests" → Catálogo Global
  └─ Botón "+ Añadir Test" → CreateTestResult

Historial Tabular (/dashboard/clients/:id/tests/history)
  ├─ Tabla con todos los resultados
  ├─ Filtros (categoría, test, fechas)
  ├─ Click en resultado → Vista Detalle
  └─ Acciones: Editar, Eliminar, Ver Progresión

Vista Detalle Resultado
  ├─ Todos los campos del resultado
  ├─ Badge progreso vs baseline
  ├─ Gráfico individual (opcional)
  └─ Botones: Editar, Eliminar
```

---

## 5. Endpoints Actualmente No Usados (A Aprovechar)

### Definiciones de Tests (Catálogo)
- ✅ `POST /api/v1/physical-tests/` - Crear test personalizado
- ✅ `GET /api/v1/physical-tests/{test_id}` - Obtener test para editar
- ✅ `PUT /api/v1/physical-tests/{test_id}` - Actualizar test
- ✅ `DELETE /api/v1/physical-tests/{test_id}` - Eliminar test

### Resultados de Tests (Historial)
- ✅ `GET /api/v1/physical-tests/results` - Listar todos (con filtros)
- ✅ `GET /api/v1/physical-tests/results/{result_id}` - Detalle de resultado
- ✅ `GET /api/v1/physical-tests/results/{result_id}/progress` - Progreso vs baseline
- ✅ `PUT /api/v1/physical-tests/results/{result_id}` - Editar resultado
- ✅ `DELETE /api/v1/physical-tests/results/{result_id}` - Eliminar resultado
- ✅ `GET /api/v1/physical-tests/results/test/{test_id}/client/{client_id}` - Progresión individual

**Total:** 10 endpoints nuevos a integrar

---

## 6. Priorización de Implementación

### Fase 1: Catálogo de Tests (Alta Prioridad)
**Razón:** Resuelve el problema del botón "Crear Test Personalizado" que actualmente no tiene funcionalidad real.

**Tareas:**
1. Crear ruta `/dashboard/tests/catalog`
2. Crear componente `TestsCatalog.tsx` (similar a `ExerciseList.tsx`)
3. Implementar tabla con filtros
4. Implementar formulario crear/editar (drawer)
5. Conectar endpoints `GET/POST/PUT/DELETE /physical-tests/`
6. Añadir acceso en Quick Actions y Side Menu
7. Actualizar botón "Crear Test Personalizado" en `ClientTestingTab` → redirige a catálogo

**Estimación:** 3-4 días

### Fase 2: Historial Completo (Media Prioridad)
**Razón:** Mejora la gestión de resultados, permite editar/eliminar sin salir de la vista.

**Tareas:**
1. Crear ruta `/dashboard/clients/:id/tests/history` (o sub-tab)
2. Crear componente `TestsHistory.tsx` (tabla de resultados)
3. Implementar filtros (categoría, test, fechas)
4. Implementar vista detalle de resultado
5. Conectar endpoints `GET/PUT/DELETE /physical-tests/results/...`
6. Añadir botón "Ver Historial Completo" en `ClientTestingTab`
7. Opcional: Gráfico individual usando `/results/test/{id}/client/{id}`

**Estimación:** 2-3 días

### Fase 3: Mejoras y Pulido (Baja Prioridad)
- Exportar historial a CSV
- Gráfico individual en vista detalle
- Validaciones avanzadas (no borrar test con resultados)
- Breadcrumbs y navegación mejorada

**Estimación:** 1-2 días

---

## 7. Consideraciones Técnicas

### Componentes a Reutilizar
- `Table` component (si existe) o crear uno genérico
- `FormDrawer` o `Modal` para crear/editar
- `LoadingSpinner`, `Alert` (ya existen)
- `Button` component (ya existe)

### Nuevos Componentes a Crear
- `TestsCatalog.tsx` - Vista principal del catálogo
- `TestForm.tsx` - Formulario crear/editar test
- `TestsHistory.tsx` - Vista de historial por cliente
- `TestResultDetail.tsx` - Vista detalle de resultado
- `TestProgressChart.tsx` - Gráfico individual (opcional)

### Hooks a Crear/Actualizar
- `usePhysicalTests.ts` - Para catálogo (GET/POST/PUT/DELETE tests)
- `useTestResults.ts` - Para historial (GET/PUT/DELETE results)
- Actualizar `useClientTests.ts` si es necesario

### Rutas a Añadir en App.tsx
```typescript
// Catálogo global
<Route path="/dashboard/tests/catalog" element={<TestsCatalog />} />

// Historial por cliente
<Route path="/dashboard/clients/:id/tests/history" element={<TestsHistory />} />
```

---

## 8. Checklist de Implementación

### Catálogo de Tests
- [ ] Crear ruta `/dashboard/tests/catalog`
- [ ] Crear componente `TestsCatalog.tsx`
- [ ] Implementar tabla con filtros
- [ ] Implementar formulario crear/editar
- [ ] Conectar `GET /physical-tests/`
- [ ] Conectar `POST /physical-tests/`
- [ ] Conectar `GET /physical-tests/{id}`
- [ ] Conectar `PUT /physical-tests/{id}`
- [ ] Conectar `DELETE /physical-tests/{id}`
- [ ] Añadir acceso en Quick Actions
- [ ] Añadir item en Side Menu
- [ ] Actualizar botón "Crear Test Personalizado"

### Historial de Resultados
- [ ] Crear ruta `/dashboard/clients/:id/tests/history`
- [ ] Crear componente `TestsHistory.tsx`
- [ ] Implementar tabla con filtros
- [ ] Implementar vista detalle
- [ ] Conectar `GET /physical-tests/results?client_id={id}`
- [ ] Conectar `GET /physical-tests/results/{id}`
- [ ] Conectar `GET /physical-tests/results/{id}/progress`
- [ ] Conectar `PUT /physical-tests/results/{id}`
- [ ] Conectar `DELETE /physical-tests/results/{id}`
- [ ] Añadir botón "Ver Historial Completo" en `ClientTestingTab`
- [ ] Opcional: Gráfico individual

---

## 9. Notas Finales

- **Coherencia:** Este plan mantiene la separación clara entre "definiciones de tests" (global del trainer) y "resultados de tests" (específicos por cliente)
- **Reutilización:** Aprovecha componentes y patrones ya existentes (tablas, formularios, drawers)
- **Escalabilidad:** Las vistas son extensibles (fácil añadir más filtros, exportaciones, etc.)
- **UX Intuitiva:** Cada acción tiene una vista dedicada, no modales sobrecargados
- **Endpoints:** Aprovecha todos los endpoints disponibles que actualmente no se usan

---

**Documento creado:** 2025-11-20  
**Última actualización:** 2025-11-20  
**Autor:** Frontend Team

