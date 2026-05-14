/**
 * ConstructorGroupParamsBar.tsx — Barra de parámetros de grupo (estilo Lovable).
 * Contexto: badge SUPERSET A / SINGLE SET / DROP SET + controles en fila horizontal.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import {
    CONSTRUCTOR_GROUP_BADGE_CLASS,
    CONSTRUCTOR_GROUP_BAR_CLASS,
    CONSTRUCTOR_DROPSET_BADGE_CLASS,
    CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS,
    CONSTRUCTOR_GIANT_SET_BADGE_CLASS,
    CONSTRUCTOR_GIANT_SET_GROUP_BAR_CLASS,
    CONSTRUCTOR_FOR_TIME_BADGE_CLASS,
    CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS,
    CONSTRUCTOR_EMOM_BADGE_CLASS,
    CONSTRUCTOR_EMOM_GROUP_BAR_CLASS,
    CONSTRUCTOR_AMRAP_BADGE_CLASS,
    CONSTRUCTOR_AMRAP_GROUP_BAR_CLASS,
} from "./constructorCardStyles";

export interface ConstructorGroupParamsBarProps {
    badgeLabel: string;
    children: React.ReactNode;
    variant?: "primary" | "dropset" | "giant_set" | "for_time" | "emom" | "amrap";
    metaLabel?: string;
}

function resolveBarClass(variant: ConstructorGroupParamsBarProps["variant"]): string {
    if (variant === "dropset") return CONSTRUCTOR_DROPSET_GROUP_BAR_CLASS;
    if (variant === "giant_set") return CONSTRUCTOR_GIANT_SET_GROUP_BAR_CLASS;
    if (variant === "for_time") return CONSTRUCTOR_FOR_TIME_GROUP_BAR_CLASS;
    if (variant === "emom") return CONSTRUCTOR_EMOM_GROUP_BAR_CLASS;
    if (variant === "amrap") return CONSTRUCTOR_AMRAP_GROUP_BAR_CLASS;
    return CONSTRUCTOR_GROUP_BAR_CLASS;
}

function resolveBadgeClass(variant: ConstructorGroupParamsBarProps["variant"]): string {
    if (variant === "dropset") return CONSTRUCTOR_DROPSET_BADGE_CLASS;
    if (variant === "giant_set") return CONSTRUCTOR_GIANT_SET_BADGE_CLASS;
    if (variant === "for_time") return CONSTRUCTOR_FOR_TIME_BADGE_CLASS;
    if (variant === "emom") return CONSTRUCTOR_EMOM_BADGE_CLASS;
    if (variant === "amrap") return CONSTRUCTOR_AMRAP_BADGE_CLASS;
    return CONSTRUCTOR_GROUP_BADGE_CLASS;
}

function resolveMetaClass(variant: ConstructorGroupParamsBarProps["variant"]): string {
    if (variant === "for_time" || variant === "emom") {
        return "text-[10px] italic text-muted-foreground";
    }
    return "text-[10px] font-semibold uppercase tracking-wider text-primary/80";
}

export const ConstructorGroupParamsBar: React.FC<ConstructorGroupParamsBarProps> = ({
    badgeLabel,
    children,
    variant = "primary",
    metaLabel,
}) => (
    <div className={resolveBarClass(variant)}>
        <span className={resolveBadgeClass(variant)}>{badgeLabel}</span>
        {metaLabel ? (
            <span className={resolveMetaClass(variant)}>{metaLabel}</span>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>
    </div>
);
