/**
 * ErrorBoundary.tsx — Captura errores en componentes hijos; fallback ScreenStateCard.
 *
 * Contexto: Envuelve rutas lazy y el shell raíz. Variante route con Reintentar.
 * Copy en errorBoundaryPresentation.ts; UI en ScreenStateCard (sin Alert duplicado).
 *
 * Notas: stale_chunk / PWA update banner NO se toca (patrón Nelson).
 *
 * @author Frontend Team
 * @since v5.x
 * @updated v9.2.2 — ScreenStateCard
 */

import { Component, ErrorInfo, ReactNode } from "react";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";
import { Button } from "@/components/ui/buttons";
import { ScreenStateCard } from "@/components/ui/feedback/ScreenStateCard";
import {
    SCREEN_STATE_INLINE_CLASS,
    SCREEN_STATE_PAGE_CLASS,
} from "@/components/ui/feedback/screenStatePresentation";
import { isChunkLoadError } from "@/lib/lazyWithRetry";
import { reportReactBoundaryError } from "@/lib/clientErrorReporter";
import { ERROR_BOUNDARY_COPY } from "./errorBoundaryPresentation";

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
        if (
            typeof window !== "undefined" &&
            window.localStorage.getItem(AUTH_CONFIG.TOKEN_KEY)
        ) {
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
        const staleChunk =
            this.state.error != null && isChunkLoadError(this.state.error);
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
            const staleChunk =
                this.state.error != null && isChunkLoadError(this.state.error);
            const { retryFailed } = this.state;

            // PWA / chunk stale — patrón conservado (no ScreenStateCard unificado).
            if (staleChunk) {
                const copy = ERROR_BOUNDARY_COPY.stale_chunk;
                return (
                    <div className={SCREEN_STATE_PAGE_CLASS}>
                        <ScreenStateCard
                            title={copy.title}
                            body={copy.body}
                            minHeight="root"
                            role="alert"
                            aria-live="assertive"
                            showAccentRim={false}
                            actions={
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={this.handleGoHome}
                                    >
                                        {copy.primary}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={() =>
                                            window.location.assign(resolvePanelHomeHref())
                                        }
                                    >
                                        {copy.homeLink}
                                    </Button>
                                </>
                            }
                        />
                    </div>
                );
            }

            const copy = isRoute
                ? retryFailed
                    ? ERROR_BOUNDARY_COPY.routeAfterRetry
                    : ERROR_BOUNDARY_COPY.route
                : ERROR_BOUNDARY_COPY.root;

            const primaryIsHome = isRoute && retryFailed;
            const shellClass = isRoute
                ? SCREEN_STATE_INLINE_CLASS
                : SCREEN_STATE_PAGE_CLASS;

            return (
                <div className={shellClass}>
                    <ScreenStateCard
                        title={copy.title}
                        body={copy.body}
                        minHeight={isRoute ? "route" : "root"}
                        role="alert"
                        aria-live="assertive"
                        showAccentRim={false}
                        actions={
                            primaryIsHome ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={this.handleGoHome}
                                    >
                                        {copy.homeLink}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={this.handleRetry}
                                    >
                                        {copy.retry}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={this.handleRetry}
                                    >
                                        {copy.retry}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost-primary"
                                        size="sm"
                                        className="min-h-touch-athlete w-full"
                                        onClick={this.handleGoHome}
                                    >
                                        {copy.homeLink}
                                    </Button>
                                </>
                            )
                        }
                    />
                </div>
            );
        }
        return this.props.children;
    }
}
