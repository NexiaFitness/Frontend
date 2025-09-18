/**
 * TestProviders — Wrapper de testing con Redux y React Router.
 *
 * Contexto: permite renderizar componentes en tests con el store real
 * y un BrowserRouter. Se usa como wrapper en `render.tsx`.
 *
 * Notas de mantenimiento:
 * - Este archivo debe permanecer en test-utils, nunca en shared.
 * - Si en el futuro se añaden más providers globales (Theme, i18n, etc.),
 *   deben integrarse aquí.
 * @since v1.0.1
 */

import { PropsWithChildren } from "react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { store } from "@shared/store" // Store real del proyecto

export function TestProviders({ children }: PropsWithChildren) {
    return (
        <Provider store={store}>
            <BrowserRouter>{children}</BrowserRouter>
        </Provider>
    )
}
