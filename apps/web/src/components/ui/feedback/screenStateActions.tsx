/**
 * screenStateActions.tsx — Acciones canónicas de ScreenStateCard (NotFound / resource).
 *
 * Contexto: DESIGN_PREMIUM.md §4.4 — primary + ghost-primary Volver con ArrowLeft.
 * Un solo sitio para que NotFound y ResourceQueryState no diverjan.
 *
 * @author Frontend Team
 * @since v9.2.3
 */

import React from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { ALERT_ACTION_ICON_CLASS } from "./alertPresentation";
import { RESOURCE_QUERY_ACTION } from "./resourceQueryStatePresentation";

export interface ScreenStatePrimaryHomeProps {
    onHome: () => void;
    label?: string;
}

export interface ScreenStateBackProps {
    onBack: () => void;
    label?: string;
}

export interface ScreenStateRetryProps {
    onRetry: () => void;
    label?: string;
}

/** CTA primario «Ir al inicio». */
export const ScreenStateHomeButton: React.FC<ScreenStatePrimaryHomeProps> = ({
    onHome,
    label = RESOURCE_QUERY_ACTION.home,
}) => (
    <Button
        type="button"
        variant="primary"
        size="sm"
        className="min-h-touch-athlete w-full"
        onClick={onHome}
    >
        {label}
    </Button>
);

/** Secundario «Volver» con ArrowLeft (gap del Button; sin margen en el icono). */
export const ScreenStateBackButton: React.FC<ScreenStateBackProps> = ({
    onBack,
    label = RESOURCE_QUERY_ACTION.back,
}) => (
    <Button
        type="button"
        variant="ghost-primary"
        size="sm"
        className="min-h-touch-athlete w-full"
        onClick={onBack}
    >
        <ArrowLeft className={ALERT_ACTION_ICON_CLASS} aria-hidden />
        {label}
    </Button>
);

/** Primario «Reintentar» con RotateCcw. */
export const ScreenStateRetryButton: React.FC<ScreenStateRetryProps> = ({
    onRetry,
    label = RESOURCE_QUERY_ACTION.retry,
}) => (
    <Button
        type="button"
        variant="primary"
        size="sm"
        className="min-h-touch-athlete w-full"
        onClick={onRetry}
    >
        <RotateCcw className={ALERT_ACTION_ICON_CLASS} aria-hidden />
        {label}
    </Button>
);
