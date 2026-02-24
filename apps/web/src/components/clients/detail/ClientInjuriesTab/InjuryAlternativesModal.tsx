/**
 * InjuryAlternativesModal.tsx — Modal para buscar alternativas de ejercicio (lesión)
 *
 * Contexto:
 * - Consume GET /exercise-alternatives/auto-suggest/{exercise_id} (TICK-C04)
 * - Flujo: trainer selecciona ejercicio a sustituir → muestra alternativas sugeridas
 * - La lesión da contexto (p. ej. "Por lesión de rodilla")
 *
 * @author Frontend Team
 * @since v6.2.4 - TICK-C04
 */

import React, { useState, useMemo } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { ExerciseSearch } from "@/components/exercises/ExerciseSearch";
import { FormSelect } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useGetExercisesQuery } from "@nexia/shared/hooks/exercises";
import { useGetAutoSuggestedAlternativesQuery } from "@nexia/shared/api/exerciseAlternativesApi";
import type { InjuryWithDetails } from "@nexia/shared/types/injuries";

interface InjuryAlternativesModalProps {
    isOpen: boolean;
    onClose: () => void;
    injury: InjuryWithDetails;
    clientId: number;
}

export const InjuryAlternativesModal: React.FC<InjuryAlternativesModalProps> = ({
    isOpen,
    onClose,
    injury,
    clientId,
}) => {
    const [exerciseSearch, setExerciseSearch] = useState("");
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

    const { data: exercisesData } = useGetExercisesQuery({
        search: exerciseSearch,
        limit: 15,
        skip: 0,
    });

    const exercises = useMemo(() => exercisesData?.exercises ?? [], [exercisesData]);

    const { data: alternatives, isLoading: isLoadingAlternatives } =
        useGetAutoSuggestedAlternativesQuery(
            {
                exerciseId: selectedExerciseId ?? 0,
                clientId,
                limit: 8,
            },
            { skip: !selectedExerciseId || !isOpen }
        );

    const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);
    const injuryContext = [injury.joint_name, injury.movement_name].filter(Boolean).join(" · ");

    const handleClose = () => {
        setSelectedExerciseId(null);
        setExerciseSearch("");
        onClose();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Buscar alternativas"
            description={`Por lesión: ${injuryContext || "N/D"}`}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        ¿Qué ejercicio quieres sustituir?
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                        Busca el ejercicio que el cliente debe evitar y verás alternativas seguras.
                    </p>
                    <ExerciseSearch
                        onSearch={setExerciseSearch}
                        placeholder="Buscar ejercicio (ej: sentadilla, press banca...)"
                    />
                    {exercises.length > 0 && (
                        <FormSelect
                            value={selectedExerciseId?.toString() ?? ""}
                            onChange={(e) =>
                                setSelectedExerciseId(e.target.value ? Number(e.target.value) : null)
                            }
                            options={[
                                { value: "", label: "Selecciona un ejercicio" },
                                ...exercises.map((ex) => ({
                                    value: ex.id.toString(),
                                    label: ex.nombre,
                                })),
                            ]}
                            className="mt-2"
                        />
                    )}
                </div>

                {selectedExerciseId && (
                    <div className="pt-2 border-t border-border">
                        <p className="text-sm font-semibold text-foreground mb-2">
                            Alternativas para &quot;{selectedExercise?.nombre ?? "..."}&quot;
                        </p>
                        {isLoadingAlternatives ? (
                            <div className="flex justify-center py-6">
                                <LoadingSpinner size="sm" />
                            </div>
                        ) : alternatives && alternatives.length > 0 ? (
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {alternatives.map((alt) => (
                                    <li
                                        key={alt.id}
                                        className="p-3 rounded-lg bg-slate-50 border border-slate-200"
                                    >
                                        <p className="font-medium text-foreground">{alt.nombre}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {[alt.equipo && `Equipo: ${alt.equipo}`, alt.musculatura_principal]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                        {alt.reason && (
                                            <p className="text-xs text-primary mt-1">{alt.reason}</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 py-4">
                                No se encontraron alternativas para este ejercicio.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-lg border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
