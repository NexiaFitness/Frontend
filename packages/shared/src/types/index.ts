/**
 * index.ts — Exportaciones centralizadas de tipos TypeScript
 *
 * PROPÓSITO:
 * - Exportar todos los tipos del módulo shared para uso en otras partes de la aplicación
 * - Facilitar imports: `import { Type } from '@shared/types'`
 * - Mantener organización y evitar imports circulares
 *
 * CONTEXTO:
 * - Este archivo centraliza todas las exportaciones de tipos
 * - Los tipos también se exportan desde el index.ts principal del paquete
 *
 * NOTAS:
 * - Mantener orden alfabético para facilitar navegación
 * - Agregar nuevos tipos aquí cuando se creen nuevos archivos de tipos
 *
 * @author Frontend Team
 * @since v5.0.0
 */

// Account types
export * from "./account";

// Auth types
export * from "./auth";

// Charts types
export * from "./charts";

// Client types
export * from "./client";
export * from "./clientOnboarding";
export * from "./clientStats";

// Coherence types
export * from "./coherence";

// Dashboard types
export * from "./dashboard";

// Exercise types (Exercise Catalog completo)
export * from "./exercise";

// Forms types
export * from "./forms";

// Injuries types
export * from "./injuries";

// Metrics types
export * from "./metrics";
export * from "./metricsV2";

// Planning cargas (period-based) — Plan de cargas Fase 0
export * from "./planningCargas";

// Progress types
export * from "./progress";

// Reports types
export * from "./reports";

// Scheduling types
export * from "./scheduling";

// Session Programming types
export * from "./sessionProgramming";

// Testing types
export * from "./testing";

// Trainer types
export * from "./trainer";

// Training types
export * from "./training";
export * from "./trainingAnalytics";
export * from "./trainingRecommendations";
export * from "./sessionRecommendations";









