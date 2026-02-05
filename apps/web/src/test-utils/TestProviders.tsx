/**
 * TestProviders — Wrapper de testing con Redux y React Router.
 *
 * Contexto: permite renderizar componentes en tests con store limpio
 * y BrowserRouter. Se usa como wrapper en `render.tsx`.
 * Incluye ToastProvider para que componentes que usan useToast no fallen.
 *
 * Notas de mantenimiento:
 * - Usa createTestStore para aislamiento entre tests
 * - Si se añaden providers globales (Theme, i18n), integrarlos aquí
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createTestStore } from "./utils/store";
import type { RootState } from "@nexia/shared/store";
import { ToastProvider } from "@/components/ui/feedback";

interface TestProvidersProps extends PropsWithChildren {
    initialState?: Partial<RootState>;
}

export function TestProviders({ children, initialState }: TestProvidersProps) {
    const store = createTestStore(initialState);

    return (
        <Provider store={store}>
            <BrowserRouter>
                <ToastProvider>{children}</ToastProvider>
            </BrowserRouter>
        </Provider>
    );
}