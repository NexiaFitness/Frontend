/**
 * ErrorBoundary.tsx — Captura errores en componentes hijos y muestra fallback UI premium.
 *
 * Contexto: Envuelve rutas lazy y el shell raíz. Variante route (B9) con Reintentar local.
 * Copy en errorBoundaryPresentation.ts.
 *
 * Notas de mantenimiento: "Ir al inicio" → /dashboard si hay token JWT; si no, / (público).
 * El reporte a POST /client-errors no incluye datos sensibles (clientErrorReporter).
 *
 * @author Frontend Team
 * @since v5.x
 * @updated 2026-10-02 — UI premium; home href según sesión
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";
import { Button } from "@/components/ui/buttons";
import { isChunkLoadError } from "@/lib/lazyWithRetry";
import { reportReactBoundaryError } from "@/lib/clientErrorReporter";
import {
    ERROR_BOUNDARY_COPY,
    errorBoundaryBodyClass,
    errorBoundaryHomeLinkClass,
    errorBoundaryShellClass,
    errorBoundaryTitleClass,
} from "./errorBoundaryPresentation";

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
  retryFailed: boolean;
}

function resolvePanelHomeHref(): string {
  try {
    if (typeof window !== "undefined" && window.localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)) {
      return "/dashboard";
    }
  } catch {
    // ignore storage errors
  }
  return "/";
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryPending = false;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryFailed: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey &&
      this.props.resetKey != null
    ) {
      this.setState({ hasError: false, error: null, retryFailed: false });
      this.retryPending = false;
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.retryPending) {
      this.retryPending = false;
      this.setState({ retryFailed: true });
    }
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    reportReactBoundaryError(error, errorInfo.componentStack ?? "");
  }

  private handleRetry = (): void => {
    this.retryPending = true;
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = (): void => {
    const staleChunk = this.state.error != null && isChunkLoadError(this.state.error);
    if (staleChunk) {
      window.location.reload();
      return;
    }
    window.location.assign(resolvePanelHomeHref());
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const isRoute = this.props.variant === "route";
      const staleChunk = this.state.error != null && isChunkLoadError(this.state.error);
      const { retryFailed } = this.state;

      if (staleChunk) {
        const copy = ERROR_BOUNDARY_COPY.stale_chunk;
        return (
          <div className={errorBoundaryShellClass("root")} role="alert">
            <h2 className={errorBoundaryTitleClass}>{copy.title}</h2>
            <p className={errorBoundaryBodyClass}>{copy.body}</p>
            <div className="flex w-full max-w-xs flex-col items-center gap-3">
              <Button type="button" variant="primary" size="sm" className="min-h-touch-athlete w-full" onClick={this.handleGoHome}>
                {copy.primary}
              </Button>
              <button type="button" className={errorBoundaryHomeLinkClass} onClick={() => window.location.assign(resolvePanelHomeHref())}>
                {copy.homeLink}
              </button>
            </div>
          </div>
        );
      }

      const copy = isRoute
        ? retryFailed
          ? ERROR_BOUNDARY_COPY.routeAfterRetry
          : ERROR_BOUNDARY_COPY.route
        : ERROR_BOUNDARY_COPY.root;

      const primaryIsHome = isRoute && retryFailed;

      return (
        <div className={errorBoundaryShellClass(isRoute ? "route" : "root")} role="alert">
          <h2 className={errorBoundaryTitleClass}>{copy.title}</h2>
          <p className={errorBoundaryBodyClass}>{copy.body}</p>
          <div className="flex w-full max-w-xs flex-col items-center gap-3">
            {primaryIsHome ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="min-h-touch-athlete w-full"
                onClick={this.handleGoHome}
              >
                {copy.homeLink}
              </Button>
            ) : (
              <>
                {isRoute ? (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="min-h-touch-athlete w-full"
                    onClick={this.handleRetry}
                  >
                    {copy.retry}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="min-h-touch-athlete w-full"
                    onClick={this.handleRetry}
                  >
                    {copy.retry}
                  </Button>
                )}
                <button type="button" className={errorBoundaryHomeLinkClass} onClick={this.handleGoHome}>
                  {copy.homeLink}
                </button>
              </>
            )}
            {primaryIsHome && isRoute ? (
              <button type="button" className={errorBoundaryHomeLinkClass} onClick={this.handleRetry}>
                {copy.retry}
              </button>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
