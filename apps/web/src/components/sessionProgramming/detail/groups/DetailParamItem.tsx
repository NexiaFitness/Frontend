/**
 * DetailParamItem.tsx — Etiqueta + valor compactos para la barra de parámetros.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import { CONSTRUCTOR_FIELD_LABEL_CLASS } from "../../constructor/primitives/constructorCardStyles";

export interface DetailParamItemProps {
    icon?: React.ReactNode;
    label: string;
    value: React.ReactNode;
    accentTextClass?: string;
}

export const DetailParamItem: React.FC<DetailParamItemProps> = ({
    icon,
    label,
    value,
    accentTextClass,
}) => {
    return (
        <div className="flex items-center gap-1.5">
            {icon && (
                <span className={cn("h-3.5 w-3.5 shrink-0", accentTextClass)}>{icon}</span>
            )}
            <span className={CONSTRUCTOR_FIELD_LABEL_CLASS}>{label}</span>
            <span className="text-xs font-semibold text-foreground">{value}</span>
        </div>
    );
};
