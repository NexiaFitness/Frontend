/**
 * NotFound.tsx — Vista catch-all 404 (ruta no definida).
 *
 * Contexto: App.tsx path="*". Premium ES (DESIGN_PREMIUM.md §2, §4.4):
 * glass card, primary «Ir al inicio» según rol, secundario «Volver».
 *
 * Notas de mantenimiento: no confundir con ErrorBoundary (fallo de render)
 * ni con resource-missing dentro de una ruta válida (B3).
 *
 * @author Frontend Team
 * @since v5.x
 * @updated v9.2.0 — NotFound premium unificado
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    NOT_FOUND_ACTIONS_CLASS,
    NOT_FOUND_BODY_CLASS,
    NOT_FOUND_CARD_CLASS,
    NOT_FOUND_CODE_CLASS,
    NOT_FOUND_COPY,
    NOT_FOUND_PAGE_CLASS,
    NOT_FOUND_TITLE_CLASS,
} from "./notFoundPresentation";

/** Inicio según sesión: público → `/`; autenticado (cualquier rol) → `/dashboard`. */
function resolveHomePath(isAuthenticated: boolean): string {
    return isAuthenticated ? "/dashboard" : "/";
}

export const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const homePath = useMemo(
        () => resolveHomePath(isAuthenticated),
        [isAuthenticated],
    );
    const { goBack } = useReturnToOrigin({ fallbackPath: homePath });

    return (
        <div className={NOT_FOUND_PAGE_CLASS}>
            <div className={NOT_FOUND_CARD_CLASS} role="status" aria-live="polite">
                <NexiaGlassAccentRim />
                <p className={NOT_FOUND_CODE_CLASS}>{NOT_FOUND_COPY.code}</p>
                <h1 className={NOT_FOUND_TITLE_CLASS}>{NOT_FOUND_COPY.title}</h1>
                <p className={NOT_FOUND_BODY_CLASS}>{NOT_FOUND_COPY.body}</p>
                <div className={NOT_FOUND_ACTIONS_CLASS}>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="min-h-touch-athlete w-full"
                        onClick={() => navigate(homePath)}
                    >
                        {NOT_FOUND_COPY.primaryHome}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        className="min-h-touch-athlete w-full"
                        onClick={() => goBack()}
                    >
                        {NOT_FOUND_COPY.secondaryBack}
                    </Button>
                </div>
            </div>
        </div>
    );
};
