/**
 * PlatformHeaderBackButton.tsx — Botón «Volver» canónico (entrenador / admin).
 *
 * Contexto: DESIGN_PREMIUM.md §4.4 · design/platform/05_ACTION_HIERARCHY.md §2.1.
 * Mobile-first (375px): outline-primary con tinte; desde md ghost-primary sin marco.
 * Un solo componente para no duplicar clases en decenas de cabeceras.
 *
 * @author Frontend Team
 * @since v9.2.4
 */

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import { PLATFORM_HEADER_BACK_BUTTON } from "@/components/ui/surface/platformPremiumPresentation";

export interface PlatformHeaderBackButtonProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export const PlatformHeaderBackButton: React.FC<PlatformHeaderBackButtonProps> = ({
    onClick,
    label = "Volver",
    className,
}) => (
    <Button
        type="button"
        variant="outline-primary"
        size="sm"
        className={cn(PLATFORM_HEADER_BACK_BUTTON, className)}
        onClick={onClick}
    >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        {label}
    </Button>
);
