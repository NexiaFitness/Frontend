/**
 * ClientInjuriesEmptyState — Sin lesiones (glass premium, paridad ClientNoActivePlanEmpty).
 */

import React from "react";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ATHLETE_EMPTY_STATE_ACTION,
    ATHLETE_EMPTY_STATE_ICON_WRAP,
} from "@/components/athlete/empty/athleteEmptyStatePresentation";
import {
    TEMPLATE_LIBRARY_EMPTY_BODY,
    TEMPLATE_LIBRARY_EMPTY_GLOW,
    TEMPLATE_LIBRARY_EMPTY_SHELL,
    TEMPLATE_LIBRARY_EMPTY_TITLE,
    TEMPLATE_LIBRARY_PRIMARY_CTA,
} from "@/components/trainingPlans/templateLibraryPresentation";
import { cn } from "@/lib/utils";
import { CLIENT_INJURIES_EMPTY_COPY } from "./clientInjuriesTabPresentation";

export interface ClientInjuriesEmptyStateProps {
    onRegister: () => void;
    className?: string;
}

export const ClientInjuriesEmptyState: React.FC<ClientInjuriesEmptyStateProps> = ({
    onRegister,
    className,
}) => (
    <div
        className={cn(TEMPLATE_LIBRARY_EMPTY_SHELL, "relative py-10 sm:py-12", className)}
        data-testid="client-injuries-empty"
        role="status"
    >
        <NexiaGlassAccentRim />
        <div className={TEMPLATE_LIBRARY_EMPTY_GLOW} aria-hidden />
        <div className={ATHLETE_EMPTY_STATE_ICON_WRAP} aria-hidden>
            <Activity className="size-7 shrink-0" strokeWidth={1.75} />
        </div>
        <p className={cn(TEMPLATE_LIBRARY_EMPTY_TITLE, "relative z-[1]")}>
            {CLIENT_INJURIES_EMPTY_COPY.title}
        </p>
        <p className={cn(TEMPLATE_LIBRARY_EMPTY_BODY, "relative z-[1]")}>
            {CLIENT_INJURIES_EMPTY_COPY.description}
        </p>
        <Button
            type="button"
            variant="outline-primary"
            size="sm"
            className={cn(
                ATHLETE_EMPTY_STATE_ACTION,
                TEMPLATE_LIBRARY_PRIMARY_CTA,
                "relative z-[1]",
            )}
            onClick={onRegister}
        >
            {CLIENT_INJURIES_EMPTY_COPY.cta}
        </Button>
    </div>
);
