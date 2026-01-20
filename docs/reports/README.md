# Reports Module - Documentación Completa

**Módulo:** Frontend - Generación de Reportes  
**Versión:** v5.1.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Rutas y Navegación](#rutas-y-navegación)
4. [Tipos TypeScript](#tipos-typescript)
5. [API y Endpoints](#api-y-endpoints)
6. [Componentes UI](#componentes-ui)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Flujos de Datos](#flujos-de-datos)
9. [Estado Actual](#estado-actual)

---

## 🎯 Visión General

El módulo **Reports** permite a los entrenadores generar reportes detallados:

- **Reportes de Progreso de Cliente** - Evolución física y entrenamiento
- **Reportes de Resumen de Entrenamiento** - Estadísticas agregadas
- **Múltiples Formatos** - JSON, PDF (futuro)

**Características principales:**
- ✅ Selección de tipo de reporte
- ✅ Filtros por cliente, fechas
- ✅ Múltiples formatos de salida
- ✅ Visualización de resultados
- ✅ Traducción completa al español

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/reports/
└── GenerateReports.tsx          # Página principal de generación
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\reports\GenerateReports.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── reports.ts                    # Tipos de Reports
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\reports.ts`

### API y Endpoints

```
packages/shared/src/api/
└── reportsApi.ts                 # API de Reports
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\reportsApi.ts`

### Hooks Personalizados

```
packages/shared/src/hooks/reports/
└── useGenerateReport.ts          # Hook para generar reportes
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\reports\useGenerateReport.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

```typescript
<Route
    path="/dashboard/reports/generate"
    element={
        <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
                <GenerateReports />
            </RoleProtectedRoute>
        </ProtectedRoute>
    }
/>
```

**Componente:** `GenerateReports.tsx`  
**Ruta completa:** `apps/web/src/pages/reports/GenerateReports.tsx`

---

## 📝 Tipos TypeScript

### ReportType

```typescript
export const REPORT_TYPE = {
    CLIENT_PROGRESS: "client_progress",
    TRAINING_SUMMARY: "training_summary",
} as const;

export type ReportType = (typeof REPORT_TYPE)[keyof typeof REPORT_TYPE];
```

### ReportFormat

```typescript
export const REPORT_FORMAT = {
    JSON: "json",
    PDF: "pdf",
} as const;

export type ReportFormat = (typeof REPORT_FORMAT)[keyof typeof REPORT_FORMAT];
```

### ReportFormData

```typescript
export interface ReportFormData {
    reportType: ReportType;
    clientId: number | null;
    trainerId: number | null;
    startDate: string | null;      // ISO date
    endDate: string | null;         // ISO date
    format: ReportFormat;
}
```

### ReportResponse

```typescript
export interface ReportResponse {
    report_id: string;
    data: Record<string, unknown> | null;
    format: ReportFormat;
    generated_at: string;           // ISO datetime
}
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/reportsApi.ts`

### Endpoints RTK Query

#### Generate Report
```typescript
const [generateReport, { isLoading }] = useGenerateReportMutation();

await generateReport({
    report_type: "client_progress",
    client_id: 123,
    trainer_id: 456,
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    format: "json",
});
```

**Backend:** `POST /reports/generate`  
**Retorna:** `ReportResponse`

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `POST /reports/generate` - Generar reporte

---

## 🎨 Componentes UI

### GenerateReports

**Ruta:** `apps/web/src/pages/reports/GenerateReports.tsx`

**Responsabilidades:**
- Formulario completo para generar reportes
- Selección de tipo de reporte
- Filtros por cliente, fechas
- Selección de formato
- Visualización de resultados

**Hooks utilizados:**
- `useGenerateReport()` - Generar reporte
- `useGetTrainerClientsQuery()` - Lista de clientes

**Campos del formulario:**
- Tipo de reporte* (obligatorio)
- Cliente (obligatorio para client_progress)
- Fecha inicio (opcional)
- Fecha fin (opcional)
- Formato* (obligatorio)

---

## 🎯 Hooks Personalizados

### useGenerateReport

**Ruta:** `packages/shared/src/hooks/reports/useGenerateReport.ts`

**Uso:**
```typescript
const {
    generateReport,
    isLoading,
    isError,
    error,
    trainerId,
} = useGenerateReport();

const result = await generateReport({
    reportType: REPORT_TYPE.CLIENT_PROGRESS,
    clientId: 123,
    trainerId: 456,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    format: REPORT_FORMAT.JSON,
});
```

---

## 🔄 Flujos de Datos

### Flujo: Generar Reporte

1. Usuario navega a `/dashboard/reports/generate`
2. Selecciona tipo de reporte (client_progress o training_summary)
3. Si es client_progress, selecciona cliente
4. Opcionalmente selecciona rango de fechas
5. Selecciona formato (JSON o PDF)
6. Click en "Generar Reporte"
7. Validación de campos obligatorios
8. `useGenerateReport()` envía `POST /reports/generate`
9. Backend genera reporte y retorna datos
10. Resultados se muestran en la UI
11. Usuario puede descargar o copiar datos

**Archivos involucrados:**
- `apps/web/src/pages/reports/GenerateReports.tsx` (UI)
- `packages/shared/src/hooks/reports/useGenerateReport.ts` (Lógica)
- `packages/shared/src/api/reportsApi.ts` (API)
- Backend: `POST /api/v1/reports/generate`

---

## ✅ Validaciones

### Validaciones de Formulario

**GenerateReports:**
- Tipo de reporte* (obligatorio)
- Cliente* (obligatorio si tipo es client_progress)
- Trainer ID* (obligatorio si tipo es training_summary)
- Fecha inicio (opcional, formato ISO date)
- Fecha fin (opcional, formato ISO date, debe ser posterior a inicio)
- Formato* (obligatorio, enum: json/pdf)

---

## 📊 Estado Actual

### ✅ Implementado (v5.1.0)

#### Generación de Reportes
- [x] Formulario completo de generación
- [x] Selección de tipo de reporte
- [x] Filtros por cliente y fechas
- [x] Selección de formato (JSON)
- [x] Visualización de resultados
- [x] Validaciones de campos
- [x] Manejo de errores
- [x] Traducción completa al español

### 🚧 Pendiente

- [ ] Formato PDF funcional
- [ ] Descarga directa de reportes
- [ ] Historial de reportes generados
- [ ] Plantillas de reportes personalizadas
- [ ] Programación de reportes automáticos

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Clients](../clients/README.md)
- [Training Plans](../trainingPlans/README.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Reports v5.1.0







