/**
 * Render Utility — Utilidad para renderizar componentes en tests.
 *
 * Contexto: envuelve Testing Library con TestProviders (Redux + Router).
 * Se usa en todos los tests de integración para evitar duplicación.
 *
 * Notas de mantenimiento:
 * - Este archivo no debe exportar componentes React directamente,
 *   solo helpers y re-exports de testing.
 * - Mantener API estable: `render`, `screen`, `fireEvent`, `waitFor`.
 * @since v1.0.0
 */

import React from "react"
import {
  render as rtlRender,
  RenderOptions,
  RenderResult,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react"
import { TestProviders } from "./TestProviders"

// Función render personalizada con wrapper de Providers
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return rtlRender(ui, { wrapper: TestProviders, ...options })
}

// Re-exportar utilidades comunes de Testing Library
export { screen, fireEvent, waitFor }
