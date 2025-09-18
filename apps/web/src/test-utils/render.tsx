/**
 * Render Utility - Renderiza componentes con Providers reales
 * Incluye Redux store completo y React Router.
 * Para tests de integración preferimos usar store real en lugar de mocks.
 *
 * @since v1.0.0
 */

import React, { PropsWithChildren } from "react"
import { render as rtlRender } from "@testing-library/react"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import { store } from "@shared/store"  // Store real del proyecto

function TestProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

export function render(ui: React.ReactElement, options?: any) {
  return rtlRender(ui, { wrapper: TestProviders, ...options })
}

export * from "@testing-library/react"
