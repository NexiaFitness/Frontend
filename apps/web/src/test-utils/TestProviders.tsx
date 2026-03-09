/**
 * TestProviders — Wrapper de testing con Redux y React Router.
 *
 * Contexto: permite renderizar componentes en tests con store limpio
 * y BrowserRouter. Se usa como wrapper en `render.tsx`.
 * Incluye ToastProvider para que componentes que usan useToast no fallen.
 *
 * Notas de mantenimiento:
 * - Usa createTestStore para aislamiento entre tests
 * - Si initialEntries está definido, usa MemoryRouter (para tests que requieren URL controlada)
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { createTestStore } from "./utils/store";
import type { RootState } from "@nexia/shared/store";
import { ToastProvider } from "@/components/ui/feedback";

interface TestProvidersProps extends PropsWithChildren {
    initialState?: Partial<RootState>;
    /** Si se define, usa MemoryRouter con esta URL inicial (para tests de estado en URL). */
    initialEntries?: string[];
}

export function TestProviders({ children, initialState, initialEntries }: TestProvidersProps) {
    const store = createTestStore(initialState);

    return (
        <Provider store={store}>
            {initialEntries ? (
                <MemoryRouter initialEntries={initialEntries}>
                    <ToastProvider>{children}</ToastProvider>
                </MemoryRouter>
            ) : (
                <BrowserRouter>
                    <ToastProvider>{children}</ToastProvider>
                </BrowserRouter>
            )}
        </Provider>
    );
}