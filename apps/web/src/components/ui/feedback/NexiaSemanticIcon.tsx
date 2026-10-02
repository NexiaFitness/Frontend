/**
 * NexiaSemanticIcon.tsx — Icono semántico para Alert y chips de validación.
 *
 * @see DESIGN_PREMIUM.md §5.2 — sin anillo/caja alrededor; error = CircleAlert
 * (trazo), no X ni XCircle/CircleX.
 *
 * @author Frontend Team
 * @since v9.1.0
 * @updated v9.2.1 — error CircleAlert
 */

import React from "react";
import {
    AlertTriangle,
    CheckCircle2,
    CircleAlert,
    Info,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    nexiaSemanticIconClass,
    type NexiaSemanticTone,
} from "./nexiaSemanticIconPresentation";

const ICON_BY_TONE: Record<NexiaSemanticTone, LucideIcon> = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: CircleAlert,
};

export interface NexiaSemanticIconProps {
    tone: NexiaSemanticTone;
    size?: "sm" | "md";
    className?: string;
}

export const NexiaSemanticIcon: React.FC<NexiaSemanticIconProps> = ({
    tone,
    size = "md",
    className,
}) => {
    const Icon = ICON_BY_TONE[tone];
    return (
        <Icon
            className={cn(nexiaSemanticIconClass(tone, size), className)}
            aria-hidden
            data-nexia-semantic-tone={tone}
        />
    );
};
