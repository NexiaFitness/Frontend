/**
 * QuickProgramDraftShell.tsx — Shell O6-MF: N fases, un editor F2 activo (F3).
 */

import React, { useCallback, useEffect, useMemo } from "react";
import { X, Copy, Plus, Trash2 } from "lucide-react";

import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { phaseDraftHasOverlap } from "@nexia/shared";
import type { Client } from "@nexia/shared/types/client";

import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    AUTHORING_SURFACE_CLASS,
    AUTHORING_HEADER_CLASS,
    AUTHORING_TITLE_CLASS,
    AUTHORING_SUBTITLE_CLASS,
    AUTHORING_STEP_CARD_CLASS,
} from "./phaseAuthoringPresentation";

import { PlanBlockAuthoringSurface } from "./PlanBlockAuthoringSurface";
import { useQuickProgramDraft } from "./useQuickProgramDraft";
import { useQuickProgramMaterialize } from "./useQuickProgramMaterialize";

interface Props {
    planId: number;
    programStartDate: string;
    blocks: PlanPeriodBlock[];
    catalog: PhysicalQuality[];
    planStartDate?: string | null;
    planEndDate?: string | null;
    clientProfile?: Client | null;
    activePlan?: ActivePlanByClientOut;
    planGoalForRecommendations?: string;
    onAuthoringChange?: (active: boolean) => void;
    onExit: () => void;
    onMaterializeSuccess: () => void;
}

function formatPhaseRange(start: string, end: string): string {
    const fmt = (iso: string) => {
        const [y, m, d] = iso.split("-").map(Number);
        return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };
    return `${fmt(start)} – ${fmt(end)}`;
}

export const QuickProgramDraftShell: React.FC<Props> = ({
    planId,
    programStartDate,
    blocks,
    catalog,
    planStartDate,
    planEndDate,
    clientProfile,
    activePlan,
    planGoalForRecommendations,
    onAuthoringChange,
    onExit,
    onMaterializeSuccess,
}) => {
    const existingBlocks = useMemo(
        () =>
            blocks.map((b) => ({
                id: b.id,
                start_date: b.start_date,
                end_date: b.end_date,
            })),
        [blocks],
    );

    const {
        draft,
        sortedPhases,
        activePhase,
        activeStep,
        setActiveStep,
        replacePhase,
        selectPhase,
        addPhase,
        removePhase,
        copyStructureFromPrevious,
        phaseReadiness,
        canMaterialize,
    } = useQuickProgramDraft({
        planId,
        programStartDate,
        trainingDays: clientProfile?.training_days,
        existingBlocks,
        planStartDate,
        planEndDate,
    });

    const {
        materializeProgram,
        isMaterializing,
        materializeError,
        clearMaterializeError,
    } = useQuickProgramMaterialize({
        planId,
        draft,
        phaseCount: sortedPhases.length,
        canMaterialize,
        onSuccess: onMaterializeSuccess,
    });

    useEffect(() => {
        onAuthoringChange?.(true);
        return () => onAuthoringChange?.(false);
    }, [onAuthoringChange]);

    const activeOverlap = useMemo(
        () =>
            phaseDraftHasOverlap(
                activePhase,
                draft.phases,
                existingBlocks,
            ),
        [activePhase, draft.phases, existingBlocks],
    );

    const handleCopyStructure = useCallback(() => {
        if (activePhase.sortOrder === 0) return;
        copyStructureFromPrevious(activePhase.localId);
    }, [activePhase, copyStructureFromPrevious]);

    const handleMaterializeClick = useCallback(() => {
        void materializeProgram();
    }, [materializeProgram]);

    return (
        <div
            className={AUTHORING_SURFACE_CLASS}
            data-testid="quick-program-draft-shell"
        >
            <header className={AUTHORING_HEADER_CLASS}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className={AUTHORING_TITLE_CLASS}>
                            Programación rápida
                        </h3>
                        <p className={AUTHORING_SUBTITLE_CLASS}>
                            Configura cada fase en borrador. La programación se
                            creará en un solo paso cuando esté lista.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Salir de programación rápida"
                        onClick={onExit}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            {activeOverlap ? (
                <Alert variant="warning" className="mx-4 mb-2">
                    Esta fase se solapa con otro bloque del plan o con otra fase.
                    Ajusta las semanas o revisa las fechas antes de continuar.
                </Alert>
            ) : null}

            {materializeError ? (
                <div data-testid="qp-materialize-error">
                    <Alert
                        variant="error"
                        className="mx-4 mb-2"
                        onDismiss={clearMaterializeError}
                    >
                        {materializeError}
                    </Alert>
                </div>
            ) : null}

            <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
                <aside className={AUTHORING_STEP_CARD_CLASS}>
                    <NexiaGlassAccentRim />
                    <div className="relative z-[1] space-y-3 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Fases ({sortedPhases.length})
                        </p>
                        <ul className="space-y-2">
                            {sortedPhases.map((phase, index) => {
                                const ready = phaseReadiness(phase);
                                const isActive =
                                    phase.localId === draft.activePhaseId;
                                return (
                                    <li key={phase.localId}>
                                        <button
                                            type="button"
                                            data-testid={`qp-phase-tab-${index}`}
                                            onClick={() =>
                                                selectPhase(phase.localId)
                                            }
                                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                                isActive
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border hover:bg-muted/40"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-medium">
                                                    Fase {index + 1}
                                                </span>
                                                <span
                                                    className={`text-xs ${
                                                        ready
                                                            ? "text-emerald-600"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {ready ? "Lista" : "Pendiente"}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatPhaseRange(
                                                    phase.startDate,
                                                    phase.endDate,
                                                )}{" "}
                                                · {phase.weekCount} sem.
                                            </p>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPhase}
                                data-testid="qp-add-phase"
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Añadir fase
                            </Button>
                            {activePhase.sortOrder > 0 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyStructure}
                                    data-testid="qp-copy-structure"
                                >
                                    <Copy className="mr-1 h-4 w-4" />
                                    Copiar anterior
                                </Button>
                            ) : null}
                            {sortedPhases.length > 1 ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        removePhase(activePhase.localId)
                                    }
                                    data-testid="qp-remove-phase"
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Quitar fase
                                </Button>
                            ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Programa:{" "}
                            {formatPhaseRange(
                                draft.programStartDate,
                                sortedPhases[sortedPhases.length - 1]?.endDate ??
                                    draft.programStartDate,
                            )}{" "}
                            · {draft.totalWeeks} semanas
                        </p>
                    </div>
                </aside>

                <div className="min-w-0">
                    <PlanBlockAuthoringSurface
                        persistMode="local"
                        mode="create"
                        planId={planId}
                        blockId={null}
                        blockStart={activePhase.startDate}
                        blockEnd={activePhase.endDate}
                        blocks={blocks}
                        catalog={catalog}
                        planStartDate={planStartDate}
                        planEndDate={planEndDate}
                        clientProfile={clientProfile}
                        activePlan={activePlan}
                        planGoalForRecommendations={planGoalForRecommendations}
                        phaseDraft={activePhase}
                        onPhaseDraftChange={replacePhase}
                        authoringStep={activeStep}
                        onAuthoringStepChange={setActiveStep}
                        overlapDetectedOverride={activeOverlap}
                        onExit={onExit}
                    />
                </div>
            </div>

            <DashboardFixedFooter>
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
                    <p
                        className="text-sm text-muted-foreground"
                        data-testid="qp-materialize-gate"
                    >
                        {canMaterialize
                            ? "Programa listo para crear"
                            : "Completa todas las fases para crear la programación"}
                    </p>
                    <Button
                        type="button"
                        variant="primary"
                        disabled={!canMaterialize || isMaterializing}
                        data-testid="qp-materialize-cta"
                        onClick={handleMaterializeClick}
                    >
                        {isMaterializing ? "Creando…" : "Crear programación"}
                    </Button>
                </div>
            </DashboardFixedFooter>
        </div>
    );
};
