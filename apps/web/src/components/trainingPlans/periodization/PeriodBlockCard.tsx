import React, { useState } from "react";
import { ChevronRight, Layers, Pencil, Trash2 } from "lucide-react";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { VolumeIntensityContext } from "@nexia/shared";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

import { BlockLevelMeter } from "./BlockLevelMeter";
import { QualityShareBar } from "./QualityShareBar";
import {
    PERIOD_BLOCK_CARD_BODY_CLASS,
    PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS,
    PERIOD_BLOCK_CARD_DATE_DOT_CLASS,
    PERIOD_BLOCK_CARD_DATE_TEXT_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS,
    PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS,
    PERIOD_BLOCK_CARD_FOOTER_CLASS,
    PERIOD_BLOCK_CARD_HEADER_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS,
    PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS,
    PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS,
    PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS,
    PERIOD_BLOCK_CARD_SESSIONS_CLASS,
    PERIOD_BLOCK_CARD_SHELL_CLASS,
} from "./periodBlockCardPresentation";

interface Props {
    block: PlanPeriodBlock;
    catalog: PhysicalQuality[];
    sessions?: TrainingSession[];
    onEdit?: (block: PlanPeriodBlock) => void;
    onViewWeeks?: (block: PlanPeriodBlock) => void;
    onDelete: (id: number, label: string) => void;
    onCreateSessionForBlock?: (block: PlanPeriodBlock) => void;
    volumeIntensityContext?: VolumeIntensityContext | null;
    volumeIntensityPhase?: PeriodizationVolumeNominalPhase;
}

function parseLocal(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string): string {
    return parseLocal(dateStr).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function daysBetween(start: string, end: string): number {
    const ms = parseLocal(end).getTime() - parseLocal(start).getTime();
    return Math.round(ms / 86400000) + 1;
}

export const PeriodBlockCard: React.FC<Props> = ({
    block,
    catalog,
    sessions = [],
    onEdit,
    onViewWeeks,
    onDelete,
    onCreateSessionForBlock,
    volumeIntensityContext,
    volumeIntensityPhase,
}) => {
    const [showSessions, setShowSessions] = useState(false);
    const label = `${formatDateShort(block.start_date)} — ${formatDateShort(block.end_date)}`;
    const days = daysBetween(block.start_date, block.end_date);

    const volumeHint =
        volumeIntensityPhase === "complete" &&
        volumeIntensityContext?.result.weekly_target_sets != null
            ? `Objetivo: ${volumeIntensityContext.result.weekly_target_sets} series / semana`
            : null;

    return (
        <article className={PERIOD_BLOCK_CARD_SHELL_CLASS}>
            <NexiaGlassAccentRim />

            <header className={PERIOD_BLOCK_CARD_HEADER_CLASS}>
                <div className="flex min-w-0 items-start gap-2">
                    <span
                        className={PERIOD_BLOCK_CARD_DATE_DOT_CLASS}
                        aria-hidden
                    />
                    <div className="min-w-0">
                        <p
                            className={PERIOD_BLOCK_CARD_DATE_TEXT_CLASS}
                            title={label}
                        >
                            {label}
                        </p>
                        <span
                            className={PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS}
                        >
                            {days} día{days !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {onEdit && (
                        <button
                            type="button"
                            onClick={() => onEdit(block)}
                            className={cn(
                                PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
                                PERIOD_BLOCK_CARD_ICON_BTN_EDIT_CLASS,
                            )}
                            aria-label={`Editar bloque ${label}`}
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onDelete(block.id, label)}
                        className={cn(
                            PERIOD_BLOCK_CARD_ICON_BTN_CLASS,
                            PERIOD_BLOCK_CARD_ICON_BTN_DELETE_CLASS,
                        )}
                        aria-label={`Eliminar bloque ${label}`}
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                </div>
            </header>

            <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
            </div>

            <div className={PERIOD_BLOCK_CARD_BODY_CLASS}>
                <div className={PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS}>
                    <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>
                        Cualidades
                    </p>
                    {block.qualities.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground">
                            Sin cualidades
                        </p>
                    ) : (
                        block.qualities.map((q) => {
                            const catItem = catalog.find(
                                (c) => c.id === q.physical_quality_id,
                            );
                            const slug =
                                catItem?.slug ??
                                q.physical_quality_slug ??
                                "unknown";
                            const name =
                                catItem?.name ??
                                q.physical_quality_name ??
                                `#${q.physical_quality_id}`;
                            const color = getPhysicalQualityColor(slug);

                            return (
                                <QualityShareBar
                                    key={q.id}
                                    name={name}
                                    percentage={q.percentage}
                                    colorHex={color.hex}
                                />
                            );
                        })
                    )}
                </div>

                <div className={PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS}>
                    <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>
                        Carga
                    </p>
                    <BlockLevelMeter
                        tone="volume"
                        level={block.volume_level}
                        prefix="Volumen"
                        hint={volumeHint}
                    />
                    <BlockLevelMeter
                        tone="intensity"
                        level={block.intensity_level}
                        prefix="Intensidad"
                    />
                </div>
            </div>

            {(onViewWeeks != null || onCreateSessionForBlock != null) && (
                <>
                    <div
                        className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS}
                        aria-hidden
                    >
                        <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
                    </div>
                    <footer className={PERIOD_BLOCK_CARD_FOOTER_CLASS}>
                        {onViewWeeks != null && (
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                className="w-full sm:flex-1"
                                onClick={() => onViewWeeks(block)}
                            >
                                <Layers
                                    className="mr-1.5 h-3.5 w-3.5"
                                    aria-hidden
                                />
                                Ver semanas
                            </Button>
                        )}
                        {onCreateSessionForBlock != null && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full sm:flex-1"
                                onClick={() => onCreateSessionForBlock(block)}
                            >
                                {sessions.length === 0
                                    ? "Crear sesión"
                                    : "Añadir sesión"}
                            </Button>
                        )}
                    </footer>
                </>
            )}

            {sessions.length > 0 && (
                <div className={PERIOD_BLOCK_CARD_SESSIONS_CLASS}>
                    <button
                        type="button"
                        onClick={() => setShowSessions((v) => !v)}
                        className="flex w-full items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ChevronRight
                            className={cn(
                                "h-3 w-3 shrink-0 transition-transform",
                                showSessions && "rotate-90",
                            )}
                            aria-hidden
                        />
                        <span className="font-semibold">{sessions.length}</span>
                        <span>
                            sesión{sessions.length !== 1 ? "es" : ""}{" "}
                            programada{sessions.length !== 1 ? "s" : ""}
                        </span>
                    </button>
                    {showSessions && (
                        <ul className="mt-2 space-y-1">
                            {sessions
                                .slice()
                                .sort((a, b) =>
                                    (a.session_date ?? "").localeCompare(
                                        b.session_date ?? "",
                                    ),
                                )
                                .map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-center gap-2 text-xs text-muted-foreground"
                                    >
                                        <span
                                            className="h-1 w-1 shrink-0 rounded-full bg-success"
                                            aria-hidden
                                        />
                                        <span className="font-medium text-foreground">
                                            {s.session_date
                                                ? parseLocal(
                                                      s.session_date,
                                                  ).toLocaleDateString(
                                                      "es-ES",
                                                      {
                                                          day: "numeric",
                                                          month: "short",
                                                      },
                                                  )
                                                : "Sin fecha"}
                                        </span>
                                        <span className="truncate">
                                            {s.session_name}
                                        </span>
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
            )}
        </article>
    );
};
