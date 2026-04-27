import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Target } from "lucide-react";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
  useGetPeriodBlocksQuery,
  useCreatePeriodBlockMutation,
  useUpdatePeriodBlockMutation,
  useDeletePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import { useGetTrainingSessionsQuery } from "@nexia/shared/api/trainingSessionsApi";
import { useGetMovementPatternsQuery } from "@nexia/shared/api/exercisesApi";
import {
  useGetWeeklyStructureQuery,
  useCreateWeeklyStructureWeekMutation,
  useDeleteWeeklyStructureWeekMutation,
} from "@nexia/shared/api/weeklyStructureApi";
import {
  useGetDayExceptionsQuery,
  useCreateDayExceptionMutation,
  useDeleteDayExceptionMutation,
} from "@nexia/shared/api/dayExceptionsApi";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";
import { getMutationErrorMessage } from "@nexia/shared";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { isDateInRange } from "@nexia/shared/utils/periodBlockOverlap";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { GOAL_LABEL_ES, toneFromGoal } from "@/components/trainingPlans/goalLabels";
import { Button } from "@/components/ui/buttons";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { PeriodizationPanel } from "./PeriodizationPanel";
import { PeriodBlockCard } from "./PeriodBlockCard";
import { PeriodizationCharts } from "./PeriodizationCharts";
import { PeriodBlockEmptyCallout } from "./PeriodBlockEmptyCallout";
import { usePeriodBlockForm } from "./usePeriodBlockForm";
import { usePeriodizationVolumeRecommendations } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

// ---------------------------------------------------------------------------
// Helpers — plan summary card
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "Pausado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-warning/10 text-warning border-warning/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function durationLabel(start: string, end: string): string {
  const ms =
    new Date(end.replace(/-/g, "/")).getTime() -
    new Date(start.replace(/-/g, "/")).getTime();
  const weeks = Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
  if (weeks < 4) return `${weeks} sem`;
  const months = Math.floor(weeks / 4);
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

// ---------------------------------------------------------------------------

/**
 * Primer día YYYY-MM-DD del bloque sin sesión ya asignada en ese día (mismo bloque).
 * Si el rango está lleno, devuelve blockStart (CreateSession puede ajustar manualmente).
 */
function suggestSessionDateForPeriodBlock(
  blockStart: string,
  blockEnd: string,
  sessionsInBlock: TrainingSession[],
): string {
  const used = new Set(
    sessionsInBlock
      .map((s) => s.session_date)
      .filter((d): d is string => typeof d === "string" && d.length > 0),
  );
  const [ys, ms, ds] = blockStart.split("-").map(Number);
  const [ye, me, de] = blockEnd.split("-").map(Number);
  const cursor = new Date(ys, ms - 1, ds);
  const endTime = new Date(ye, me - 1, de).getTime();
  while (cursor.getTime() <= endTime) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");
    const iso = `${y}-${m}-${day}`;
    if (!used.has(iso)) {
      return iso;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return blockStart;
}

interface Props {
  planId: number;
  clientId?: number;
  /** Fechas de vigencia del training plan (YYYY-MM-DD) para pintar el calendario. */
  planStartDate?: string | null;
  planEndDate?: string | null;
  /** Plan activo para mostrar resumen en el panel lateral (opcional). */
  activePlan?: ActivePlanByClientOut;
  /**
   * Objetivo del plan para GET /recommendations (?plan_goal=), cuando no hay `activePlan`
   * (p. ej. edición de plan desde detalle). Debe coincidir con el plan en pantalla.
   */
  planGoalForRecommendations?: string;
}

export const PlanPeriodizationSection: React.FC<Props> = ({
  planId,
  clientId,
  planStartDate,
  planEndDate,
  activePlan,
  planGoalForRecommendations,
}) => {
  const navigate = useNavigate();
  const { showWarning, showSuccess, showError } = useToast();
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

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
    for (const s of sessions) {
      if (s.session_date) set.add(s.session_date);
    }
    return set;
  }, [sessions]);

  const { data: dayExceptions = [] } = useGetDayExceptionsQuery(
    { clientId: clientId! },
    { skip: !clientId }
  );

  const exceptionDates = useMemo(() => {
    const set = new Set<string>();
    for (const ex of dayExceptions) {
      if (!ex.is_trainable) set.add(ex.date);
    }
    return set;
  }, [dayExceptions]);

  const sessionsByBlock = useMemo(() => {
    const map = new Map<number, typeof sessions>();
    for (const s of sessions) {
      if (s.period_block_id != null) {
        const arr = map.get(s.period_block_id) ?? [];
        arr.push(s);
        map.set(s.period_block_id, arr);
      }
    }
    return map;
  }, [sessions]);

  const [createBlock, { isLoading: isCreating }] = useCreatePeriodBlockMutation();
  const [updateBlock, { isLoading: isUpdating }] = useUpdatePeriodBlockMutation();
  const [deleteBlock, { isLoading: isDeleting }] = useDeletePeriodBlockMutation();
  const [createException, { isLoading: isCreatingException }] = useCreateDayExceptionMutation();
  const [removeException] = useDeleteDayExceptionMutation();
  const [editingBlockId, setEditingBlockId] = useState<number | null>(null);
  const [exceptionModal, setExceptionModal] = useState<{ date: string } | null>(null);
  const [exceptionNote, setExceptionNote] = useState("");
  const [hasLoadedWeeklyStructure, setHasLoadedWeeklyStructure] = useState(false);

  const {
    data: patternsCatalog,
    isLoading: isLoadingPatterns,
    isError: isErrorPatterns,
  } = useGetMovementPatternsQuery({ limit: 100, is_active: true });

  const { data: existingStructure } = useGetWeeklyStructureQuery(
    { planId, blockId: editingBlockId! },
    { skip: !editingBlockId }
  );

  const {
    form,
    handleDayClick,
    addQuality,
    removeQuality,
    updateQualityPct,
    setVolumeLevel,
    setIntensityLevel,
    setWeeklyStructure,
    loadBlock,
    reset,
    qualitiesSum,
    overlapDetected,
    outsidePlanBounds,
    canSubmit,
  } = usePeriodBlockForm(blocks, editingBlockId, planStartDate, planEndDate);

  const [createWeek] = useCreateWeeklyStructureWeekMutation();
  const [deleteWeek] = useDeleteWeeklyStructureWeekMutation();

  // Cargar estructura semanal existente al entrar en modo edición (solo una vez)
  useEffect(() => {
    if (!editingBlockId || !existingStructure || hasLoadedWeeklyStructure) return;
    const draft: WeeklyStructureWeekCreate[] = existingStructure.weeks.map((w) => ({
      week_ordinal: w.week_ordinal,
      label: w.label ?? null,
      days: w.days.map((d) => ({
        day_of_week: d.day_of_week,
        patterns: d.patterns.map((p) => ({
          movement_pattern_id: p.movement_pattern_id,
          sub_pattern: p.sub_pattern ?? null,
        })),
      })),
    }));
    setWeeklyStructure(draft);
    setHasLoadedWeeklyStructure(true);
  }, [editingBlockId, existingStructure, hasLoadedWeeklyStructure, setWeeklyStructure]);

  const planGoalResolved =
    activePlan?.display_goal ?? activePlan?.goal ?? planGoalForRecommendations;

  const volumeNominal = usePeriodizationVolumeRecommendations(clientId, planGoalResolved);

  const handleCreateSessionForBlock = useCallback(
    (block: PlanPeriodBlock) => {
      if (clientId != null && clientId > 0) {
        navigate(`/dashboard/clients/${clientId}?tab=sessions`);
        return;
      }
      const blockSessions = sessionsByBlock.get(block.id) ?? [];
      const date = suggestSessionDateForPeriodBlock(
        block.start_date,
        block.end_date,
        blockSessions,
      );
      const params = new URLSearchParams({
        planId: String(planId),
        date,
      });
      navigate(`/dashboard/session-programming/create-session?${params.toString()}`);
    },
    [navigate, planId, clientId, sessionsByBlock],
  );

  const guardedDayClick = useCallback(
    (dateStr: string) => {
      if (planStartDate && planEndDate && !isDateInRange(dateStr, planStartDate, planEndDate)) {
        showWarning("Solo puedes definir bloques dentro de la vigencia del plan.");
        return;
      }
      handleDayClick(dateStr);
    },
    [planStartDate, planEndDate, handleDayClick, showWarning],
  );

  const handleSubmitBlock = useCallback(async () => {
    if (!form.startDate || !form.endDate) return;
    const payload = {
      start_date: form.startDate,
      end_date: form.endDate,
      volume_level: form.volumeLevel,
      intensity_level: form.intensityLevel,
      qualities: form.qualities,
    };
    try {
      if (editingBlockId) {
        await updateBlock({ planId, blockId: editingBlockId, data: payload }).unwrap();
        // Recrear estructura semanal: eliminar semanas existentes y crear las del draft
        if (form.weeklyStructure.length > 0 && existingStructure) {
          const existingWeekIds = existingStructure.weeks
            .map((w) => w.id)
            .filter((id): id is number => id != null);
          await Promise.all(
            existingWeekIds.map((weekId) =>
              deleteWeek({ planId, blockId: editingBlockId, weekId }).unwrap().catch(() => {})
            )
          );
          await Promise.all(
            form.weeklyStructure.map((week) =>
              createWeek({ planId, blockId: editingBlockId, body: week }).unwrap()
            )
          );
        }
        setEditingBlockId(null);
        setHasLoadedWeeklyStructure(false);
        showSuccess("Bloque de periodización actualizado correctamente.");
      } else {
        const created = await createBlock({ planId, data: payload }).unwrap();
        if (form.weeklyStructure.length > 0 && created?.id) {
          try {
            await Promise.all(
              form.weeklyStructure.map((week) =>
                createWeek({ planId, blockId: created.id, body: week }).unwrap()
              )
            );
          } catch {
            showError(
              "Bloque creado, pero la estructura semanal no se pudo guardar. " +
                "Puedes configurarla desde la tarjeta del bloque."
            );
            reset();
            return;
          }
        }
        showSuccess("Bloque de periodización creado correctamente.");
      }
      reset();
    } catch (err) {
      showError(getMutationErrorMessage(err));
    }
  }, [
    form,
    planId,
    editingBlockId,
    existingStructure,
    createBlock,
    updateBlock,
    createWeek,
    deleteWeek,
    reset,
    showSuccess,
    showError,
  ]);

  const handleEditBlock = useCallback((block: PlanPeriodBlock) => {
    setEditingBlockId(block.id);
    setHasLoadedWeeklyStructure(false);
    loadBlock(block);
  }, [loadBlock]);

  const handleCancelEdit = useCallback(() => {
    setEditingBlockId(null);
    setHasLoadedWeeklyStructure(false);
    reset();
  }, [reset]);

  const handleDayContextMenu = useCallback((dateStr: string) => {
    if (form.phase !== "idle") return;
    if (!clientId) return;
    const existing = dayExceptions.find((ex) => ex.date === dateStr && !ex.is_trainable);
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
  }, [form.phase, clientId, dayExceptions, removeException, showSuccess, showError]);

  const handleCreateException = useCallback(async () => {
    if (!exceptionModal || !clientId) return;
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
    if (!deleteTarget) return;
    try {
      await deleteBlock({ planId, blockId: deleteTarget.id }).unwrap();
      showSuccess("Bloque de periodización eliminado.");
    } catch (err) {
      showError(getMutationErrorMessage(err));
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, planId, deleteBlock, showSuccess, showError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error">
        Error al cargar los bloques de periodización: {getMutationErrorMessage(error)}
      </Alert>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle titleAs="h3" title="Editor de periodización del plan" />
        <button
          type="button"
          onClick={() => navigate(`/dashboard/training-plans/${planId}`)}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          Ver plan completo
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </button>
      </div>

      {/* Calendar + Panel grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-[60%]">
          <PeriodizationCalendar
            currentMonth={calMonth}
            onMonthChange={setCalMonth}
            blocks={blocks}
            planStartDate={planStartDate}
            planEndDate={planEndDate}
            sessionDates={sessionDates}
            exceptionDates={exceptionDates}
            formState={form}
            onDayClick={guardedDayClick}
            onDayRightClick={handleDayContextMenu}
            habitualTrainingDays={clientProfile?.training_days ?? null}
          />
        </div>
        <div className="lg:w-[40%] space-y-4">
          {activePlan && (
            <div className="rounded-lg border border-border bg-surface p-5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Plan activo
                  </p>
                  <h4 className="text-sm font-bold text-foreground mt-0.5 truncate">
                    {activePlan.display_name || activePlan.name}
                  </h4>
                </div>
                <span
                  className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[activePlan.status] ?? "bg-muted text-muted-foreground border-border"}`}
                >
                  {STATUS_LABELS[activePlan.status] ?? activePlan.status}
                </span>
              </div>

              {(() => {
                const goalKey = activePlan.display_goal ?? activePlan.goal;
                const label = GOAL_LABEL_ES[goalKey] ?? goalKey;
                const tone = toneFromGoal(goalKey);
                return label ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${tone}`}>
                    <Target className="h-3 w-3 shrink-0" aria-hidden />
                    {label}
                  </span>
                ) : null;
              })()}

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  {formatDateShort(activePlan.start_date)} – {formatDateShort(activePlan.end_date)}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span>{durationLabel(activePlan.start_date, activePlan.end_date)}</span>
              </div>
            </div>
          )}
          <PeriodizationPanel
            formState={form}
            catalog={catalog}
            qualitiesSum={qualitiesSum}
            overlapDetected={overlapDetected}
            outsidePlanBounds={outsidePlanBounds}
            canSubmit={canSubmit}
            onAddQuality={addQuality}
            onRemoveQuality={removeQuality}
            onUpdateQualityPct={updateQualityPct}
            onVolumeChange={setVolumeLevel}
            onIntensityChange={setIntensityLevel}
            isEditing={!!editingBlockId}
            isSubmitting={isCreating || isUpdating}
            onSubmit={handleSubmitBlock}
            onReset={handleCancelEdit}
            volumeNominalPhase={volumeNominal.phase}
            volumeNominalLabel={volumeNominal.labelForVolumeLevel(form.volumeLevel)}
            volumeNominalHint={volumeNominal.auxiliaryHint}
            trainingDays={clientProfile?.training_days ?? null}
            patternsCatalog={patternsCatalog ?? []}
            patternsLoading={isLoadingPatterns}
            patternsError={isErrorPatterns}
            onWeeklyStructureChange={setWeeklyStructure}
          />
        </div>
      </div>

      {/* Configured blocks */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Bloques configurados
        </h4>
        {blocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blocks.map((block) => (
              <PeriodBlockCard
                key={block.id}
                block={block}
                catalog={catalog}
                sessions={sessionsByBlock.get(block.id) ?? []}
                onEdit={handleEditBlock}
                onDelete={(id, label) => setDeleteTarget({ id, label })}
                onCreateSessionForBlock={handleCreateSessionForBlock}
                volumeNominalPhase={volumeNominal.phase}
                volumeNominalLabel={volumeNominal.labelForVolumeLevel(block.volume_level)}
              />
            ))}
          </div>
        ) : (
          <PeriodBlockEmptyCallout
            primaryText="No hay bloques de periodización configurados."
            secondaryText="Selecciona un rango de fechas en el calendario para crear el primer bloque."
          />
        )}
      </div>

      {/* Progression charts */}
      {blocks.length > 0 && (
        <PeriodizationCharts blocks={blocks} catalog={catalog} />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative rounded-lg bg-surface border border-border/50 p-6 shadow-xl w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Day exception modal */}
      {exceptionModal != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExceptionModal(null)} />
          <div className="relative rounded-lg bg-surface border border-border/50 p-6 shadow-xl w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/15 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
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
              <label htmlFor="exception-note" className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Nota (opcional)
              </label>
              <input
                id="exception-note"
                type="text"
                className="w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Ej: Lesión, viaje, descanso programado..."
                value={exceptionNote}
                onChange={(e) => setExceptionNote(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setExceptionModal(null)} disabled={isCreatingException}>
                Cancelar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleCreateException} disabled={isCreatingException}>
                {isCreatingException ? "Guardando…" : "Marcar descanso"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
