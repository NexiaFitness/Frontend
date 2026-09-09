/**
 * PlanBlockAuthoringSurface.tsx — Superficie focal premium Crear/Editar bloque (D-PAP Fase 2).
 */

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";

import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { resolveClientTrainingFrequency } from "@nexia/shared";
import { useGetMovementPatternsQuery } from "@nexia/shared/api/exercisesApi";
import { useGetWeeklyStructureQuery, weeklyStructureApi } from "@nexia/shared/api/weeklyStructureApi";
import type { AppDispatch } from "@nexia/shared/store";
import type { Client } from "@nexia/shared/types/client";

import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { usePeriodizationVolumeRecommendations } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

import { PeriodBlockQualitiesStep } from "./PeriodBlockQualitiesStep";
import { validateQualitiesStepAdvance } from "./periodBlockQualitiesValidation";
import { usePeriodBlockForm } from "./usePeriodBlockForm";
import { useBlockAuthoringPersistence } from "./useBlockAuthoringPersistence";
import { useBlockAuthoringNavigation } from "./useBlockAuthoringNavigation";
import {
    blockAuthorStepIndex,
    nextBlockAuthorStep,
    type BlockAuthorMode,
    type BlockAuthorStep,
} from "./blockAuthoringModel";
import { BlockAuthoringStepper } from "./BlockAuthoringStepper";
import { BlockAuthoringStepLoad } from "./BlockAuthoringStepLoad";
import { BlockAuthoringStepDays } from "./BlockAuthoringStepDays";
import { BlockAuthoringStepPatterns } from "./BlockAuthoringStepPatterns";
import { BlockAuthoringStepSummary } from "./BlockAuthoringStepSummary";
import {
    ensureWeek1FromTrainingDays,
    getActiveDaysFromWeek1,
    setActiveDaysOnWeek1,
} from "./blockAuthoringDaysUtils";
import { allActiveDaysHavePatterns } from "./blockAuthoringPatternsUtils";
import { weeklyStructureToDraft } from "./periodBlockPersistence";
import {
    AUTHORING_FOOTER_INNER_CLASS,
    AUTHORING_HEADER_CLASS,
    AUTHORING_STEP_CARD_CLASS,
    AUTHORING_STEP_META_CLASS,
    AUTHORING_SUBTITLE_CLASS,
    AUTHORING_SURFACE_CLASS,
    AUTHORING_TITLE_CLASS,
} from "./phaseAuthoringPresentation";

interface Props {
    mode: BlockAuthorMode;
    planId: number;
    blockId: number | null;
    blockStart: string | null;
    blockEnd: string | null;
    blocks: PlanPeriodBlock[];
    catalog: PhysicalQuality[];
    planStartDate?: string | null;
    planEndDate?: string | null;
    clientProfile?: Client | null;
    activePlan?: ActivePlanByClientOut;
    planGoalForRecommendations?: string;
    onAuthoringChange?: (active: boolean) => void;
    onExit: () => void;
}

export const PlanBlockAuthoringSurface: React.FC<Props> = ({
    mode,
    planId,
    blockId,
    blockStart,
    blockEnd,
    blocks,
    catalog,
    planStartDate,
    planEndDate,
    clientProfile,
    activePlan,
    planGoalForRecommendations,
    onAuthoringChange,
    onExit,
}) => {
    const { showWarning } = useToast();
    const dispatch = useDispatch<AppDispatch>();
    const {
        data: patternsCatalog = [],
        isLoading: patternsLoading,
        isError: patternsError,
    } = useGetMovementPatternsQuery({ limit: 100, is_active: true });
    const [maxReachedStep, setMaxReachedStep] = useState<BlockAuthorStep>(
        mode === "edit" ? "summary" : "qualities",
    );
    const [structureLoaded, setStructureLoaded] = useState(false);
    const createInitializedRef = useRef(false);
    const editBlockIdRef = useRef<number | null>(null);

    const { data: existingStructure } = useGetWeeklyStructureQuery(
        { planId, blockId: blockId! },
        {
            skip: mode !== "edit" || blockId == null,
            refetchOnMountOrArgChange: true,
        },
    );

    const navigation = useBlockAuthoringNavigation(maxReachedStep);
    const step = navigation.step;

    const confirmWeeklyStructureFromServer = useCallback(async () => {
        if (blockId == null) {
            return { data: undefined };
        }
        const data = await dispatch(
            weeklyStructureApi.endpoints.getWeeklyStructure.initiate(
                { planId, blockId },
                { forceRefetch: true, subscribe: false },
            ),
        ).unwrap();
        return { data };
    }, [dispatch, planId, blockId]);

    const formApi = usePeriodBlockForm(
        blocks,
        mode === "edit" ? blockId : null,
        planStartDate,
        planEndDate,
    );

    const {
        form,
        addQuality,
        removeQuality,
        updateQualityPct,
        setVolumeLevel,
        setIntensityLevel,
        setWeeklyStructure,
        loadBlock,
        initCreateRange,
        hydrateWeeklyStructure,
        markPersisted,
        structureBaseline,
        isStructureDirty,
        qualitiesSum,
        overlapDetected,
        outsidePlanBounds,
        canPersistBlock,
        isDirty,
    } = formApi;

    useEffect(() => {
        onAuthoringChange?.(true);
        return () => onAuthoringChange?.(false);
    }, [onAuthoringChange]);

    useEffect(() => {
        if (createInitializedRef.current) return;
        if (mode === "create" && blockStart && blockEnd) {
            createInitializedRef.current = true;
            initCreateRange(blockStart, blockEnd);
            const withDays = ensureWeek1FromTrainingDays(
                [],
                clientProfile?.training_days,
            );
            if (withDays.length > 0) {
                setWeeklyStructure(withDays);
            }
        }
    }, [
        mode,
        blockStart,
        blockEnd,
        initCreateRange,
        clientProfile?.training_days,
        setWeeklyStructure,
    ]);

    useEffect(() => {
        if (mode !== "edit" || blockId == null) return;
        if (editBlockIdRef.current === blockId) return;
        editBlockIdRef.current = blockId;
        const block = blocks.find((b) => b.id === blockId);
        if (block) {
            loadBlock(block);
            setStructureLoaded(false);
        }
    }, [mode, blockId, blocks, loadBlock]);

    useEffect(() => {
        if (mode !== "edit" || blockId == null || structureLoaded) {
            return;
        }

        let cancelled = false;

        void (async () => {
            const result = await confirmWeeklyStructureFromServer();
            if (cancelled || !result.data?.weeks) {
                return;
            }

            hydrateWeeklyStructure(weeklyStructureToDraft(result.data.weeks));
            setStructureLoaded(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [
        mode,
        blockId,
        structureLoaded,
        confirmWeeklyStructureFromServer,
        hydrateWeeklyStructure,
    ]);

    const activeDays = useMemo(
        () => getActiveDaysFromWeek1(form.weeklyStructure),
        [form.weeklyStructure],
    );

    const { save, isSaving } = useBlockAuthoringPersistence({
        planId,
        mode,
        blockId,
        form,
        blocks,
        existingStructure,
        structureBaseline,
        structureReady: structureLoaded,
        isStructureDirty,
        canPersist: canPersistBlock,
        activeDayCount: activeDays.length,
        patternsComplete: allActiveDaysHavePatterns(
            form.weeklyStructure,
            activeDays,
        ),
        markPersisted,
        onCreateSuccess: onExit,
        refetchWeeklyStructure: confirmWeeklyStructureFromServer,
    });

    const planGoalResolved =
        activePlan?.display_goal ?? activePlan?.goal ?? planGoalForRecommendations;
    const trainingFrequency = resolveClientTrainingFrequency(clientProfile);
    const volumeNominal = usePeriodizationVolumeRecommendations(
        clientProfile?.id,
        planGoalResolved,
        trainingFrequency,
    );
    const formVolumeContext = volumeNominal.buildContext(
        form.volumeLevel,
        form.intensityLevel,
    );

    const handleToggleDay = useCallback(
        (dayOfWeek: number) => {
            const set = new Set(activeDays);
            if (set.has(dayOfWeek)) {
                set.delete(dayOfWeek);
            } else {
                set.add(dayOfWeek);
            }
            setWeeklyStructure(
                setActiveDaysOnWeek1([...set], form.weeklyStructure),
            );
        },
        [activeDays, form.weeklyStructure, setWeeklyStructure],
    );

    const canAdvanceCurrentStep = useMemo(() => {
        switch (step) {
            case "qualities":
                return validateQualitiesStepAdvance({
                    qualitiesCount: form.qualities.length,
                    qualitiesSum,
                    overlapDetected,
                    outsidePlanBounds,
                }).ok;
            case "volumeIntensity":
                return form.volumeLevel >= 1 && form.intensityLevel >= 1;
            case "days":
                return activeDays.length > 0;
            case "patterns":
                return allActiveDaysHavePatterns(form.weeklyStructure, activeDays);
            case "summary":
                return false;
            default:
                return false;
        }
    }, [
        step,
        form.qualities.length,
        form.volumeLevel,
        form.intensityLevel,
        qualitiesSum,
        overlapDetected,
        outsidePlanBounds,
        activeDays,
        form.weeklyStructure,
    ]);

    const handleNext = useCallback(() => {
        if (step === "qualities") {
            const result = validateQualitiesStepAdvance({
                qualitiesCount: form.qualities.length,
                qualitiesSum,
                overlapDetected,
                outsidePlanBounds,
            });
            if (!result.ok && result.message) {
                showWarning(result.message);
                return;
            }
        }
        if (step === "days" && activeDays.length === 0) {
            showWarning("Selecciona al menos un día de entrenamiento.");
            return;
        }
        if (
            step === "patterns" &&
            !allActiveDaysHavePatterns(form.weeklyStructure, activeDays)
        ) {
            showWarning(
                "Asigna al menos un patrón a cada día de entrenamiento.",
            );
            return;
        }
        const next = nextBlockAuthorStep(step);
        if (next == null) return;
        const advancedMax =
            blockAuthorStepIndex(next) > blockAuthorStepIndex(maxReachedStep)
                ? next
                : maxReachedStep;
        setMaxReachedStep(advancedMax);
        navigation.goToStep(next);
    }, [
        step,
        maxReachedStep,
        form.qualities.length,
        qualitiesSum,
        overlapDetected,
        outsidePlanBounds,
        activeDays,
        form.weeklyStructure,
        showWarning,
        navigation,
    ]);

    const handleExit = useCallback(() => {
        if (isDirty) {
            const ok = window.confirm(
                "Tienes cambios sin guardar. ¿Salir y descartarlos?",
            );
            if (!ok) return;
        }
        onExit();
    }, [isDirty, onExit]);

    const title =
        mode === "create"
            ? "Bloque en creación"
            : "Editar bloque de periodización";
    const periodUnit = "fase";
    const subtitle =
        mode === "create"
            ? "Configura el bloque paso a paso antes de guardarlo."
            : "Revisa o ajusta cualquier sección del bloque.";

    const structureHydrating =
        mode === "edit" && blockId != null && !structureLoaded;
    const stepNeedsStructure =
        step === "days" || step === "patterns" || step === "summary";

    const isSummary = step === "summary";
    const primaryLabel = mode === "create"
        ? isSummary
            ? "Crear bloque"
            : "Siguiente"
        : isSummary
          ? "Guardar bloque"
          : "Siguiente";

    const patternsIncomplete =
        step === "patterns" &&
        activeDays.length > 0 &&
        !allActiveDaysHavePatterns(form.weeklyStructure, activeDays);

    const stepFooter = (
        <>
            {!canAdvanceCurrentStep && overlapDetected && step !== "summary" ? (
                <p
                    className="mb-3 text-sm text-warning"
                    data-testid="authoring-overlap-hint"
                >
                    El rango se solapa con otro bloque. Ajusta las fechas antes de
                    continuar.
                </p>
            ) : null}
            {patternsIncomplete ? (
                <p
                    className="mb-3 text-sm text-warning"
                    data-testid="authoring-patterns-hint"
                >
                    Asigna al menos un patrón de movimiento a cada día de entrenamiento
                    antes de continuar.
                </p>
            ) : null}
            <div className={AUTHORING_FOOTER_INNER_CLASS}>
                <Button
                    type="button"
                    variant="outline"
                    disabled={!navigation.canGoBack}
                    onClick={navigation.goBack}
                >
                    Atrás
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    isLoading={isSummary && isSaving}
                    disabled={
                        isSaving ||
                        (structureHydrating && stepNeedsStructure) ||
                        (isSummary
                            ? mode === "create"
                                ? !canPersistBlock ||
                                  activeDays.length === 0 ||
                                  !allActiveDaysHavePatterns(
                                      form.weeklyStructure,
                                      activeDays,
                                  )
                                : !isDirty || !structureLoaded
                            : !canAdvanceCurrentStep ||
                              (structureHydrating && stepNeedsStructure))
                    }
                    onClick={isSummary ? () => void save() : handleNext}
                >
                    {primaryLabel}
                </Button>
            </div>
        </>
    );

    return (
        <div
            className={AUTHORING_SURFACE_CLASS}
            data-testid="plan-block-authoring-surface"
        >
            <header className={AUTHORING_HEADER_CLASS}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={AUTHORING_STEP_META_CLASS}>
                            Paso {navigation.stepIndex + 1} de 5
                        </p>
                        <h3 className={AUTHORING_TITLE_CLASS}>{title}</h3>
                        <p className={AUTHORING_SUBTITLE_CLASS}>{subtitle}</p>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cerrar autoría"
                        onClick={handleExit}
                        className="shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <BlockAuthoringStepper
                    activeStep={step}
                    maxReachedStep={maxReachedStep}
                    onStepClick={navigation.goToStep}
                    isStepReachable={navigation.isStepReachable}
                />
            </header>

            <div className={AUTHORING_STEP_CARD_CLASS}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1]">
                    {structureHydrating && stepNeedsStructure ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">
                            Cargando estructura semanal…
                        </p>
                    ) : step === "qualities" ? (
                        <PeriodBlockQualitiesStep
                            qualities={form.qualities}
                            qualitiesSum={qualitiesSum}
                            catalog={catalog}
                            overlapDetected={overlapDetected}
                            outsidePlanBounds={outsidePlanBounds}
                            onAddQuality={addQuality}
                            onRemoveQuality={removeQuality}
                            onUpdateQualityPct={updateQualityPct}
                            onContinue={handleNext}
                            hideFooter
                        />
                    ) : step === "volumeIntensity" ? (
                        <BlockAuthoringStepLoad
                            volumeLevel={form.volumeLevel}
                            intensityLevel={form.intensityLevel}
                            onVolumeChange={setVolumeLevel}
                            onIntensityChange={setIntensityLevel}
                            volumeIntensityContext={formVolumeContext}
                            volumeIntensityPhase={volumeNominal.phase}
                            volumeIntensityHint={volumeNominal.auxiliaryHint}
                        />
                    ) : step === "days" ? (
                        <BlockAuthoringStepDays
                            activeDays={activeDays}
                            onToggleDay={handleToggleDay}
                            periodUnit={periodUnit}
                        />
                    ) : step === "patterns" ? (
                        <BlockAuthoringStepPatterns
                            activeDays={activeDays}
                            weeklyStructure={form.weeklyStructure}
                            onWeeklyStructureChange={setWeeklyStructure}
                            catalog={patternsCatalog}
                            catalogLoading={patternsLoading}
                            catalogError={patternsError}
                            periodUnit={periodUnit}
                        />
                    ) : step === "summary" ? (
                        <BlockAuthoringStepSummary
                            startDate={form.startDate}
                            endDate={form.endDate}
                            qualities={form.qualities}
                            qualitiesSum={qualitiesSum}
                            volumeLevel={form.volumeLevel}
                            intensityLevel={form.intensityLevel}
                            activeDays={activeDays}
                            weeklyStructure={form.weeklyStructure}
                            catalog={catalog}
                            patternsCatalog={patternsCatalog}
                            onEditStep={navigation.goToStep}
                        />
                    ) : null}
                </div>
            </div>

            <DashboardFixedFooter>{stepFooter}</DashboardFixedFooter>
        </div>
    );
};
