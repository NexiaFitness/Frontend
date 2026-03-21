/**
 * ErrorBoundary.tsx — Captura errores en componentes hijos y muestra fallback UI.
 *
 * Contexto: Envuelve rutas lazy para evitar que un error en un chunk cargado dinámicamente
 * rompa toda la aplicación. Usa componentDidCatch y getDerivedStateFromError (class component).
 *
 * Notas de mantenimiento: No usar librerías externas. Fallback debe ser accesible y permitir
 * recuperación. "Volver al inicio" usa location.assign("/") para recargar y limpiar el estado
 * del boundary (un <Link> no resetea hasError y la pantalla de error seguía visible).
 *
 * @author Frontend Team
 * @since v5.x
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/buttons";

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
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.assign("/");
            }}
          >
            Volver al inicio
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
