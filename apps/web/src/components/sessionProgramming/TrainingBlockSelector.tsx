/**
 * TrainingBlockSelector.tsx — Selector de tipos de bloque de entrenamiento
 *
 * Card con cabecera y fila de chips (predefinidos + custom). Al hacer click en un bloque
 * pasa a activo; la siguiente fila del Constructor usará ese bloque.
 * "+ Bloque Personalizado" abre flujo para crear nuevo tipo.
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md §15.2 — diseño Lovable con tokens agent.md
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/forms";
import {
    SESSION_PROGRAMMING_BLOCK_ADD_BTN,
    SESSION_PROGRAMMING_PANEL,
    SESSION_PROGRAMMING_PANEL_BODY,
    SESSION_PROGRAMMING_PANEL_TITLE,
    sessionProgrammingBlockChipClass,
} from "./sessionProgrammingPresentation";
import {
    useGetTrainingBlockTypesQuery,
    useCreateTrainingBlockTypeMutation,
} from "@nexia/shared/api/sessionProgrammingApi";
import type { TrainingBlockType } from "@nexia/shared/types/sessionProgramming";

/** Traducción de nombres predefinidos (backend en inglés) */
const BLOCK_TYPE_TRANSLATIONS: Record<string, string> = {
    "Warm Up": "Calentamiento",
    Core: "Core",
    Conditioning: "Acondicionamiento",
    "Maximum Strength": "Fuerza Máxima",
    "Strength-Speed": "Fuerza-Velocidad",
    "Hypertrophy Strength": "Hipertrofia",
    Plyometrics: "Pliometría",
    "Intensive Aerobic": "Aeróbico Intensivo",
    "Extensive Aerobic": "Aeróbico Extensivo",
};

function getDisplayName(bt: TrainingBlockType): string {
    return BLOCK_TYPE_TRANSLATIONS[bt.name] ?? bt.name;
}

export interface TrainingBlockSelectorProps {
    /** IDs de bloques que tienen series en la sesión (marcados) */
    selectedBlockTypeIds: number[];
    /** Callback al hacer clic en un bloque — añade el bloque a la sesión */
    onSelect: (blockTypeId: number) => void;
    /** Clase CSS adicional */
    className?: string;
}

export const TrainingBlockSelector: React.FC<TrainingBlockSelectorProps> = ({
    selectedBlockTypeIds,
    onSelect,
    className,
}) => {
    const [customName, setCustomName] = useState("");
    const [showCustomInput, setShowCustomInput] = useState(false);

    const { data: blockTypes = [], isLoading } = useGetTrainingBlockTypesQuery({
        skip: 0,
        limit: 100,
    });
    const [createBlockType, { isLoading: isCreating }] =
        useCreateTrainingBlockTypeMutation();

    const handleCreateCustom = async () => {
        const name = customName.trim();
        if (!name) return;
        try {
            const created = await createBlockType({ name }).unwrap();
            setCustomName("");
            setShowCustomInput(false);
            onSelect(created.id);
        } catch {
            // Error manejado por toast en parent si se desea
        }
    };

    const handleCancelCustom = () => {
        setCustomName("");
        setShowCustomInput(false);
    };

    if (isLoading) {
        return (
            <div className={cn(SESSION_PROGRAMMING_PANEL, "p-4 sm:p-5", className)}>
                <div className="mb-3 h-4 w-40 animate-pulse rounded bg-muted/50" />
                <div className="flex flex-wrap gap-2">
                    <div className="h-9 w-24 animate-pulse rounded-md bg-muted/50 sm:h-7" />
                    <div className="h-9 w-28 animate-pulse rounded-md bg-muted/50 sm:h-7" />
                    <div className="h-9 w-32 animate-pulse rounded-md bg-muted/50 sm:h-7" />
                </div>
            </div>
        );
    }

    return (
        <div className={cn(SESSION_PROGRAMMING_PANEL, className)}>
            <div className={cn(SESSION_PROGRAMMING_PANEL_BODY, "space-y-4 !py-4 sm:!py-5")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className={SESSION_PROGRAMMING_PANEL_TITLE}>
                    Bloques de Entrenamiento
                </h3>
                {!showCustomInput && (
                    <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className={SESSION_PROGRAMMING_BLOCK_ADD_BTN}
                    >
                        + Bloque Personalizado
                    </button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {blockTypes.map((bt) => (
                    <button
                        key={bt.id}
                        type="button"
                        onClick={() => onSelect(bt.id)}
                        className={sessionProgrammingBlockChipClass(selectedBlockTypeIds.includes(bt.id))}
                    >
                        {getDisplayName(bt)}
                    </button>
                ))}
            </div>

            {showCustomInput && (
                <div className="flex flex-col gap-2 rounded-md border border-border/70 bg-surface/40 p-2 sm:flex-row sm:items-center">
                    <Input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nombre del bloque"
                        className="h-9 w-full text-xs sm:h-7 sm:w-36"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateCustom();
                            if (e.key === "Escape") handleCancelCustom();
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleCreateCustom}
                        disabled={!customName.trim() || isCreating}
                        className="min-h-touch rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:min-h-0 sm:h-7"
                    >
                        {isCreating ? "..." : "Crear"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelCustom}
                        className="min-h-touch rounded-md border border-border bg-surface px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 sm:min-h-0 sm:h-7"
                    >
                        Cancelar
                    </button>
                </div>
            )}
            </div>
        </div>
    );
};
