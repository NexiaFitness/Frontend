/**
 * AthleteSessionLogBlockList.tsx — Tarjetas de bloque en modo registro al final (FE-3).
 * @author Frontend Team
 * @since v8.3.0
 */

import React from "react";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteSessionLogBlockModel } from "@nexia/shared/utils/athlete/athleteSessionLogUtils";
import {
    ATHLETE_SESSION_LOG_BLOCK_HINT,
    ATHLETE_SESSION_LOG_BLOCK_PENDING,
    ATHLETE_SESSION_LOG_BLOCK_REGISTERED,
    ATHLETE_SESSION_LOG_BLOCK_SKIPPED,
    ATHLETE_SESSION_LOG_BLOCK_SUMMARY,
} from "./athleteSessionsPresentation";

export interface AthleteSessionLogBlockListProps {
    blocks: AthleteSessionLogBlockModel[];
    onBlockPress: (block: AthleteSessionLogBlockModel) => void;
}

function blockCardClass(status: AthleteSessionLogBlockModel["status"], pending: boolean): string {
    if (status === "registered") return ATHLETE_SESSION_LOG_BLOCK_REGISTERED;
    if (status === "not_performed") return ATHLETE_SESSION_LOG_BLOCK_SKIPPED;
    if (pending) return ATHLETE_SESSION_LOG_BLOCK_PENDING;
    return ATHLETE_SESSION_LOG_BLOCK_PENDING;
}

export const AthleteSessionLogBlockList: React.FC<AthleteSessionLogBlockListProps> = ({
    blocks,
    onBlockPress,
}) => {
    return (
        <div className="space-y-3">
            {blocks.map((block) => {
                const isPending = block.isPendingHighlight;
                const statusLabel =
                    block.status === "registered"
                        ? "Registrado"
                        : block.status === "not_performed"
                          ? "No realizado"
                          : "Pendiente";

                return (
                    <button
                        key={block.sessionBlockId}
                        type="button"
                        className={cn(
                            "w-full text-left",
                            blockCardClass(block.status, isPending)
                        )}
                        onClick={() => onBlockPress(block)}
                        aria-label={`${block.blockTypeName}, ${statusLabel}`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground">
                                    {block.blockTypeName}
                                </p>
                                {isPending ? (
                                    <p className={ATHLETE_SESSION_LOG_BLOCK_HINT}>
                                        Toca para registrar
                                    </p>
                                ) : null}
                                {block.summaryLine ? (
                                    <p className={ATHLETE_SESSION_LOG_BLOCK_SUMMARY}>
                                        {block.summaryLine}
                                    </p>
                                ) : null}
                            </div>
                            {block.status === "registered" ? (
                                <CheckCircle2
                                    className="size-5 shrink-0 text-emerald-500"
                                    aria-hidden
                                />
                            ) : (
                                <CircleDashed
                                    className={cn(
                                        "size-5 shrink-0",
                                        isPending ? "text-primary" : "text-muted-foreground"
                                    )}
                                    aria-hidden
                                />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};
