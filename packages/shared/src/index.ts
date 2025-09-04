/**
 * Punto de entrada del paquete shared
 * Reexporta APIs, store y tipos para ser usados desde otros paquetes
 *
 * @since v1.0.0
 */

// API
export * from "./api/authApi";
export * from "./api/baseApi";

// Store
export * from "./store/authSlice";
export * from "./store";

// Tipos
export * from "./types/auth";

// Config
export * from "./config/constants";
