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
import { isChunkLoadError } from "@/lib/lazyWithRetry";
import { reportReactBoundaryError } from "@/lib/clientErrorReporter";

export type ErrorBoundaryVariant = "root" | "route";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Cambia al navegar — reinicia el boundary (B9). */
  resetKey?: string;
  variant?: ErrorBoundaryVariant;
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

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey &&
      this.props.resetKey != null
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    reportReactBoundaryError(error, errorInfo.componentStack ?? "");
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const isRoute = this.props.variant === "route";
      const staleChunk = this.state.error != null && isChunkLoadError(this.state.error);
      return (
        <div
          className={
            isRoute
              ? "flex min-h-[40vh] flex-col items-center justify-center gap-4 p-6 text-center"
              : "flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center"
          }
          role="alert"
        >
          <h2 className="text-lg font-semibold text-destructive">
            {staleChunk ? "Hay una versión nueva de NEXIA" : "Error al cargar la página"}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {staleChunk
              ? "Actualiza la app para cargar la última versión. Si el problema continúa, vuelve al inicio."
              : isRoute
                ? "Esta sección ha fallado. El resto de la app sigue disponible."
                : "Ha ocurrido un error inesperado. Por favor, intenta recargar o volver al inicio."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isRoute && !staleChunk ? (
              <Button type="button" variant="primary" size="sm" onClick={this.handleRetry}>
                Reintentar
              </Button>
            ) : null}
            <Button
              type="button"
              variant={isRoute && !staleChunk ? "secondary" : "primary"}
              size="sm"
              onClick={() => {
                if (staleChunk) {
                  window.location.reload();
                  return;
                }
                window.location.assign("/dashboard");
              }}
            >
              {staleChunk ? "Actualizar" : isRoute ? "Ir al inicio del panel" : "Volver al inicio"}
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
