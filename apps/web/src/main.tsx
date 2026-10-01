/**
 * Entry point de la app web de NEXIA
 * Ahora incluye BrowserRouter para habilitar rutas
 * 
 * @updated v4.3.3 - Added React Router v7 future flags to eliminate warnings
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "@nexia/shared";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

// Inicializar storage ANTES de crear el store
import { initStorage } from '@nexia/shared/storage/IStorage';
import { webStorage } from './storage/webStorage';
import { registerPreloadErrorRecovery } from "./lib/lazyWithRetry";
import {
  registerClientErrorReporting,
  reportClientError,
} from "./lib/clientErrorReporter";

initStorage(webStorage);

registerClientErrorReporting();
// Recarga única si un chunk lazy ya no existe tras un despliegue (ver lib/lazyWithRetry.ts)
registerPreloadErrorRecovery({
  onFallback: () => {
    reportClientError({
      kind: "chunk_load",
      message: "vite:preloadError without reload recovery",
    });
  },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);