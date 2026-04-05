import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPhysicalQualitiesQuery } from "@nexia/shared/api/catalogsApi";
import {
  useGetPeriodBlocksQuery,
  useCreatePeriodBlockMutation,
  useDeletePeriodBlockMutation,
} from "@nexia/shared/api/periodBlocksApi";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { PeriodizationCalendar } from "./PeriodizationCalendar";
import { PeriodizationPanel } from "./PeriodizationPanel";
import { PeriodBlockCard } from "./PeriodBlockCard";
import { PeriodizationCharts } from "./PeriodizationCharts";
import { usePeriodBlockForm } from "./usePeriodBlockForm";

interface Props {
  planId: number;
}

export const PlanPeriodizationSection: React.FC<Props> = ({ planId }) => {
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

  const [createBlock, { isLoading: isCreating }] = useCreatePeriodBlockMutation();
  const [deleteBlock, { isLoading: isDeleting }] = useDeletePeriodBlockMutation();

  const {
    form,
    handleDayClick,
    addQuality,
    removeQuality,
    updateQualityPct,
    setVolumeLevel,
    setIntensityLevel,
    reset,
    qualitiesSum,
    overlapDetected,
    canSubmit,
  } = usePeriodBlockForm(blocks);

  const handleCreate = useCallback(async () => {
    if (!form.startDate || !form.endDate) return;
    try {
      await createBlock({
        planId,
        data: {
          start_date: form.startDate,
          end_date: form.endDate,
          volume_level: form.volumeLevel,
          intensity_level: form.intensityLevel,
          qualities: form.qualities,
        },
      }).unwrap();
      reset();
    } catch {
      /* RTK Query shows error via hook; could add toast here */
    }
  }, [form, planId, createBlock, reset]);

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
        Error al cargar los bloques de periodización:{" "}
        {error && typeof error === "object" && "data" in error
          ? String((error as { data?: unknown }).data)
          : "Error desconocido"}
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
            formState={form}
            onDayClick={handleDayClick}
          />
        </div>
        <div className="lg:w-[40%]">
          <PeriodizationPanel
            formState={form}
            catalog={catalog}
            qualitiesSum={qualitiesSum}
            overlapDetected={overlapDetected}
            canSubmit={canSubmit}
            isCreating={isCreating}
            onAddQuality={addQuality}
            onRemoveQuality={removeQuality}
            onUpdateQualityPct={updateQualityPct}
            onVolumeChange={setVolumeLevel}
            onIntensityChange={setIntensityLevel}
            onSubmit={handleCreate}
            onReset={reset}
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
                onDelete={(id, label) => setDeleteTarget({ id, label })}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-border/60 p-8 flex flex-col items-center justify-center text-center space-y-2">
            <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm text-muted-foreground">
              No hay bloques de periodización configurados.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Selecciona un rango de fechas en el calendario para crear el primer bloque.
            </p>
          </div>
        )}
      </div>

      {/* Progression charts */}
      {blocks.length > 0 && (
        <PeriodizationCharts blocks={blocks} catalog={catalog} />
      )}

      {/* Delete confirmation modal */}
      <BaseModal
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar bloque"
        description={`¿Seguro que quieres eliminar el bloque "${deleteTarget?.label ?? ""}"? Esta acción no se puede deshacer.`}
        iconType="danger"
      >
        <div className="flex gap-3 justify-center">
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
      </BaseModal>
    </section>
  );
};
