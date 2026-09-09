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
import { ChevronLeft } from "lucide-react";
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
import { DiscardUnsavedChangesModal } from "@/components/ui/modals";
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
import { BlockAuthoringFocusHeader } from "./BlockAuthoringFocusHeader";
import { BlockAuthoringStepBody } from "./BlockAuthoringStepBody";
import { getBlockAuthoringStepCopy } from "./blockAuthoringStepCopy";
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
import { cn } from "@/lib/utils";
import {
    AUTHORING_HEADER_CLASS,
    AUTHORING_STEP_CARD_CLASS,
    AUTHORING_SURFACE_CLASS,
    AUTHORING_WIZARD_FOOTER_ROW_CLASS,
    AUTHORING_WIZARD_FOOTER_STACK_CLASS,
} from "./phaseAuthoringPresentation";

interface Props {
    mode: BlockAuthorMode;
    clientId: number;
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
    clientId,
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
    const [discardModalOpen, setDiscardModalOpen] = useState(false);
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
            setDiscardModalOpen(true);
            return;
        }
        onExit();
    }, [isDirty, onExit]);

    const handleConfirmDiscard = useCallback(() => {
        setDiscardModalOpen(false);
        onExit();
    }, [onExit]);

    const handleBack = useCallback(() => {
        if (navigation.canGoBack) {
            navigation.goBack();
            return;
        }
        handleExit();
    }, [navigation, handleExit]);

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

    const stepCopy = useMemo(
        () => getBlockAuthoringStepCopy(step, periodUnit),
        [step, periodUnit],
    );

    const stepFooter = (
        <div className={AUTHORING_WIZARD_FOOTER_STACK_CLASS}>
            {!canAdvanceCurrentStep && overlapDetected && step !== "summary" ? (
                <p
                    className="text-sm text-warning"
                    data-testid="authoring-overlap-hint"
                >
                    El rango se solapa con otro bloque. Ajusta las fechas antes de
                    continuar.
                </p>
            ) : null}
            {patternsIncomplete ? (
                <p
                    className="text-sm text-warning"
                    data-testid="authoring-patterns-hint"
                >
                    Asigna al menos un patrón de movimiento a cada día de entrenamiento
                    antes de continuar.
                </p>
            ) : null}
            <div className={AUTHORING_WIZARD_FOOTER_ROW_CLASS}>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                >
                    <ChevronLeft className="size-4 shrink-0" aria-hidden />
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
        </div>
    );

    return (
        <div
            className={AUTHORING_SURFACE_CLASS}
            data-testid="plan-block-authoring-surface"
        >
            <div className={AUTHORING_HEADER_CLASS}>
                <BlockAuthoringFocusHeader
                    clientId={clientId}
                    planId={planId}
                    clientProfile={clientProfile}
                    mode={mode}
                    taskSubtitle={subtitle}
                    onExit={handleExit}
                    stepper={
                        <BlockAuthoringStepper
                            activeStep={step}
                            maxReachedStep={maxReachedStep}
                            onStepClick={navigation.goToStep}
                            isStepReachable={navigation.isStepReachable}
                        />
                    }
                />
            </div>

            <div className={AUTHORING_STEP_CARD_CLASS}>
                <NexiaGlassAccentRim />
                <div className="relative z-[1]">
                    <BlockAuthoringStepBody
                        title={stepCopy.title}
                        hint={stepCopy.hint}
                        statusHint={
                            step === "qualities" && form.qualities.length === 0
                                ? "Añade al menos una cualidad física para continuar"
                                : undefined
                        }
                    >
                        {structureHydrating && stepNeedsStructure ? (
                            <p className="py-12 text-center text-sm text-muted-foreground">
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
                                hideHeader
                                premiumLayout
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
                                premiumLayout
                            />
                        ) : step === "days" ? (
                            <BlockAuthoringStepDays
                                activeDays={activeDays}
                                onToggleDay={handleToggleDay}
                                periodUnit={periodUnit}
                                hideIntro
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
                                hideIntro
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
                                hideIntro
                                premiumLayout
                            />
                        ) : null}
                    </BlockAuthoringStepBody>
                </div>
            </div>

            <DashboardFixedFooter>{stepFooter}</DashboardFixedFooter>

            <DiscardUnsavedChangesModal
                isOpen={discardModalOpen}
                onConfirm={handleConfirmDiscard}
                onCancel={() => setDiscardModalOpen(false)}
            />
        </div>
    );
};
