# Documentación Scheduling — Sesiones agendadas

Esta carpeta agrupa la documentación de diseño y refactorización del flujo de **programación de sesiones** (calendario, crear/editar sesión agendada).

---

## Documentos

| Archivo | Contenido |
|---------|-----------|
| **PLAN_REFACTORIZACION_SCHEDULING_SESSION.md** | Plan de refactor: paso de **modal** a **vista dedicada** para crear sesión agendada. Incluye: problemas del modal (UX, page_size 100 vs 50, accesibilidad, E2E frágil), diseño de la ruta `/dashboard/scheduling/new`, selección de cliente con listado paginado y búsqueda, fases de ejecución (crear vista → migrar navegación → eliminar modal → ajustar E2E), impacto en E2E y recomendaciones. **Estado:** plan ejecutado; la vista dedicada está en uso. |

---

## Resumen del diseño actual

- **Crear sesión agendada:** Vista dedicada en `/dashboard/scheduling/new` (query `date`, opcional `templateId`). Listado de clientes paginado con búsqueda por email/nombre; sin modal.
- **Editar:** Vista dedicada en `/dashboard/scheduling/:id/edit`.
- **Calendario:** `/dashboard/scheduling`; clic en día lleva a `/dashboard/scheduling/new?date=YYYY-MM-DD`.

Detalles de flujo, contratos API y fases en el plan dentro de esta carpeta.
