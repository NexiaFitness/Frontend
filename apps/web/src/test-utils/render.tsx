/**
 * Render Utility — Utilidad para renderizar componentes en tests.
 *
 * Contexto: envuelve Testing Library con TestProviders (Redux + Router).
 * Se usa en todos los tests de integración para evitar duplicación.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import {
    render as rtlRender,
    RenderOptions,
    RenderResult,
    screen,
    fireEvent,
    waitFor,
} from "@testing-library/react";
import { TestProviders } from "./TestProviders";
import type { RootState } from "@nexia/shared/store";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    initialState?: Partial<RootState>;
    /** URL inicial para MemoryRouter (tests de estado en URL). Acepta string o { pathname, search }. */
    initialEntries?: Array<string | { pathname: string; search?: string }>;
}

export function render(
    ui: React.ReactElement,
    options: CustomRenderOptions = {}
): RenderResult {
    const { initialState, initialEntries, ...renderOptions } = options;
    
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestProviders initialState={initialState} initialEntries={initialEntries}>
            {children}
        </TestProviders>
    );
    
    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-exportar utilidades comunes
export { screen, fireEvent, waitFor };