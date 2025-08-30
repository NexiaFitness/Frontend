/**
 * Punto de entrada principal de la app web de NEXIA
 * Aquí conectamos Redux con React usando el Provider
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "@shared/store";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
