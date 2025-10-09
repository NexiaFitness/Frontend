/**
 * index.ts — Punto de entrada para cálculos relacionados con clientes
 *
 * Contexto:
 * - Re-exporta funciones de cálculo específicas del dominio clientes.
 * - Permite imports cortos desde @shared/utils/calculations/clients.
 * - Parte del patrón global de utils: cada dominio tiene su propio index + uno raíz.
 *
 * Ejemplos:
 *   import { calculateBMI } from "@nexia/shared/utils/calculations/clients";
 *   import { calculateBMI } from "@nexia/shared/utils/calculations"; // vía root index
 *
 * @author Frontend
 * @since v2.2.0
 */

export * from "./calculations";
