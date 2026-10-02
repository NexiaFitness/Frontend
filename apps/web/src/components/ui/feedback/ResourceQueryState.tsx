/**
 * ResourceQueryState.tsx — Estado de pantalla para fallos de consulta HTTP.
 *
 * Contexto: 404 → no encontrado; 403 → sin permiso; otro → no se pudo cargar
 * con Reintentar. DESIGN_PREMIUM.md §5.2; acciones §4.4 / useReturnToOrigin.
 *
 * No inventa 404 dentro de rutas válidas: solo cuando la query falló.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { ScreenStateCard } from "./ScreenStateCard";
import {
    extractHttpStatus,
    resolveResourceQueryKind,
    type ResourceQueryResource,
} from "./resourceQueryStateContract";
import {
    RESOURCE_QUERY_ACTION,
    resourceQueryCopy,
} from "./resourceQueryStatePresentation";
import {
    SCREEN_STATE_INLINE_CLASS,
    SCREEN_STATE_PAGE_CLASS,
} from "./screenStatePresentation";
import { ALERT_ACTION_ICON_CLASS } from "./alertPresentation";

export interface ResourceQueryStateProps {
    error: unknown;
    resource: ResourceQueryResource;
    /** Reintentar la query (solo load_failed). */
    onRetry?: () => void;
    /** Fallback de Volver / Ir al inicio. */
    fallbackPath?: string;
    /** Página completa (centrada) vs bloque inline en layout existente. */
    layout?: "page" | "inline";
    /** Sustituye el CTA primario (p. ej. lista de clientes). */
    primaryAction?: React.ReactNode;
}

function resolveHomePath(isAuthenticated: boolean): string {
    return isAuthenticated ? "/dashboard" : "/";
}

export const ResourceQueryState: React.FC<ResourceQueryStateProps> = ({
    error,
    resource,
    onRetry,
    fallbackPath,
    layout = "inline",
    primaryAction,
}) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated,
    );
    const homePath = useMemo(
        () => resolveHomePath(isAuthenticated),
        [isAuthenticated],
    );
    const backFallback = fallbackPath ?? homePath;
    const { goBack } = useReturnToOrigin({ fallbackPath: backFallback });

    const status = extractHttpStatus(error);
    const kind = resolveResourceQueryKind(status);
    const copy = resourceQueryCopy(resource, kind);

    const actions = (
        <>
            {primaryAction != null ? (
                primaryAction
            ) : kind === "load_failed" && onRetry != null ? (
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="min-h-touch-athlete w-full"
                    onClick={onRetry}
                >
                    <RotateCcw className={`${ALERT_ACTION_ICON_CLASS} mr-1`} aria-hidden />
                    {RESOURCE_QUERY_ACTION.retry}
                </Button>
            ) : (
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="min-h-touch-athlete w-full"
                    onClick={() => navigate(homePath)}
                >
                    {RESOURCE_QUERY_ACTION.home}
                </Button>
            )}
            <Button
                type="button"
                variant="ghost-primary"
                size="sm"
                className="min-h-touch-athlete w-full"
                onClick={() => goBack()}
            >
                <ArrowLeft className={`${ALERT_ACTION_ICON_CLASS} mr-1`} aria-hidden />
                {RESOURCE_QUERY_ACTION.back}
            </Button>
        </>
    );

    const card = (
        <ScreenStateCard
            code={kind === "not_found" ? "404" : undefined}
            title={copy.title}
            body={copy.body}
            actions={actions}
            role="status"
            aria-live="polite"
        />
    );

    return (
        <div
            className={
                layout === "page" ? SCREEN_STATE_PAGE_CLASS : SCREEN_STATE_INLINE_CLASS
            }
            data-testid="resource-query-state"
            data-resource={resource}
            data-kind={kind}
        >
            {card}
        </div>
    );
};
