/**
 * InstallPromptChip.tsx — Recordatorio glass fino para instalar PWA.
 * @see docs/atleta/pwa/DECISIONES_PRODUCTO.md
 */

import React from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    INSTALL_PROMPT_CHIP_DASHBOARD,
    INSTALL_PROMPT_CHIP_LABEL,
    INSTALL_PROMPT_CHIP_LANDING,
    INSTALL_PROMPT_CHIP_TOP_DIVIDER,
} from "./installPromptPresentation";

export type InstallPromptChipVariant = "dashboard" | "landing";

export interface InstallPromptChipProps {
    onClick: () => void;
    variant: InstallPromptChipVariant;
    className?: string;
}

export const InstallPromptChip: React.FC<InstallPromptChipProps> = ({
    onClick,
    variant,
    className,
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            variant === "dashboard"
                ? INSTALL_PROMPT_CHIP_DASHBOARD
                : INSTALL_PROMPT_CHIP_LANDING,
            className
        )}
        aria-label={INSTALL_PROMPT_CHIP_LABEL}
    >
        <span className={INSTALL_PROMPT_CHIP_TOP_DIVIDER} aria-hidden />
        <Smartphone className="size-4 shrink-0 text-primary" aria-hidden />
        <span>{INSTALL_PROMPT_CHIP_LABEL}</span>
    </button>
);
