/**
 * BlockAuthoringStepSummary.tsx — Resumen compacto del borrador (D-PAP).
 *
 * Contexto: Semana tipo unificada (días + patrones); veredicto = Alert solo si
 * falta algo; si completo, el primary del footer es el veredicto.
 * DESIGN_PREMIUM.md §2, §4.4, §5.2.
 *
 * @author Frontend Team
 * @updated v9.2.2 — Semana tipo + veredicto incompleto
 */

import React, { useMemo } from "react";
import { Pencil } from "lucide-react";

import type { PhysicalQuality, PeriodBlockQualityInput } from "@nexia/shared/types/planningCargas";
import type { MovementPattern } from "@nexia/shared/types/exercise";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import { cn } from "@/lib/utils";
import { Alert } from "@/components/ui/feedback";

import { getPatternsForDayFromWeek1 } from "./blockAuthoringPatternsUtils";
import { PatternBadge } from "./PatternBadge";
import { BlockLevelMeter } from "./BlockLevelMeter";
import { QualityShareBar } from "./QualityShareBar";
import { PlanningDateRangeMeta } from "./PlanningDateRangeMeta";
import { PeriodBlockIconButton } from "./PeriodBlockIconButton";
import {
    WEEKDAY_ISO_ORDER,
    WEEKDAY_LABELS_ES,
} from "./phaseAuthoringPresentation";
import type { BlockAuthorStep } from "./blockAuthoringModel";
import { buildBlockAuthoringSummaryGaps } from "./blockAuthoringSummaryGaps";
import {
    BLOCK_AUTHORING_SUMMARY_DAY_CHIP_CLASS,
    BLOCK_AUTHORING_SUMMARY_DAYS_ROW_CLASS,
    BLOCK_AUTHORING_SUMMARY_HERO_CLASS,
    BLOCK_AUTHORING_SUMMARY_INTRO_CLASS,
    BLOCK_AUTHORING_SUMMARY_LOAD_STACK_CLASS,
    BLOCK_AUTHORING_SUMMARY_MAIN_GRID_CLASS,
    BLOCK_AUTHORING_SUMMARY_PATTERN_BADGES_CLASS,
    BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_CLASS,
    BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_TITLE_CLASS,
    BLOCK_AUTHORING_SUMMARY_PATTERN_EMPTY_CLASS,
    BLOCK_AUTHORING_SUMMARY_PATTERN_GRID_CLASS,
    BLOCK_AUTHORING_SUMMARY_QUALITIES_STACK_CLASS,
    BLOCK_AUTHORING_SUMMARY_SECTION_CLASS,
    BLOCK_AUTHORING_SUMMARY_SECTION_HEADER_CLASS,
    BLOCK_AUTHORING_SUMMARY_SECTION_LABEL_CLASS,
    BLOCK_AUTHORING_SUMMARY_STACK_CLASS,
    BLOCK_AUTHORING_SUMMARY_VERDICT_INCOMPLETE_TITLE,
    BLOCK_AUTHORING_SUMMARY_WEEK_TYPE_CLASS,
    BLOCK_AUTHORING_SUMMARY_WEEK_TYPE_LABEL,
} from "./blockAuthoringSummaryPresentation";

interface Props {
    startDate: string | null;
    endDate: string | null;
    qualities: PeriodBlockQualityInput[];
    qualitiesSum: number;
    volumeLevel: number;
    intensityLevel: number;
    activeDays: readonly number[];
    weeklyStructure: readonly WeeklyStructureWeekCreate[];
    catalog: PhysicalQuality[];
    patternsCatalog: MovementPattern[];
    onEditStep: (step: BlockAuthorStep) => void;
    hideIntro?: boolean;
    /** Mensaje structure_coverage / hueco de fechas (si aplica). */
    structureCoverageMessage?: string | null;
    /** @deprecated Siempre layout compacto premium; se mantiene por compatibilidad. */
    premiumLayout?: boolean;
}

const WEEKDAY_FULL_ES = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
] as const;

function patternDisplayName(pattern: MovementPattern): string {
    return pattern.name_es?.trim() || pattern.name_en;
}

interface SummarySectionProps {
    label: string;
    editLabel: string;
    onEdit?: () => void;
    className?: string;
    children: React.ReactNode;
}

function SummarySection({
    label,
    editLabel,
    onEdit,
    className,
    children,
}: SummarySectionProps) {
    return (
        <section className={cn(BLOCK_AUTHORING_SUMMARY_SECTION_CLASS, className)}>
            <div className={BLOCK_AUTHORING_SUMMARY_SECTION_HEADER_CLASS}>
                <p className={BLOCK_AUTHORING_SUMMARY_SECTION_LABEL_CLASS}>
                    {label}
                </p>
                {onEdit ? (
                    <PeriodBlockIconButton
                        variant="edit"
                        onClick={onEdit}
                        aria-label={editLabel}
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </PeriodBlockIconButton>
                ) : null}
            </div>
            {children}
        </section>
    );
}

export const BlockAuthoringStepSummary: React.FC<Props> = ({
    startDate,
    endDate,
    qualities,
    qualitiesSum,
    volumeLevel,
    intensityLevel,
    activeDays,
    weeklyStructure,
    catalog,
    patternsCatalog,
    onEditStep,
    hideIntro = false,
    structureCoverageMessage = null,
}) => {
    const activeSet = new Set(activeDays);

    const patternsById = useMemo(
        () => new Map(patternsCatalog.map((p) => [p.id, p])),
        [patternsCatalog],
    );

    const patternRows = WEEKDAY_ISO_ORDER.filter((d) => activeSet.has(d)).map(
        (dayOfWeek) => {
            const patterns = getPatternsForDayFromWeek1(
                weeklyStructure,
                dayOfWeek,
            );
            return { dayOfWeek, patterns };
        },
    );

    const activeDayChips = WEEKDAY_ISO_ORDER.filter((d) => activeSet.has(d));

    const gaps = useMemo(
        () =>
            buildBlockAuthoringSummaryGaps({
                activeDays,
                weeklyStructure,
                structureCoverageMessage,
            }),
        [activeDays, weeklyStructure, structureCoverageMessage],
    );

    const weekTypeEditStep: BlockAuthorStep =
        activeDays.length === 0 ? "days" : "patterns";

    return (
        <div className={BLOCK_AUTHORING_SUMMARY_STACK_CLASS}>
            {!hideIntro ? (
                <p className={BLOCK_AUTHORING_SUMMARY_INTRO_CLASS}>
                    Resumen del bloque
                </p>
            ) : null}

            {gaps.length > 0 ? (
                <Alert
                    variant="warning"
                    data-testid="block-authoring-summary-verdict"
                    title={BLOCK_AUTHORING_SUMMARY_VERDICT_INCOMPLETE_TITLE}
                    description={`Falta: ${gaps.join("; ")}.`}
                />
            ) : null}

            <div className={BLOCK_AUTHORING_SUMMARY_HERO_CLASS}>
                {startDate && endDate ? (
                    <PlanningDateRangeMeta
                        startDate={startDate}
                        endDate={endDate}
                        testId="block-authoring-summary-date-range"
                    />
                ) : (
                    <p className="text-xs text-muted-foreground">Sin fechas definidas</p>
                )}
            </div>

            <div className={BLOCK_AUTHORING_SUMMARY_MAIN_GRID_CLASS}>
                <SummarySection
                    label={`Cualidades · ${qualitiesSum}%`}
                    editLabel="Editar cualidades"
                    onEdit={() => onEditStep("qualities")}
                >
                    {qualities.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground">
                            Sin cualidades
                        </p>
                    ) : (
                        <div className={BLOCK_AUTHORING_SUMMARY_QUALITIES_STACK_CLASS}>
                            {qualities.map((q) => {
                                const catItem = catalog.find(
                                    (c) => c.id === q.physical_quality_id,
                                );
                                const slug = catItem?.slug ?? "unknown";
                                const name =
                                    catItem?.name ??
                                    `#${q.physical_quality_id}`;
                                const color = getPhysicalQualityColor(slug);

                                return (
                                    <QualityShareBar
                                        key={q.physical_quality_id}
                                        name={name}
                                        percentage={q.percentage}
                                        colorHex={color.hex}
                                    />
                                );
                            })}
                        </div>
                    )}
                </SummarySection>

                <SummarySection
                    label="Carga"
                    editLabel="Editar volumen e intensidad"
                    onEdit={() => onEditStep("volumeIntensity")}
                >
                    <div className={BLOCK_AUTHORING_SUMMARY_LOAD_STACK_CLASS}>
                        <BlockLevelMeter
                            tone="volume"
                            level={volumeLevel}
                            prefix="Volumen"
                        />
                        <BlockLevelMeter
                            tone="intensity"
                            level={intensityLevel}
                            prefix="Intensidad"
                        />
                    </div>
                </SummarySection>
            </div>

            <section
                className={BLOCK_AUTHORING_SUMMARY_WEEK_TYPE_CLASS}
                data-testid="block-authoring-summary-week-type"
            >
                <div className={BLOCK_AUTHORING_SUMMARY_SECTION_HEADER_CLASS}>
                    <p className={BLOCK_AUTHORING_SUMMARY_SECTION_LABEL_CLASS}>
                        {BLOCK_AUTHORING_SUMMARY_WEEK_TYPE_LABEL}
                    </p>
                    <PeriodBlockIconButton
                        variant="edit"
                        onClick={() => onEditStep(weekTypeEditStep)}
                        aria-label="Editar semana tipo"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </PeriodBlockIconButton>
                </div>

                {activeDayChips.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">
                        Ningún día seleccionado
                    </p>
                ) : (
                    <>
                        <div className={BLOCK_AUTHORING_SUMMARY_DAYS_ROW_CLASS}>
                            {activeDayChips.map((day) => (
                                <span
                                    key={day}
                                    className={BLOCK_AUTHORING_SUMMARY_DAY_CHIP_CLASS}
                                    title={WEEKDAY_FULL_ES[day - 1]}
                                >
                                    {WEEKDAY_LABELS_ES[day - 1]}
                                </span>
                            ))}
                        </div>
                        <div className={BLOCK_AUTHORING_SUMMARY_PATTERN_GRID_CLASS}>
                            {patternRows.map(({ dayOfWeek, patterns }) => (
                                <div
                                    key={dayOfWeek}
                                    className={BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_CLASS}
                                >
                                    <p
                                        className={
                                            BLOCK_AUTHORING_SUMMARY_PATTERN_DAY_TITLE_CLASS
                                        }
                                    >
                                        {WEEKDAY_FULL_ES[dayOfWeek - 1] ??
                                            WEEKDAY_LABELS_ES[dayOfWeek - 1]}
                                    </p>
                                    <div
                                        className={
                                            BLOCK_AUTHORING_SUMMARY_PATTERN_BADGES_CLASS
                                        }
                                    >
                                        {patterns.length === 0 ? (
                                            <span
                                                className={
                                                    BLOCK_AUTHORING_SUMMARY_PATTERN_EMPTY_CLASS
                                                }
                                            >
                                                Sin patrones
                                            </span>
                                        ) : (
                                            patterns.map((assignment) => {
                                                const pattern = patternsById.get(
                                                    assignment.movement_pattern_id,
                                                );
                                                if (!pattern) return null;
                                                return (
                                                    <PatternBadge
                                                        key={
                                                            assignment.movement_pattern_id
                                                        }
                                                        name={patternDisplayName(
                                                            pattern,
                                                        )}
                                                        uiBucket={pattern.ui_bucket}
                                                        selected
                                                        size="sm"
                                                    />
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};
