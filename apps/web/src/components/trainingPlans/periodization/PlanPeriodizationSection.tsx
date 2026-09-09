import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
  useGetPeriodBlocksQuery,
  useDeletePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
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
import { Button } from "@/components/ui/buttons";
import { usePeriodBlockForm } from "./usePeriodBlockForm";
import { usePeriodizationVolumeRecommendations } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";
import { PlanBlockAuthoringSurface } from "./PlanBlockAuthoringSurface";
import { BlockWeeksManageSurface } from "./BlockWeeksManageSurface";
import { PlanningExploreShell } from "./PlanningExploreShell";
import { PlanningCreateWhenShell } from "./PlanningCreateWhenShell";
import { buildBlockAuthorPath } from "@/lib/trainingPlanNavigation";
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
  findBlockContainingDate,
  resolveInitialSelectedBlockId,
} from "./planningShellUtils";

function formatDateFriendly(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

interface Props {
  planId: number;
  clientId?: number;
  planStartDate?: string | null;
  planEndDate?: string | null;
  activePlan?: ActivePlanByClientOut;
  planGoalForRecommendations?: string;
  onAuthoringChange?: (active: boolean) => void;
}

export const PlanPeriodizationSection: React.FC<Props> = ({
  planId,
  clientId,
  planStartDate,
  planEndDate,
  activePlan,
  planGoalForRecommendations,
  onAuthoringChange,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const isExplicitCreateWhen = isPlanningCreateWhenMode(searchParams);

  const { showWarning, showSuccess, showError } = useToast();
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
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
  const isFirstBlockFlow = blocks.length === 0;
  const isCreateWhen = isExplicitCreateWhen || isFirstBlockFlow;
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

  const sessionsByBlock = useMemo(() => {
    const map = new Map<number, typeof sessions>();
    for (const session of sessions) {
      if (session.period_block_id != null) {
        const arr = map.get(session.period_block_id) ?? [];
        arr.push(session);
        map.set(session.period_block_id, arr);
      }
    }
    return map;
  }, [sessions]);

  const [deleteBlock, { isLoading: isDeleting }] = useDeletePeriodBlockMutation();
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
    setSelectedBlockId((prev) => {
      if (blocks.length === 0) {
        return null;
      }
      if (prev != null && blocks.some((block) => block.id === prev)) {
        return prev;
      }
      return resolveInitialSelectedBlockId(blocks);
    });
  }, [blocks]);

  useEffect(() => {
    if (isCreateWhen) {
      reset();
    }
  }, [isCreateWhen, reset]);

  useEffect(() => {
    onAuthoringChange?.(
      isDapAuthoring ||
        isBlockWeeksManage ||
        isCreateWhen,
    );
  }, [
    isDapAuthoring,
    isBlockWeeksManage,
    isCreateWhen,
    onAuthoringChange,
  ]);

  const navigateToClientPlanning = useCallback(
    (nextParams: URLSearchParams) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      navigate(`/dashboard/clients/${clientId}?${nextParams.toString()}`, {
        replace: true,
      });
    },
    [clientId, navigate],
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
    reset();
    const next = applyPlanningModeCreateBlock(searchParams);
    navigateToClientPlanning(next);
  }, [reset, searchParams, navigateToClientPlanning]);

  const handleCancelCreateWhen = useCallback(() => {
    reset();
    const next = clearPlanningMode(searchParams);
    navigateToClientPlanning(next);
  }, [reset, searchParams, navigateToClientPlanning]);

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

  const handleCreateSessionForBlock = useCallback(
    (block: PlanPeriodBlock) => {
      if (clientId == null || clientId <= 0) {
        return;
      }
      const params = new URLSearchParams({
        tab: "sessions",
        month: block.start_date,
      });
      navigate(`/dashboard/clients/${clientId}?${params.toString()}`);
    },
    [navigate, clientId],
  );

  const handleExploreDayClick = useCallback(
    (dateStr: string) => {
      const block = findBlockContainingDate(blocks, dateStr);
      if (block) {
        setSelectedBlockId(block.id);
      }
    },
    [blocks],
  );

  const handleCreateWhenDayClick = useCallback(
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

  const handleDayContextMenu = useCallback(
    (dateStr: string) => {
      if (isCreateWhen && form.phase !== "idle") {
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
      isCreateWhen,
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

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }
    const blockId = deleteTarget.id;
    try {
      await deleteBlock({ planId, blockId }).unwrap();
      setDeleteTarget(null);
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
      showSuccess("Bloque de periodización eliminado.");
    } catch (err) {
      showError(getMutationErrorMessage(err));
    }
  }, [deleteTarget, planId, deleteBlock, selectedBlockId, showSuccess, showError]);

  const createWhenWeekCount =
    form.startDate && form.endDate
      ? getBlockCalendarWeekCount(form.startDate, form.endDate)
      : null;

  const exploreFormState = useMemo(
    () => ({
      ...form,
      phase: "idle" as const,
      startDate: null,
      endDate: null,
    }),
    [form],
  );

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
      <Alert variant="error">
        {isNotFound
          ? "El plan de entrenamiento no existe o ha sido eliminado."
          : `Error al cargar los bloques de periodización: ${getMutationErrorMessage(error)}`}
      </Alert>
    );
  }

  if (isBlockWeeksManage && blockWeeksId != null) {
    const weeksBlock = blocks.find((block) => block.id === blockWeeksId);
    if (!weeksBlock) {
      return (
        <Alert variant="warning">
          No se encontró el bloque solicitado.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={handleExitBlockWeeks}
          >
            Volver a planificación
          </button>
        </Alert>
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
        <Alert variant="warning">
          Faltan fechas del bloque en la URL.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={handleExitBlockAuthoring}
          >
            Volver a planificación
          </button>
        </Alert>
      );
    }
    if (blockAuthorParams.mode === "edit" && blockAuthorParams.blockId == null) {
      return (
        <Alert variant="warning">
          Falta el identificador del bloque.{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={handleExitBlockAuthoring}
          >
            Volver a planificación
          </button>
        </Alert>
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
      />
    );
  }

  let shellContent: React.ReactNode;

  if (isCreateWhen) {
    shellContent = (
      <PlanningCreateWhenShell
        variant={isFirstBlockFlow ? "firstBlock" : "addPhase"}
        blocks={blocks}
        activePlan={activePlan}
        planStartDate={planStartDate}
        planEndDate={planEndDate}
        trainingFrequencyLabel={trainingFrequencyLabel}
        calMonth={calMonth}
        onMonthChange={setCalMonth}
        sessionDates={sessionDates}
        exceptionDates={exceptionDates}
        formState={form}
        weekCount={createWhenWeekCount}
        habitualTrainingDays={clientProfile?.training_days ?? null}
        onDayClick={handleCreateWhenDayClick}
        onCancel={handleCancelCreateWhen}
        onContinueRange={handleContinueCreateRange}
        canContinueRange={continueRangeDisabledReason == null}
        continueRangeDisabledReason={continueRangeDisabledReason}
      />
    );
  } else {
    shellContent = (
      <PlanningExploreShell
        blocks={blocks}
        catalog={catalog}
        selectedBlockId={selectedBlockId}
        sessionsByBlock={sessionsByBlock}
        activePlan={activePlan}
        planStartDate={planStartDate}
        planEndDate={planEndDate}
        trainingFrequencyLabel={trainingFrequencyLabel}
        calMonth={calMonth}
        onMonthChange={setCalMonth}
        sessionDates={sessionDates}
        exceptionDates={exceptionDates}
        formState={exploreFormState}
        habitualTrainingDays={clientProfile?.training_days ?? null}
        onDayClick={handleExploreDayClick}
        onDayRightClick={handleDayContextMenu}
        onSelectBlock={setSelectedBlockId}
        onAddPhase={handleStartCreateBlock}
        onEditBlock={handleEditBlockNavigate}
        onViewWeeks={handleViewWeeks}
        onDeleteBlock={(id, label) => setDeleteTarget({ id, label })}
        onCreateSessionForBlock={handleCreateSessionForBlock}
        buildVolumeContext={(volumeLevel, intensityLevel) =>
          volumeNominal.buildContext(
            volumeLevel ?? 5,
            intensityLevel ?? 5,
          )
        }
        volumeIntensityPhase={volumeNominal.phase}
      />
    );
  }

  return (
    <>
      {shellContent}

      {deleteTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative rounded-lg bg-surface border border-border/50 p-6 shadow-xl w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-destructive"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Eliminar bloque</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ¿Eliminar &quot;{deleteTarget.label}&quot;? No se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {exceptionModal != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setExceptionModal(null)}
          />
          <div className="relative rounded-lg bg-surface border border-border/50 p-6 shadow-xl w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
                <svg
                  className="h-5 w-5 text-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Marcar descanso</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {exceptionModal.date} — no entrenable
                </p>
              </div>
            </div>
            <div>
              <label
                htmlFor="exception-note"
                className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5"
              >
                Nota (opcional)
              </label>
              <input
                id="exception-note"
                type="text"
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]"
                placeholder="Ej: Lesión, viaje, descanso programado..."
                value={exceptionNote}
                onChange={(e) => setExceptionNote(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExceptionModal(null)}
                disabled={isCreatingException}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCreateException}
                disabled={isCreatingException}
              >
                {isCreatingException ? "Guardando…" : "Marcar descanso"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
