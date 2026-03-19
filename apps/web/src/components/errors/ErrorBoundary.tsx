/**
 * ErrorBoundary.tsx — Captura errores en componentes hijos y muestra fallback UI.
 *
 * Contexto: Envuelve rutas lazy para evitar que un error en un chunk cargado dinámicamente
 * rompa toda la aplicación. Usa componentDidCatch y getDerivedStateFromError (class component).
 *
 * Notas de mantenimiento: No usar librerías externas. Fallback debe ser accesible y permitir
 * recuperación (ej. enlace a home o recargar).
 *
 * @author Frontend Team
 * @since v5.x
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive">Error al cargar la página</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Ha ocurrido un error inesperado. Por favor, intenta recargar o volver al inicio.
          </p>
          <Link
            to="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
