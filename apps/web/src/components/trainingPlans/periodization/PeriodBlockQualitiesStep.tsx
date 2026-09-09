/**
 * PeriodBlockQualitiesStep.tsx — Paso reutilizable «Cualidades físicas» del constructor.
 *
 * UI + validación con toasts al pulsar Continuar (botón siempre habilitado).
 * Spec: docs/constructor-periodizacion/
 */

import React, { useCallback, useMemo } from "react";
import { HelpCircle, X } from "lucide-react";

import type {
    PhysicalQuality,
    PeriodBlockQualityInput,
} from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

import { Button } from "@/components/ui/buttons";
import {
    AddPill,
    AddPillGrid,
    ADD_PILL_SECTION_HINT_CLASS,
    ADD_PILL_SECTION_LABEL_CLASS,
} from "@/components/ui/chips";
import { HintTooltip } from "@/components/ui/feedback";
import { BlockLevelMeter } from "./BlockLevelMeter";
import { useToast } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

import {
    detectAmbiguousMixWarnings,
    getCoPrimarySlugs,
    getQualityTooltip,
    isCoPrimaryMix,
    PHYSICAL_QUALITY_MIX_COPY,
    formatCoPrimaryLabels,
} from "./periodizationQualitiesPresentation";
import { QualityMixInfoBanner } from "./QualityMixInfoBanner";
import {
    AUTHORING_STEP_INNER_PANEL_CLASS,
} from "./phaseAuthoringPresentation";

import {
    MAX_PERIOD_BLOCK_QUALITIES,
    validateCanAddQuality,
    validateQualitiesStepAdvance,
} from "./periodBlockQualitiesValidation";

export interface PeriodBlockQualitiesStepProps {
    qualities: PeriodBlockQualityInput[];
    qualitiesSum: number;
    catalog: PhysicalQuality[];
    overlapDetected?: boolean;
    outsidePlanBounds?: boolean;
    onAddQuality: (qualityId: number) => void;
    onRemoveQuality: (qualityId: number) => void;
    onUpdateQualityPct: (qualityId: number, percentage: number) => void;
    onContinue: () => void;
    continueLabel?: string;
    /** Ocultar CTA interno cuando el footer de la superficie D-PAP gestiona navegación. */
    hideFooter?: boolean;
    /** Título e hint los provee BlockAuthoringStepBody (wizard D-PAP). */
    hideHeader?: boolean;
    /** Tokens premium del wizard (paneles glass, pills, espaciado). */
    premiumLayout?: boolean;
    className?: string;
}

export const PeriodBlockQualitiesStep: React.FC<PeriodBlockQualitiesStepProps> = ({
    qualities,
    qualitiesSum,
    catalog,
    overlapDetected = false,
    outsidePlanBounds = false,
    onAddQuality,
    onRemoveQuality,
    onUpdateQualityPct,
    onContinue,
    continueLabel = "Continuar a estructura semanal",
    hideFooter = false,
    hideHeader = false,
    premiumLayout = false,
    className,
}) => {
    const { showError, showWarning } = useToast();
    const assignedIds = qualities.map((q) => q.physical_quality_id);
    const available = catalog.filter((c) => !assignedIds.includes(c.id));
    const atQualityLimit = qualities.length >= MAX_PERIOD_BLOCK_QUALITIES;

    const coPrimarySlugs = useMemo(
        () => getCoPrimarySlugs(qualities, catalog),
        [qualities, catalog],
    );
    const ambiguousWarnings = useMemo(
        () => detectAmbiguousMixWarnings(qualities, catalog),
        [qualities, catalog],
    );

    const handleAddQuality = useCallback(
        (qualityId: number) => {
            const result = validateCanAddQuality(qualities.length);
            if (!result.ok && result.message) {
                showWarning(result.message);
                return;
            }
            onAddQuality(qualityId);
        },
        [qualities.length, onAddQuality, showWarning],
    );

    const handleContinue = useCallback(() => {
        const result = validateQualitiesStepAdvance({
            qualitiesCount: qualities.length,
            qualitiesSum,
            overlapDetected,
            outsidePlanBounds,
        });
        if (!result.ok && result.message) {
            if (result.severity === "warning") {
                showWarning(result.message);
            } else {
                showError(result.message);
            }
            return;
        }
        onContinue();
    }, [
        qualities.length,
        qualitiesSum,
        overlapDetected,
        outsidePlanBounds,
        onContinue,
        showError,
        showWarning,
    ]);

    const assignedPanelClass = premiumLayout
        ? cn(AUTHORING_STEP_INNER_PANEL_CLASS, "space-y-4 md:space-y-5")
        : "space-y-4 rounded-md border border-border/60 bg-surface-2/30 p-4";

    return (
        <div
            className={cn(
                "flex flex-col",
                premiumLayout ? "gap-6 md:gap-8" : "gap-5",
                className,
            )}
        >
            {!hideHeader ? (
                <header className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-foreground">
                        {PHYSICAL_QUALITY_MIX_COPY.stepTitle}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                        {PHYSICAL_QUALITY_MIX_COPY.helpParagraph}
                    </p>
                </header>
            ) : null}

            {!hideHeader && qualities.length === 0 ? (
                <p className="text-[11px] text-primary animate-pulse leading-relaxed">
                    Añade al menos una cualidad física para continuar
                </p>
            ) : null}

            {qualities.length > 0 && (
                <section
                    aria-label="Cualidades asignadas"
                    className={assignedPanelClass}
                >
                    {qualities.map((q) => {
                        const catItem = catalog.find(
                            (c) => c.id === q.physical_quality_id,
                        );
                        const slug = catItem?.slug ?? "unknown";
                        const name =
                            catItem?.name ??
                            `Cualidad #${q.physical_quality_id}`;
                        const qColor = getPhysicalQualityColor(slug);

                        const qualityTooltip = getQualityTooltip(slug);

                        return (
                            <div
                                key={q.physical_quality_id}
                                className="relative pr-9"
                            >
                                <BlockLevelMeter
                                    accentHex={qColor.hex}
                                    prefix={name}
                                    level={q.percentage}
                                    min={0}
                                    max={100}
                                    step={5}
                                    qualitativeLabel={false}
                                    valueFormat="percent"
                                    headerLeading={
                                        <>
                                            <span
                                                className="h-2 w-2 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor: qColor.hex,
                                                }}
                                                aria-hidden
                                            />
                                            {qualityTooltip ? (
                                                <HintTooltip
                                                    label={qualityTooltip}
                                                    align="start"
                                                >
                                                    <span
                                                        className="inline-flex text-muted-foreground/70 hover:text-primary"
                                                        tabIndex={0}
                                                    >
                                                        <HelpCircle
                                                            className="h-3.5 w-3.5"
                                                            aria-hidden
                                                        />
                                                    </span>
                                                </HintTooltip>
                                            ) : null}
                                        </>
                                    }
                                    onChange={(value) =>
                                        onUpdateQualityPct(
                                            q.physical_quality_id,
                                            value,
                                        )
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveQuality(q.physical_quality_id)
                                    }
                                    className="absolute right-0 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                                    aria-label={`Quitar ${name}`}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        );
                    })}
                </section>
            )}

            {isCoPrimaryMix(qualities, catalog) && (
                <QualityMixInfoBanner
                    title={PHYSICAL_QUALITY_MIX_COPY.coPrimaryTitle}
                    body={`${PHYSICAL_QUALITY_MIX_COPY.coPrimaryBody} (${formatCoPrimaryLabels(coPrimarySlugs, catalog)}).`}
                />
            )}

            {ambiguousWarnings.map((w) => (
                <QualityMixInfoBanner key={w.id} title={w.title} body={w.body} />
            ))}

            {!atQualityLimit && available.length > 0 && (
                <section
                    className={cn("space-y-3", premiumLayout && "md:space-y-4")}
                    aria-label="Añadir cualidades"
                >
                    <p className={ADD_PILL_SECTION_LABEL_CLASS}>
                        Añadir cualidad
                        <span className={ADD_PILL_SECTION_HINT_CLASS}>
                            (máx. {MAX_PERIOD_BLOCK_QUALITIES})
                        </span>
                    </p>
                    <AddPillGrid variant={premiumLayout ? "premium" : "compact"}>
                        {available.map((c) => (
                            <AddPill
                                key={c.id}
                                label={c.name}
                                variant={premiumLayout ? "premium" : "compact"}
                                fullWidth={premiumLayout}
                                onClick={() => handleAddQuality(c.id)}
                            />
                        ))}
                    </AddPillGrid>
                </section>
            )}

            {!hideFooter && (
            <footer className="pt-4 border-t border-border/50">
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={handleContinue}
                >
                    {continueLabel}
                </Button>
            </footer>
            )}
        </div>
    );
};
