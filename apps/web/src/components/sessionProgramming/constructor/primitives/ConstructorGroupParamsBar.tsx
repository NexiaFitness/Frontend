/**
 * ConstructorGroupParamsBar.tsx — Barra de parámetros de grupo (estilo Lovable).
 * Contexto: badge SUPERSET A / SINGLE SET / DROP SET + controles en fila horizontal.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    CONSTRUCTOR_GROUP_BADGE_CLASS,
    CONSTRUCTOR_GROUP_BAR_CLASS,
    CONSTRUCTOR_DROPSET_BADGE_CLASS,
    CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS,
} from "./constructorCardStyles";

export interface ConstructorGroupParamsBarProps {
    badgeLabel: string;
    children: React.ReactNode;
    variant?: "primary" | "dropset";
}

export const ConstructorGroupParamsBar: React.FC<ConstructorGroupParamsBarProps> = ({
    badgeLabel,
    children,
    variant = "primary",
}) => (
    <div
        className={cn(
            variant === "dropset"
                ? CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS
                : CONSTRUCTOR_GROUP_BAR_CLASS
        )}
    >
        <span
            className={
                variant === "dropset"
                    ? CONSTRUCTOR_DROPSET_BADGE_CLASS
                    : CONSTRUCTOR_GROUP_BADGE_CLASS
            }
        >
            {badgeLabel}
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>
    </div>
);
