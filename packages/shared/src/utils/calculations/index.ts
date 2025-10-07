/**
 * index.ts — Punto de entrada raíz para utilidades de cálculo
 *
 * Contexto:
 * - Re-exporta cálculos organizados por dominio (clients, plans, sessions, etc.).
 * - Permite imports cortos desde @shared/utils/calculations sin tener que
 *   especificar el subdirectorio.
 *
 * Ejemplo de uso:
 *   import { calculateBMI, classifyBMI } from "@shared/utils/calculations";
 *
 * Añadir aquí nuevos dominios a medida que se creen:
 *   export * from "./plans";
 *   export * from "./sessions";
 *
 * @author Frontend
 * @since v2.2.0
 */

// Cálculos relacionados con clientes
export * from "./clients";
