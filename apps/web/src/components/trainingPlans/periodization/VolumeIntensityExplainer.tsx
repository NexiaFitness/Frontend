/**
 * Explica volumen/intensidad: capacidad cliente → ajuste bloque → objetivo (sin fórmulas).
 */

import React from "react";
import type { VolumeIntensityContext } from "@nexia/shared";
import { cn } from "@/lib/utils";

interface Props {
    context: VolumeIntensityContext | null;
    phase: "loading" | "complete" | "incomplete" | "error";
    hint?: string | null;
    className?: string;
    compact?: boolean;
}

function Row({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail?: string | null;
}) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                {label}
            </p>
            <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
            {detail ? (
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{detail}</p>
            ) : null}
        </div>
    );
}

export const VolumeIntensityExplainer: React.FC<Props> = ({
    context,
    phase,
    hint,
    className,
    compact = false,
}) => {
    if (phase === "loading") {
        return (
            <p className={cn("text-[10px] text-muted-foreground", className)}>
                Cargando referencia de volumen…
            </p>
        );
    }

    if (phase !== "complete" || !context?.client_capacity) {
        return hint ? (
            <p className={cn("text-[10px] text-muted-foreground leading-snug", className)}>
                {hint}
            </p>
        ) : null;
    }

    const cap = context.client_capacity;
    const result = context.result;
    const volumeCapacityDetail =
        cap.min_sets != null
            ? `${cap.min_sets}–${cap.max_sets} series por grupo muscular / semana`
            : `${cap.max_sets} series por grupo muscular / semana (techo)`;

    return (
        <div
            className={cn(
                "rounded-md border border-border/50 bg-muted/20 space-y-2",
                compact ? "p-2" : "p-3",
                className
            )}
        >
            <Row
                label="Capacidad de volumen (cliente)"
                value={cap.volume_level_es}
                detail={volumeCapacityDetail}
            />
            {result.weekly_target_sets != null && (
                <Row
                    label="Objetivo semanal resultante"
                    value={`${result.weekly_target_sets} series`}
                    detail={result.daily_target_label ?? undefined}
                />
            )}
        </div>
    );
};
