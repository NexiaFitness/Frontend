import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
  useGetPeriodBlocksQuery,
  useCreatePeriodBlockMutation,
  useUpdatePeriodBlockMutation,
  useDeletePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import { useGetTrainingSessionsQuery } from "@nexia/shared/api/trainingSessionsApi";
import {
  useGetDayExceptionsQuery,
  useCreateDayExceptionMutation,
  useDeleteDayExceptionMutation,
} from "@nexia/shared/api/dayExceptionsApi";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { getMutationErrorMessage } from "@nexia/shared";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { PeriodizationPanel } from "./PeriodizationPanel";
import { PeriodBlockCard } from "./PeriodBlockCard";
import { PeriodizationCharts } from "./PeriodizationCharts";
import { PeriodBlockEmptyCallout } from "./PeriodBlockEmptyCallout";
import { usePeriodBlockForm } from "./usePeriodBlockForm";

interface Props {
  planId: number;
  clientId?: number;
}

export const PlanPeriodizationSection: React.FC<Props> = ({ planId, clientId }) => {
  const navigate = useNavigate();
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

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

  const {
    form,
    handleDayClick,
    addQuality,
    removeQuality,
    updateQualityPct,
    setVolumeLevel,
    setIntensityLevel,
    loadBlock,
    reset,
    qualitiesSum,
    overlapDetected,
    canSubmit,
  } = usePeriodBlockForm(blocks, editingBlockId);

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
        setEditingBlockId(null);
      } else {
        await createBlock({ planId, data: payload }).unwrap();
      }
      reset();
    } catch {
      /* RTK Query shows error via hook */
    }
  }, [form, planId, editingBlockId, createBlock, updateBlock, reset]);

  const handleEditBlock = useCallback((block: PlanPeriodBlock) => {
    setEditingBlockId(block.id);
    loadBlock(block);
  }, [loadBlock]);

  const handleCancelEdit = useCallback(() => {
    setEditingBlockId(null);
    reset();
  }, [reset]);

  const handleDayContextMenu = useCallback((dateStr: string) => {
    if (form.phase !== "idle") return;
    if (!clientId) return;
    const existing = dayExceptions.find((ex) => ex.date === dateStr && !ex.is_trainable);
    if (existing) {
      removeException({ clientId, date: dateStr });
      return;
    }
    setExceptionNote("");
    setExceptionModal({ date: dateStr });
  }, [form.phase, clientId, dayExceptions, removeException]);

  const handleCreateException = useCallback(async () => {
    if (!exceptionModal || !clientId) return;
    try {
      await createException({
        clientId,
        date: exceptionModal.date,
        is_trainable: false,
        note: exceptionNote.trim() || undefined,
      }).unwrap();
    } catch {
      /* RTK Query handles */
    } finally {
      setExceptionModal(null);
    }
  }, [exceptionModal, clientId, exceptionNote, createException]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlock({ planId, blockId: deleteTarget.id }).unwrap();
    } catch {
      /* handled by RTK Query */
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, planId, deleteBlock]);

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
        <h3 className="text-base font-semibold text-foreground">
          Editor de periodización del plan
        </h3>
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
            sessionDates={sessionDates}
            exceptionDates={exceptionDates}
            formState={form}
            onDayClick={handleDayClick}
            onDayRightClick={handleDayContextMenu}
          />
        </div>
        <div className="lg:w-[40%]">
          <PeriodizationPanel
            formState={form}
            catalog={catalog}
            qualitiesSum={qualitiesSum}
            overlapDetected={overlapDetected}
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
