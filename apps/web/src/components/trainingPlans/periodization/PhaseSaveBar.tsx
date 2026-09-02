/**
 * PhaseSaveBar.tsx — Acciones primarias del constructor de fase (F2 D-SAF).
 *
 * Contexto: fila Guardar/Cancelar dentro del shell de autoría; el padre controla
 * canSave, isSubmitting y callbacks de persistencia.
 *
 * Notas de mantenimiento: no incluir lógica de validación de fase; solo presentación
 * y disparo de handlers. Etiquetas difieren crear vs editar según isEditing.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import React from "react";

import { Button } from "@/components/ui/buttons";

interface Props {
    isEditing: boolean;
    isSubmitting: boolean;
    canSave: boolean;
    onSubmit: () => void;
    onCancel: () => void;
}

export const PhaseSaveBar: React.FC<Props> = ({
    isEditing,
    isSubmitting,
    canSave,
    onSubmit,
    onCancel,
}) => (
    <div className="flex gap-2 pt-1 shrink-0">
        <Button
            type="button"
            variant="primary"
            className="flex-1"
            disabled={!canSave || isSubmitting}
            onClick={onSubmit}
        >
            {isSubmitting
                ? "Guardando…"
                : isEditing
                  ? "Guardar fase"
                  : "Crear fase"}
        </Button>
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Cancelar"
            className="shrink-0 text-muted-foreground hover:text-destructive"
        >
            <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 6L6 18M6 6l12 12"
                />
            </svg>
        </Button>
    </div>
);
