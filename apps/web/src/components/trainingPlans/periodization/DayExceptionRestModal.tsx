/**
 * DayExceptionRestModal.tsx — Ventana «Marcar descanso» (día no entrenable) del hub de planificación.
 *
 * Contexto: extraída sin cambios de lógica ni de aspecto de PlanPeriodizationSection.tsx
 * (límite agent.md §7.1, Hito 2 de docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/).
 * Notas de mantenimiento: overlay hecho a mano heredado; migrar a la superficie premium
 * queda en el backlog (06_BACKLOG_PENDIENTES.md). Estado y red viven en el padre.
 *
 * @author Frontend Team
 * @since v9.3.0
 */

import React from "react";

import { Button } from "@/components/ui/buttons";

interface DayExceptionRestModalProps {
  date: string;
  note: string;
  onNoteChange: (note: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isSaving: boolean;
}

export const DayExceptionRestModal: React.FC<DayExceptionRestModalProps> = ({
  date,
  note,
  onNoteChange,
  onCancel,
  onConfirm,
  isSaving,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
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
              {date} — no entrenable
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
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
          >
            {isSaving ? "Guardando…" : "Marcar descanso"}
          </Button>
        </div>
      </div>
    </div>
);
