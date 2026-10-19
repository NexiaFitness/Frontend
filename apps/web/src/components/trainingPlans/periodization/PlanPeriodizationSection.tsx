import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import { useGetPeriodBlocksQuery } from "@nexia/shared/api/periodBlocksApi";
import { useGetTrainingSessionsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetMovementPatternsQuery } from "@nexia/shared/api/exercisesApi";
import {
  useGetDayExceptionsQuery,
  useCreateDayExceptionMutation,
  useDeleteDayExceptionMutation,
} from "@nexia/shared/api/dayExceptionsApi";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import {
  getMutationErrorMessage,
  resolveClientTrainingFrequency,
  getBlockCalendarWeekCount,
} from "@nexia/shared";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import {
  isDateInRange,
  getBlockOverlapHint,
} from "@nexia/shared/utils/periodBlockOverlap";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { ResourceQueryState } from "@/components/ui/feedback/ResourceQueryState";
import { Button } from "@/components/ui/buttons";
import { NexiaPremiumConfirmModal } from "@/components/ui/modals";
import { usePeriodBlockForm } from "./usePeriodBlockForm";
import { usePeriodBlockDeletion } from "./usePeriodBlockDeletion";
import { usePeriodizationVolumeRecommendations } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { PlanBlockAuthoringSurface } from "./PlanBlockAuthoringSurface";
import { BlockWeeksManageSurface } from "./BlockWeeksManageSurface";
import { DayExceptionRestModal } from "./DayExceptionRestModal";
import { PlanningExploreShell } from "./PlanningExploreShell";
import { usePlanBlocksStructureDrift } from "./usePlanBlocksStructureDrift";
import { buildBlockAuthorPath } from "@/lib/trainingPlanNavigation";
import { scrollDashboardMainToAnchorAfterPaint } from "@/lib/dashboardScroll";
import { usePeriodBlockCreateSessionAction } from "@/hooks/trainingPlans/usePeriodBlockCreateSessionAction";
import { usePeriodBlocksStructurePendingDates } from "@/hooks/trainingPlans/usePeriodBlocksStructurePendingDates";
import {
  clearBlockAuthorParams,
  clearBlockWeeksParam,
  isBlockAuthoringActive,
  parseBlockAuthorParams,
  parseBlockWeeksId,
  setBlockWeeksParam,
} from "@/utils/blockAuthoringUrl";
import {
  applyPlanningModeCreateBlock,
  clearPlanningMode,
  isPlanningCreateWhenMode,
} from "@/utils/planningHubUrl";
import {
  countSessionsInPeriodBlockPhase,
  findBlockContainingDate,
  hasStaleFocusParam,
  isPeriodBlockVisibleInMonth,
  resolveCalendarMonthForDate,
  resolveFocusedBlockId,
  resolveNextPhaseStartDate,
} from "./planningShellUtils";

function formatDateFriendly(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

const BLOCK_AUTHORING_FOCUS_HEADER_SELECTOR =
  '[data-testid="block-authoring-focus-header"]';

function getPlanningProgramAnchorElement(): HTMLElement | null {
  return (
    document.getElementById("planning-program-anchor") ??
    (document.querySelector(
      '[data-testid="planning-explore-shell"]',
    ) as HTMLElement | null)
  );
}

function getPlanningCalendarAnchorElement(): HTMLElement | null {
  return document.getElementById("planning-calendar-section");
}

/** Tras salir de wizard/semanas: ancla en card del programa (no tabs ni observaciones). */
function scrollToPlanningProgramAnchor(): () => void {
  return scrollDashboardMainToAnchorAfterPaint(getPlanningProgramAnchorElement);
}

/** Modo createWhen: llevar el calendario a vista para elegir rango de la fase. */
function scrollToPlanningCalendarAnchor(): () => void {
  return scrollDashboardMainToAnchorAfterPaint(getPlanningCalendarAnchorElement);
}

interface Props {
  planId: number;
  clientId?: number;
  planStartDate?: string | null;
  planEndDate?: string | null;
  activePlan?: ActivePlanByClientOut;
  planGoalForRecommendations?: string;
  onAuthoringChange?: (active: boolean) => void;
  showOtherPlansAction?: boolean;
  onOpenOtherPlans?: () => void;
  structureCoverageBlockId?: number | null;
  structureCoverageIncomplete?: boolean;
  structureCoverageWeeklyStructurePath?: string | null;
}

export const PlanPeriodizationSection: React.FC<Props> = ({
  planId,
  clientId,
  planStartDate,
  planEndDate,
  activePlan,
  planGoalForRecommendations,
  onAuthoringChange,
  showOtherPlansAction = false,
  onOpenOtherPlans,
  structureCoverageBlockId = null,
  structureCoverageIncomplete = false,
  structureCoverageWeeklyStructurePath = null,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingCreateWhenStartRef = useRef<string | null>(null);
  const wasPlanningFocusSurfaceRef = useRef(false);
  const blockAuthorParams = useMemo(
    () => parseBlockAuthorParams(searchParams),
    [searchParams],
  );
  const blockWeeksId = useMemo(
    () => parseBlockWeeksId(searchParams),
    [searchParams],
  );
  const isDapAuthoring = isBlockAuthoringActive(blockAuthorParams);
  const isBlockWeeksManage = blockWeeksId != null;
  const isPickingPhaseRange = isPlanningCreateWhenMode(searchParams);

  const { showWarning, showSuccess, showError } = useToast();
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [pendingFocusBlockId, setPendingFocusBlockId] = useState<number | null>(
    null,
  );
  const [structureDriftRefreshKey, setStructureDriftRefreshKey] = useState(0);
  const wasDapAuthoringRef = useRef(isDapAuthoring);
  const [exceptionModal, setExceptionModal] = useState<{ date: string } | null>(null);
  const [exceptionNote, setExceptionNote] = useState("");
  const { data: clientProfile } = useGetClientQuery(clientId!, { skip: !clientId });

  const { data: catalog = [] } = useGetPhysicalQualitiesQuery();
  const {
    data: blocks = [],
    isLoading,
    isError,
    error,
  } = useGetPeriodBlocksQuery(planId);
  const { data: sessions = [] } = useGetTrainingSessionsQuery(planId);

  const sessionDates = useMemo(() => {
    const set = new Set<string>();
    for (const session of sessions) {
      if (session.session_date) {
        set.add(session.session_date);
      }
    }
    return set;
  }, [sessions]);

  const structurePendingDates = usePeriodBlocksStructurePendingDates({
    planId,
    blocks,
    enabled: !isDapAuthoring && !isBlockWeeksManage,
  });

  const { data: dayExceptions = [] } = useGetDayExceptionsQuery(
    { clientId: clientId! },
    { skip: !clientId },
  );

  const exceptionDates = useMemo(() => {
    const set = new Set<string>();
    for (const ex of dayExceptions) {
      if (!ex.is_trainable) {
        set.add(ex.date);
      }
    }
    return set;
  }, [dayExceptions]);

  const phaseSessionCountByBlock = useMemo(() => {
    const map = new Map<number, number>();
    for (const block of blocks) {
      map.set(
        block.id,
        countSessionsInPeriodBlockPhase(sessions, block),
      );
    }
    return map;
  }, [blocks, sessions]);

  useEffect(() => {
    if (wasDapAuthoringRef.current && !isDapAuthoring) {
      setStructureDriftRefreshKey((k) => k + 1);
    }
    wasDapAuthoringRef.current = isDapAuthoring;
  }, [isDapAuthoring]);

  const structureDriftByBlockId = usePlanBlocksStructureDrift({
    planId,
    blocks,
    sessions,
    refreshKey: structureDriftRefreshKey,
    enabled:
      !isDapAuthoring &&
      !isBlockWeeksManage &&
      !isPickingPhaseRange &&
      blocks.length > 0 &&
      sessions.length > 0,
  });

  const blockRemoval = usePeriodBlockDeletion(planId);
  const [createException, { isLoading: isCreatingException }] = useCreateDayExceptionMutation();
  const [removeException] = useDeleteDayExceptionMutation();

  const {
    data: patternsCatalog,
    isLoading: isLoadingPatterns,
    isError: isErrorPatterns,
  } = useGetMovementPatternsQuery({ limit: 100, is_active: true });

  const {
    form,
    handleDayClick,
    reset,
    overlapDetected,
    outsidePlanBounds,
  } = usePeriodBlockForm(blocks, null, planStartDate, planEndDate);

  useEffect(() => {
    if (!isPickingPhaseRange) {
      return;
    }
    reset();
    const pendingStart = pendingCreateWhenStartRef.current;
    if (pendingStart) {
      pendingCreateWhenStartRef.current = null;
      handleDayClick(pendingStart);
    }
  }, [isPickingPhaseRange, reset, handleDayClick]);

  useEffect(() => {
    if (!isPickingPhaseRange) {
      return;
    }
    return scrollToPlanningCalendarAnchor();
  }, [isPickingPhaseRange]);

  useEffect(() => {
    if (!isDapAuthoring) {
      return;
    }
    return scrollDashboardMainToAnchorAfterPaint(() =>
      document.querySelector(BLOCK_AUTHORING_FOCUS_HEADER_SELECTOR) as HTMLElement | null,
    );
  }, [isDapAuthoring]);

  useEffect(() => {
    const inFocusSurface = isDapAuthoring || isBlockWeeksManage;
    if (inFocusSurface) {
      wasPlanningFocusSurfaceRef.current = true;
      return;
    }
    if (wasPlanningFocusSurfaceRef.current) {
      wasPlanningFocusSurfaceRef.current = false;
      return scrollToPlanningProgramAnchor();
    }
  }, [isDapAuthoring, isBlockWeeksManage]);

  useEffect(() => {
    onAuthoringChange?.(
      isDapAuthoring ||
        isBlockWeeksManage ||
        isPickingPhaseRange,
    );
  }, [
    isDapAuthoring,
    isBlockWeeksManage,
    isPickingPhaseRange,
    onAuthoringChange,
  ]);

  const navigateToClientPlanning = useCallback(
    (nextParams: URLSearchParams) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      setSearchParams(nextParams, { replace: true });
    },
    [clientId, setSearchParams],
  );

  const navigateToCreateAuthoring = useCallback(
    (startDate: string, endDate: string) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      navigate(
        buildBlockAuthorPath({
          clientId,
          planId,
          mode: "create",
          blockStart: startDate,
          blockEnd: endDate,
          blockStep: "qualities",
        }),
      );
    },
    [clientId, planId, navigate],
  );

  const handleEditBlockNavigate = useCallback(
    (block: PlanPeriodBlock) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      navigate(
        buildBlockAuthorPath({
          clientId,
          planId,
          mode: "edit",
          blockId: block.id,
          blockStep: "summary",
        }),
      );
    },
    [clientId, planId, navigate],
  );

  const handleExitBlockAuthoring = useCallback(() => {
    if (clientId == null || clientId <= 0) {
      return;
    }
    reset();
    const next = clearBlockAuthorParams(searchParams);
    navigateToClientPlanning(next);
  }, [clientId, searchParams, reset, navigateToClientPlanning]);

  const handleBlockCreated = useCallback(
    (block: PlanPeriodBlock) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      reset();
      setPendingFocusBlockId(block.id);
      setCalMonth(resolveCalendarMonthForDate(block.start_date));
      const next = clearBlockAuthorParams(searchParams);
      next.set("focus", String(block.id));
      navigateToClientPlanning(next);
    },
    [clientId, searchParams, reset, navigateToClientPlanning],
  );

  useEffect(() => {
    if (pendingFocusBlockId == null) {
      return;
    }
    if (blocks.some((block) => block.id === pendingFocusBlockId)) {
      setPendingFocusBlockId(null);
    }
  }, [blocks, pendingFocusBlockId]);

  const focusedBlockId = useMemo(
    () => resolveFocusedBlockId(searchParams, blocks, pendingFocusBlockId),
    [searchParams, blocks, pendingFocusBlockId],
  );

  useEffect(() => {
    if (isDapAuthoring || isBlockWeeksManage) {
      return;
    }
    if (isLoading) {
      return;
    }
    if (!hasStaleFocusParam(searchParams, blocks, pendingFocusBlockId)) {
      return;
    }
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    navigateToClientPlanning(next);
  }, [
    blocks,
    searchParams,
    isDapAuthoring,
    isBlockWeeksManage,
    navigateToClientPlanning,
    pendingFocusBlockId,
    isLoading,
  ]);

  const handleFocusBlock = useCallback(
    (block: PlanPeriodBlock) => {
      const next = new URLSearchParams(searchParams);
      next.set("focus", String(block.id));
      navigateToClientPlanning(next);
      if (!isPeriodBlockVisibleInMonth(block, calMonth)) {
        setCalMonth(resolveCalendarMonthForDate(block.start_date));
      }
    },
    [searchParams, navigateToClientPlanning, calMonth],
  );

  const focusBlockId = searchParams.get("focus");
  useEffect(() => {
    if (!focusBlockId || isDapAuthoring || isBlockWeeksManage) return;
    const id = Number(focusBlockId);
    if (!Number.isFinite(id) || id <= 0) return;
    scrollDashboardMainToAnchorAfterPaint(() =>
      document.querySelector(`[data-block-id="${id}"]`),
    );
  }, [focusBlockId, isDapAuthoring, isBlockWeeksManage, blocks.length]);

  const handleViewWeeks = useCallback(
    (block: PlanPeriodBlock) => {
      const next = setBlockWeeksParam(searchParams, block.id);
      navigateToClientPlanning(next);
    },
    [searchParams, navigateToClientPlanning],
  );

  const handleExitBlockWeeks = useCallback(() => {
    const next = clearBlockWeeksParam(searchParams);
    navigateToClientPlanning(next);
  }, [searchParams, navigateToClientPlanning]);

  const handleStartCreateBlock = useCallback(() => {
    if (isPickingPhaseRange) {
      reset();
      navigateToClientPlanning(clearPlanningMode(searchParams));
      return;
    }
    reset();
    pendingCreateWhenStartRef.current = null;
    const nextStart = resolveNextPhaseStartDate(blocks, planStartDate);
    if (nextStart) {
      setCalMonth(resolveCalendarMonthForDate(nextStart));
    }
    const next = applyPlanningModeCreateBlock(searchParams);
    navigateToClientPlanning(next);
  }, [
    isPickingPhaseRange,
    reset,
    blocks,
    planStartDate,
    searchParams,
    navigateToClientPlanning,
  ]);

  const continueRangeDisabledReason = useMemo(() => {
    if (form.phase !== "rangeComplete") {
      return null;
    }
    if (outsidePlanBounds) {
      return "El rango debe estar dentro de la vigencia del plan.";
    }
    if (overlapDetected) {
      return "El rango se solapa con otro bloque. Ajusta las fechas en el calendario.";
    }
    return null;
  }, [form.phase, outsidePlanBounds, overlapDetected]);

  const handleContinueCreateRange = useCallback(() => {
    if (form.phase !== "rangeComplete" || !form.startDate || !form.endDate) {
      return;
    }
    if (outsidePlanBounds) {
      showWarning("El rango debe estar dentro de la vigencia del plan.");
      return;
    }
    if (overlapDetected) {
      showWarning(
        "El rango se solapa con otro bloque. Ajusta las fechas en el calendario.",
      );
      return;
    }
    navigateToCreateAuthoring(form.startDate, form.endDate);
  }, [
    form.phase,
    form.startDate,
    form.endDate,
    outsidePlanBounds,
    overlapDetected,
    showWarning,
    navigateToCreateAuthoring,
  ]);

  const planGoalResolved =
    activePlan?.display_goal ?? activePlan?.goal ?? planGoalForRecommendations;

  const trainingFrequency = resolveClientTrainingFrequency(clientProfile);
  const trainingFrequencyLabel = `${trainingFrequency} ses/sem`;
  const volumeNominal = usePeriodizationVolumeRecommendations(
    clientId,
    planGoalResolved,
    trainingFrequency,
  );

  const handleCreateSessionForBlock = usePeriodBlockCreateSessionAction({
    clientId,
    planId,
    sessions,
    onCalendarMonthChange: setCalMonth,
  });

  const handlePickRangeDayClick = useCallback(
    (dateStr: string) => {
      if (
        planStartDate &&
        planEndDate &&
        !isDateInRange(dateStr, planStartDate, planEndDate)
      ) {
        showWarning("Solo puedes definir bloques dentro de la vigencia del plan.");
        return;
      }

      const isStartingNewRange =
        form.phase === "idle" || form.phase === "rangeComplete";
      if (isStartingNewRange) {
        const hint = getBlockOverlapHint(dateStr, blocks);
        if (hint) {
          const blockName = hint.block.name?.trim() || "Otro bloque";
          showWarning(
            `El ${formatDateFriendly(dateStr)} está dentro del bloque «${blockName}». El siguiente día libre es el ${formatDateFriendly(hint.nextFreeDate)}.`,
          );
          setCalMonth(resolveCalendarMonthForDate(hint.nextFreeDate));
          handleDayClick(hint.nextFreeDate);
          return;
        }
      }

      handleDayClick(dateStr);
    },
    [
      planStartDate,
      planEndDate,
      handleDayClick,
      showWarning,
      form.phase,
      blocks,
    ],
  );

  const handleCalendarDayClick = useCallback(
    (dateStr: string) => {
      if (isPickingPhaseRange) {
        handlePickRangeDayClick(dateStr);
        return;
      }

      const containingBlock = findBlockContainingDate(blocks, dateStr);
      if (containingBlock) {
        if (clientId == null || clientId <= 0) {
          return;
        }
        const sessionOnDay = sessions.find((s) => s.session_date === dateStr);
        if (sessionOnDay) {
          navigate(`/dashboard/session-programming/sessions/${sessionOnDay.id}`);
          return;
        }
        const qs = new URLSearchParams({
          clientId: String(clientId),
          planId: String(planId),
          date: dateStr,
          sessionKind: "program",
        });
        navigate(`/dashboard/session-programming/create-session?${qs.toString()}`);
        return;
      }
      if (
        planStartDate &&
        planEndDate &&
        !isDateInRange(dateStr, planStartDate, planEndDate)
      ) {
        showWarning("Solo puedes definir bloques dentro de la vigencia del plan.");
        return;
      }
      pendingCreateWhenStartRef.current = dateStr;
      setCalMonth(resolveCalendarMonthForDate(dateStr));
      const next = applyPlanningModeCreateBlock(searchParams);
      navigateToClientPlanning(next);
    },
    [
      isPickingPhaseRange,
      handlePickRangeDayClick,
      blocks,
      sessions,
      clientId,
      planId,
      navigate,
      planStartDate,
      planEndDate,
      searchParams,
      navigateToClientPlanning,
      showWarning,
    ],
  );

  const handleDayContextMenu = useCallback(
    (dateStr: string) => {
      if (isPickingPhaseRange && form.phase !== "idle") {
        return;
      }
      if (!clientId) {
        return;
      }
      const existing = dayExceptions.find(
        (ex) => ex.date === dateStr && !ex.is_trainable,
      );
      if (existing) {
        void removeException({ clientId, date: dateStr })
          .unwrap()
          .then(() => {
            showSuccess("Descanso eliminado. El día vuelve a contar como entrenable.");
          })
          .catch((err: unknown) => {
            showError(getMutationErrorMessage(err));
          });
        return;
      }
      setExceptionNote("");
      setExceptionModal({ date: dateStr });
    },
    [
      isPickingPhaseRange,
      form.phase,
      clientId,
      dayExceptions,
      removeException,
      showSuccess,
      showError,
    ],
  );

  const handleCreateException = useCallback(async () => {
    if (!exceptionModal || !clientId) {
      return;
    }
    try {
      await createException({
        clientId,
        date: exceptionModal.date,
        is_trainable: false,
        note: exceptionNote.trim() || undefined,
      }).unwrap();
      showSuccess("Día marcado como descanso (no entrenable).");
    } catch (err) {
      showError(getMutationErrorMessage(err));
    } finally {
      setExceptionModal(null);
    }
  }, [exceptionModal, clientId, exceptionNote, createException, showSuccess, showError]);

  const pickRangeWeekCount =
    form.startDate && form.endDate
      ? getBlockCalendarWeekCount(form.startDate, form.endDate)
      : null;

  const calendarFormState = useMemo((): typeof form => {
    if (isPickingPhaseRange) {
      return form;
    }
    return {
      ...form,
      phase: "idle" as const,
      startDate: null,
      endDate: null,
    };
  }, [form, isPickingPhaseRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    const isNotFound =
      error &&
      typeof error === "object" &&
      (("status" in error && (error.status === 404 || error.status === "PARSING_ERROR")) ||
        getMutationErrorMessage(error).toLowerCase().includes("not found"));
    return (
      <Alert
        variant="error"
        title={
          isNotFound
            ? "El plan de entrenamiento no existe o ha sido eliminado."
            : "Error al cargar los bloques de periodización"
        }
        description={
          isNotFound ? undefined : getMutationErrorMessage(error)
        }
      />
    );
  }

  if (isBlockWeeksManage && blockWeeksId != null) {
    const weeksBlock = blocks.find((block) => block.id === blockWeeksId);
    if (!weeksBlock) {
      return (
        <ResourceQueryState
          error={{ status: 404 }}
          resource="block"
          fallbackPath={`/dashboard/clients/${clientId}?tab=planning`}
          primaryAction={
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="min-h-touch-athlete w-full"
              onClick={handleExitBlockWeeks}
            >
              Volver a planificación
            </Button>
          }
        />
      );
    }
    return (
      <BlockWeeksManageSurface
        planId={planId}
        block={weeksBlock}
        clientProfile={clientProfile ?? null}
        patternsCatalog={patternsCatalog ?? []}
        patternsLoading={isLoadingPatterns}
        patternsError={isErrorPatterns}
        onExit={handleExitBlockWeeks}
      />
    );
  }

  if (isDapAuthoring && blockAuthorParams.mode) {
    if (
      blockAuthorParams.mode === "create" &&
      (!blockAuthorParams.blockStart || !blockAuthorParams.blockEnd)
    ) {
      return (
        <Alert
          variant="warning"
          title="Faltan fechas del bloque en la URL."
          action={
            <Button
              type="button"
              variant="ghost-primary"
              size="sm"
              onClick={handleExitBlockAuthoring}
            >
              Volver a planificación
            </Button>
          }
        />
      );
    }
    if (blockAuthorParams.mode === "edit" && blockAuthorParams.blockId == null) {
      return (
        <Alert
          variant="warning"
          title="Falta el identificador del bloque."
          action={
            <Button
              type="button"
              variant="ghost-primary"
              size="sm"
              onClick={handleExitBlockAuthoring}
            >
              Volver a planificación
            </Button>
          }
        />
      );
    }

    return (
      <PlanBlockAuthoringSurface
        mode={blockAuthorParams.mode}
        clientId={clientId!}
        planId={planId}
        blockId={blockAuthorParams.blockId}
        blockStart={blockAuthorParams.blockStart}
        blockEnd={blockAuthorParams.blockEnd}
        blocks={blocks}
        catalog={catalog}
        planStartDate={planStartDate}
        planEndDate={planEndDate}
        clientProfile={clientProfile}
        activePlan={activePlan}
        planGoalForRecommendations={planGoalForRecommendations}
        onAuthoringChange={onAuthoringChange}
        onExit={handleExitBlockAuthoring}
        onCreateSuccess={handleBlockCreated}
      />
    );
  }

  return (
    <>
      <PlanningExploreShell
        planId={planId}
        blocks={blocks}
        catalog={catalog}
        phaseSessionCountByBlock={phaseSessionCountByBlock}
        activePlan={activePlan}
        clientId={clientId}
        planStartDate={planStartDate}
        planEndDate={planEndDate}
        trainingFrequencyLabel={trainingFrequencyLabel}
        calMonth={calMonth}
        onMonthChange={setCalMonth}
        sessionDates={sessionDates}
        exceptionDates={exceptionDates}
        structurePendingDates={structurePendingDates}
        calendarFormState={calendarFormState}
        isPickingPhaseRange={isPickingPhaseRange}
        weekCount={pickRangeWeekCount}
        onContinueRange={handleContinueCreateRange}
        canContinueRange={continueRangeDisabledReason == null}
        continueRangeDisabledReason={continueRangeDisabledReason}
        habitualTrainingDays={clientProfile?.training_days ?? null}
        onDayClick={handleCalendarDayClick}
        onDayRightClick={handleDayContextMenu}
        onAddPhase={handleStartCreateBlock}
        onEditBlock={handleEditBlockNavigate}
        onViewWeeks={handleViewWeeks}
        onDeleteBlock={blockRemoval.requestRemoval}
        onCreateSessionForBlock={handleCreateSessionForBlock}
        focusedBlockId={focusedBlockId}
        onFocusBlock={handleFocusBlock}
        structureDriftByBlockId={structureDriftByBlockId}
        buildVolumeContext={(volumeLevel, intensityLevel) =>
          volumeNominal.buildContext(
            volumeLevel ?? 5,
            intensityLevel ?? 5,
          )
        }
        volumeIntensityPhase={volumeNominal.phase}
        showOtherPlansAction={showOtherPlansAction}
        onOpenOtherPlans={onOpenOtherPlans}
        structureCoverageBlockId={structureCoverageBlockId}
        structureCoverageIncomplete={structureCoverageIncomplete}
        structureCoverageWeeklyStructurePath={structureCoverageWeeklyStructurePath}
      />

      <NexiaPremiumConfirmModal
        isOpen={blockRemoval.isOpen}
        onClose={blockRemoval.cancel}
        onConfirm={() => void blockRemoval.confirm()}
        title={
          blockRemoval.copy?.title ??
          (blockRemoval.isPreviewLoading ? "Comprobando bloque…" : "")
        }
        description={blockRemoval.copy?.description}
        confirmLabel={blockRemoval.copy?.confirmLabel ?? "Eliminar bloque"}
        loadingConfirmLabel={
          blockRemoval.copy?.loadingConfirmLabel ?? "Comprobando…"
        }
        confirmVariant={blockRemoval.copy?.confirmVariant ?? "destructive"}
        isLoading={blockRemoval.isLoading}
        data-testid="period-block-removal-modal"
      />

      {exceptionModal != null && (
        <DayExceptionRestModal
          date={exceptionModal.date}
          note={exceptionNote}
          onNoteChange={setExceptionNote}
          onCancel={() => setExceptionModal(null)}
          onConfirm={handleCreateException}
          isSaving={isCreatingException}
        />
      )}
    </>
  );
};
