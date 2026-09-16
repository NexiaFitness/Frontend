/**
 * NexiaSemanticIcon.tsx — Icono semántico para Alert y chips de validación.
 * @see DESIGN_PREMIUM.md §5.2 — sin anillo extra; error usa Lucide X (no XCircle).
 */

import React from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X,
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
    error: X,
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
        />
    );
};
