/**
 * NotFound.tsx — Vista catch-all 404 (ruta no definida).
 *
 * Contexto: App.tsx path="*". Premium ES (DESIGN_PREMIUM.md §2, §4.4):
 * ScreenStateCard, primary «Ir al inicio» según sesión, secundario «Volver».
 *
 * @author Frontend Team
 * @since v5.x
 * @updated v9.2.2 — ScreenStateCard + copy corto
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { Button } from "@/components/ui/buttons";
import { ScreenStateCard } from "@/components/ui/feedback/ScreenStateCard";
import { SCREEN_STATE_PAGE_CLASS } from "@/components/ui/feedback/screenStatePresentation";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { NOT_FOUND_COPY } from "./notFoundPresentation";

/**
 * Inicio según sesión: sin sesión → `/` (público);
 * autenticado (entrenador o atleta) → `/dashboard` (shell resuelve el rol).
 */
function resolveHomePath(isAuthenticated: boolean): string {
    return isAuthenticated ? "/dashboard" : "/";
}

export const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated,
    );
    const homePath = useMemo(
        () => resolveHomePath(isAuthenticated),
        [isAuthenticated],
    );
    const { goBack } = useReturnToOrigin({ fallbackPath: homePath });

    return (
        <div className={SCREEN_STATE_PAGE_CLASS}>
            <ScreenStateCard
                code={NOT_FOUND_COPY.code}
                title={NOT_FOUND_COPY.title}
                body={NOT_FOUND_COPY.body}
                actions={
                    <>
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
                    </>
                }
            />
        </div>
    );
};
