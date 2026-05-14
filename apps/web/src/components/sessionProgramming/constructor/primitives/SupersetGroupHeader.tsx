/**
 * SupersetGroupHeader.tsx — Series y descanso por ronda del superset.
 * Contexto: cabecera de grupo dentro de SupersetBlock.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { Timer } from "lucide-react";
import { InlineNumberInput } from "@/components/ui/forms/InlineNumberInput";

export interface SupersetGroupHeaderProps {
    groupLabel: string;
    sets: number | null;
    restSeconds: number | null;
    onSetsChange: (sets: number | null) => void;
    onRestChange: (rest: number | null) => void;
}

export const SupersetGroupHeader: React.FC<SupersetGroupHeaderProps> = ({
    groupLabel,
    sets,
    restSeconds,
    onSetsChange,
    onRestChange,
}) => (
    <div className="space-y-3 border-b border-border/60 px-4 py-3 bg-surface/20">
        <span className="inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold tracking-wide text-foreground">
            {groupLabel}
        </span>
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Series</span>
                <InlineNumberInput
                    size="xs"
                    min={1}
                    value={sets ?? ""}
                    onChange={(e) =>
                        onSetsChange(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-14"
                />
            </div>
            <div className="flex items-center gap-2">
                <Timer className="h-3 w-3 text-muted-foreground shrink-0" aria-hidden />
                <span className="text-[11px] text-muted-foreground">Descanso por ronda</span>
                <InlineNumberInput
                    size="xs"
                    min={0}
                    value={restSeconds ?? ""}
                    onChange={(e) =>
                        onRestChange(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-14"
                />
                <span className="text-[10px] text-muted-foreground">seg</span>
            </div>
        </div>
    </div>
);
