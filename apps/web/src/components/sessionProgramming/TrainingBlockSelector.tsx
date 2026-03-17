/**
 * TrainingBlockSelector.tsx — Selector de tipos de bloque de entrenamiento
 *
 * Fila horizontal de chips/botones con los tipos de bloque (predefinidos + custom).
 * Último botón: "+ Bloque Personalizado" para crear nuevo tipo inline.
 *
 * @spec IMPL_CREATE_EDIT_SESSION.md — Fase 3
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/forms";
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
    /** ID del bloque actualmente seleccionado */
    activeBlockTypeId: number | null;
    /** Callback al seleccionar un bloque */
    onSelect: (blockTypeId: number | null) => void;
    /** Clase CSS adicional */
    className?: string;
}

export const TrainingBlockSelector: React.FC<TrainingBlockSelectorProps> = ({
    activeBlockTypeId,
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
            <div className={cn("flex flex-wrap gap-2", className)}>
                <div className="h-9 w-24 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-9 w-28 rounded-md bg-muted/50 animate-pulse" />
                <div className="h-9 w-32 rounded-md bg-muted/50 animate-pulse" />
            </div>
        );
    }

    return (
        <div className={cn("flex flex-wrap gap-2", className)}>
            {blockTypes.map((bt) => (
                <button
                    key={bt.id}
                    type="button"
                    onClick={() => onSelect(activeBlockTypeId === bt.id ? null : bt.id)}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium border transition-colors",
                        activeBlockTypeId === bt.id
                            ? "bg-primary/20 text-primary border-primary"
                            : "bg-surface text-muted-foreground border-border hover:bg-muted/50"
                    )}
                >
                    {getDisplayName(bt)}
                </button>
            ))}

            {showCustomInput ? (
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nombre del bloque"
                        className="w-40 h-9 text-sm"
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
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isCreating ? "..." : "Crear"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelCustom}
                        className="px-3 py-1.5 rounded-md text-sm font-medium bg-surface text-muted-foreground border border-border hover:bg-muted/50"
                    >
                        Cancelar
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-surface text-muted-foreground border border-dashed border-border hover:bg-muted/50 hover:border-primary/50"
                >
                    + Bloque Personalizado
                </button>
            )}
        </div>
    );
};
