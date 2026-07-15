/**
 * ExercisesLibraryNewFormPanel.tsx — Formulario inline alta ejercicio (biblioteca).
 */

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import { Input, Textarea } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    EXERCISES_LIBRARY_FORM_ACTIONS,
    EXERCISES_LIBRARY_FORM_CLOSE,
    EXERCISES_LIBRARY_FORM_FIELD_LABEL,
    EXERCISES_LIBRARY_FORM_GRID,
    EXERCISES_LIBRARY_FORM_GRID_WIDE,
    EXERCISES_LIBRARY_FORM_HEADING,
    EXERCISES_LIBRARY_FORM_INPUT,
    EXERCISES_LIBRARY_FORM_PANEL,
    EXERCISES_LIBRARY_FORM_TEXTAREA_SM,
    EXERCISES_LIBRARY_FORM_TEXTAREA_XS,
    EXERCISES_LIBRARY_SECTION_LABELS,
    EXERCISES_LIBRARY_SELECT,
} from "./exercisesLibraryPresentation";

const LEVEL_FILTERS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
] as const;

export interface NewExerciseFormState {
    name: string;
    muscleGroup: string;
    tipo: "Compuesto" | "Aislamiento";
    equipment: string;
    level: string;
    movementPattern: string;
    descripcion: string;
    instrucciones: string;
    notas: string;
    videoUrl: string;
}

export interface ExercisesLibraryNewFormPanelProps {
    form: NewExerciseFormState;
    onChange: (patch: Partial<NewExerciseFormState>) => void;
    onSave: () => void;
    onClose: () => void;
    groups: string[];
    patterns: string[];
    getMuscleLabel: (value: string) => string;
}

export const ExercisesLibraryNewFormPanel: React.FC<ExercisesLibraryNewFormPanelProps> = ({
    form,
    onChange,
    onSave,
    onClose,
    groups,
    patterns,
    getMuscleLabel,
}) => (
    <div className={EXERCISES_LIBRARY_FORM_PANEL}>
        <NexiaGlassAccentRim />
        <div className="flex items-center justify-between">
            <h2 className={EXERCISES_LIBRARY_FORM_HEADING}>
                {EXERCISES_LIBRARY_SECTION_LABELS.newExercise}
            </h2>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={EXERCISES_LIBRARY_FORM_CLOSE}
                onClick={onClose}
                aria-label="Cerrar formulario"
            >
                <X className="h-4 w-4" />
            </Button>
        </div>

        <div className={EXERCISES_LIBRARY_FORM_GRID}>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>Nombre *</label>
                <Input
                    size="sm"
                    placeholder="Nombre del ejercicio"
                    value={form.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_INPUT}
                />
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>Grupo muscular *</label>
                {groups.length > 0 ? (
                    <select
                        className={cn(EXERCISES_LIBRARY_SELECT, "w-full")}
                        value={form.muscleGroup}
                        onChange={(e) => onChange({ muscleGroup: e.target.value })}
                    >
                        <option value="">Seleccionar…</option>
                        {groups.map((g) => (
                            <option key={g} value={g}>
                                {getMuscleLabel(g)}
                            </option>
                        ))}
                    </select>
                ) : (
                    <Input
                        size="sm"
                        placeholder="Ej. Pecho, Espalda…"
                        value={form.muscleGroup}
                        onChange={(e) => onChange({ muscleGroup: e.target.value })}
                        className={EXERCISES_LIBRARY_FORM_INPUT}
                    />
                )}
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.type}
                </label>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "w-full")}
                    value={form.tipo}
                    onChange={(e) =>
                        onChange({ tipo: e.target.value as "Compuesto" | "Aislamiento" })
                    }
                >
                    <option value="Compuesto">Compuesto</option>
                    <option value="Aislamiento">Aislamiento</option>
                </select>
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.equipment}
                </label>
                <Input
                    size="sm"
                    placeholder="Barra, Mancuernas..."
                    value={form.equipment}
                    onChange={(e) => onChange({ equipment: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_INPUT}
                />
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.level}
                </label>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "w-full")}
                    value={form.level}
                    onChange={(e) => onChange({ level: e.target.value })}
                >
                    {LEVEL_FILTERS.map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.movementPattern}
                </label>
                <select
                    className={cn(EXERCISES_LIBRARY_SELECT, "w-full")}
                    value={form.movementPattern}
                    onChange={(e) => onChange({ movementPattern: e.target.value })}
                >
                    <option value="">Seleccionar…</option>
                    {patterns.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        <div className={EXERCISES_LIBRARY_FORM_GRID_WIDE}>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.description}
                </label>
                <Textarea
                    value={form.descripcion}
                    onChange={(e) => onChange({ descripcion: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_TEXTAREA_SM}
                />
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.instructions}
                </label>
                <Textarea
                    value={form.instrucciones}
                    onChange={(e) => onChange({ instrucciones: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_TEXTAREA_SM}
                />
            </div>
        </div>

        <div className={EXERCISES_LIBRARY_FORM_GRID_WIDE}>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.notes}
                </label>
                <Textarea
                    value={form.notas}
                    onChange={(e) => onChange({ notas: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_TEXTAREA_XS}
                />
            </div>
            <div>
                <label className={EXERCISES_LIBRARY_FORM_FIELD_LABEL}>
                    {EXERCISES_LIBRARY_SECTION_LABELS.videoUrl}
                </label>
                <Input
                    size="sm"
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={form.videoUrl}
                    onChange={(e) => onChange({ videoUrl: e.target.value })}
                    className={EXERCISES_LIBRARY_FORM_INPUT}
                />
            </div>
        </div>

        <div className={EXERCISES_LIBRARY_FORM_ACTIONS}>
            <Button type="button" variant="default" size="sm" onClick={onSave}>
                Guardar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancelar
            </Button>
        </div>
    </div>
);
