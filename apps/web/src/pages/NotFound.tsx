/**
 * NotFound.tsx — Vista catch-all 404 (ruta no definida).
 *
 * Contexto: App.tsx path="*". Premium ES (DESIGN_PREMIUM.md §2, §4.4):
 * ScreenStateCard + acciones compartidas (screenStateActions).
 *
 * @author Frontend Team
 * @since v5.x
 * @updated v9.2.3 — Volver con ArrowLeft vía screenStateActions
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@nexia/shared/store";
import { ScreenStateCard } from "@/components/ui/feedback/ScreenStateCard";
import {
    ScreenStateBackButton,
    ScreenStateHomeButton,
} from "@/components/ui/feedback/screenStateActions";
import { SCREEN_STATE_PAGE_CLASS } from "@/components/ui/feedback/screenStatePresentation";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { NOT_FOUND_COPY } from "./notFoundPresentation";

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
                        <ScreenStateHomeButton
                            onHome={() => navigate(homePath)}
                            label={NOT_FOUND_COPY.primaryHome}
                        />
                        <ScreenStateBackButton
                            onBack={() => goBack()}
                            label={NOT_FOUND_COPY.secondaryBack}
                        />
                    </>
                }
            />
        </div>
    );
};
