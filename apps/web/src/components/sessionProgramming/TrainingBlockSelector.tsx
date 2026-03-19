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
            <div
                className={cn(
                    "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
                    className
                )}
            >
                <div className="mb-3 h-4 w-40 rounded bg-muted/50 animate-pulse" />
                <div className="flex flex-wrap gap-2">
                    <div className="h-7 w-24 rounded-md bg-muted/50 animate-pulse" />
                    <div className="h-7 w-28 rounded-md bg-muted/50 animate-pulse" />
                    <div className="h-7 w-32 rounded-md bg-muted/50 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm",
                className
            )}
        >
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                    Bloques de Entrenamiento
                </h3>
                {!showCustomInput && (
                    <button
                        type="button"
                        onClick={() => setShowCustomInput(true)}
                        className="inline-flex items-center rounded-md border border-primary/30 bg-transparent px-3 h-7 text-xs font-medium text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:border-primary/50 hover:bg-primary/10 hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)]"
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
                        className={cn(
                            "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                            selectedBlockTypeIds.includes(bt.id)
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                    >
                        {getDisplayName(bt)}
                    </button>
                ))}
            </div>

            {showCustomInput && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-surface/50 p-2">
                    <Input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nombre del bloque"
                        className="h-7 w-36 text-xs"
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
                        className="rounded-md px-3 h-7 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {isCreating ? "..." : "Crear"}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancelCustom}
                        className="rounded-md px-3 h-7 text-xs font-medium border border-border bg-surface text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};
