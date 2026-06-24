/**
 * ManualPerformanceRecordModal — Registro manual de PR (Spec 02 F3).
 */

import React, { useCallback, useEffect, useState } from "react";
import { BaseModal } from "@/components/ui/modals";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { BUTTON_PRESETS } from "@/utils/buttonStyles";
import { useCreateClientExercisePerformanceRecord } from "@nexia/shared/hooks/clients/useCreateClientExercisePerformanceRecord";
import type { PerformanceMetric } from "@nexia/shared/types/exercisePerformance";

const METRIC_OPTIONS = [
    { value: "best_weight_kg", label: "Peso máximo (kg)" },
    { value: "best_e1rm_kg", label: "e1RM (kg)" },
];

export interface ManualPerformanceRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    exerciseId: number;
    exerciseName?: string;
    onSuccess?: () => void;
}

export const ManualPerformanceRecordModal: React.FC<
    ManualPerformanceRecordModalProps
> = ({ isOpen, onClose, clientId, exerciseId, exerciseName, onSuccess }) => {
    const { createPerformanceRecord, isLoading } =
        useCreateClientExercisePerformanceRecord(clientId, exerciseId);

    const [metric, setMetric] = useState<PerformanceMetric>("best_weight_kg");
    const [valueKg, setValueKg] = useState("");
    const [reps, setReps] = useState("");
    const [achievedAt, setAchievedAt] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isOpen) return;
        setMetric("best_weight_kg");
        setValueKg("");
        setReps("");
        setAchievedAt(new Date().toISOString().slice(0, 10));
        setNotes("");
        setErrors({});
    }, [isOpen]);

    const validate = useCallback((): boolean => {
        const next: Record<string, string> = {};
        const parsedValue = Number(valueKg.replace(",", "."));
        if (!valueKg.trim() || Number.isNaN(parsedValue) || parsedValue <= 0) {
            next.valueKg = "Indica un peso válido mayor que 0.";
        }
        if (metric === "best_weight_kg" && reps.trim()) {
            const parsedReps = Number(reps);
            if (Number.isNaN(parsedReps) || parsedReps <= 0) {
                next.reps = "Las repeticiones deben ser un entero positivo.";
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }, [metric, reps, valueKg]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const parsedValue = Number(valueKg.replace(",", "."));
        const parsedReps = reps.trim() ? Number(reps) : null;

        try {
            await createPerformanceRecord({
                metric,
                value_kg: parsedValue,
                reps: metric === "best_weight_kg" ? parsedReps : null,
                achieved_at: achievedAt ? `${achievedAt}T12:00:00` : null,
                notes: notes.trim() || null,
            });
            onSuccess?.();
            onClose();
        } catch {
            setErrors({ form: "No se pudo guardar la marca. Inténtalo de nuevo." });
        }
    };

    const title = exerciseName
        ? `Registrar marca — ${exerciseName}`
        : "Registrar marca manual";

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description="La marca quedará registrada como PR manual del entrenador."
            maxWidth="md"
            isLoading={isLoading}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSelect
                    label="Tipo de marca"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as PerformanceMetric)}
                    options={METRIC_OPTIONS}
                    isRequired
                />

                <Input
                    label="Peso (kg)"
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    min="0"
                    value={valueKg}
                    onChange={(e) => setValueKg(e.target.value)}
                    error={errors.valueKg}
                    isRequired
                />

                {metric === "best_weight_kg" && (
                    <Input
                        label="Repeticiones (opcional)"
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        error={errors.reps}
                        helperText="Si lo indicas, se mostrará como «kg × reps»."
                    />
                )}

                <Input
                    label="Fecha"
                    type="date"
                    value={achievedAt}
                    onChange={(e) => setAchievedAt(e.target.value)}
                />

                <Input
                    label="Notas (opcional)"
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contexto de la marca…"
                />

                {errors.form && (
                    <p className="text-sm text-destructive" role="alert">
                        {errors.form}
                    </p>
                )}

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className={BUTTON_PRESETS.modalPrimary}
                        disabled={isLoading}
                    >
                        {isLoading ? "Guardando…" : "Guardar marca"}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};
