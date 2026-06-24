/**
 * CreateTestEvaluation — Registrar evaluación física (Spec 01 F1).
 */

import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { LoadingSpinner, useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import {
    TEST_CATEGORIES,
    type TestCategory,
    useCreateTestEvaluation,
} from "@nexia/shared";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { useScrollDashboardWhenReady } from "@/hooks/useScrollDashboardWhenReady";

const CATEGORY_OPTIONS = (
    Object.keys(TEST_CATEGORIES) as TestCategory[]
).map((value) => ({
    value,
    label: TEST_CATEGORIES[value].label,
}));

const STRENGTH_PR_HINT =
    "Este resultado puede actualizar el PR del ejercicio vinculado en Rendimiento gym.";

function parseCategory(value: string | null): TestCategory {
    const allowed = Object.keys(TEST_CATEGORIES) as TestCategory[];
    if (value && allowed.includes(value as TestCategory)) {
        return value as TestCategory;
    }
    return "mobility";
}

export const CreateTestEvaluation: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showSuccess, showError } = useToast();

    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : 0;
    const category = parseCategory(searchParams.get("category"));
    const preselectTestId = searchParams.get("testId")
        ? Number(searchParams.get("testId"))
        : null;

    const fallbackPath = clientId
        ? `/dashboard/clients/${clientId}?tab=testing`
        : "/dashboard";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId, {
        skip: !clientId,
    });

    const {
        formData,
        definitionForm,
        showDefinitionForm,
        setShowDefinitionForm,
        formErrors,
        definitionErrors,
        availableTests,
        selectedTest,
        isLoadingTests,
        isCreatingDefinition,
        isSubmitting,
        updateField,
        updateDefinitionField,
        submitDefinition,
        submitResult,
        showsStrengthPrHint,
    } = useCreateTestEvaluation({
        clientId,
        trainerId,
        category,
        preselectTestId,
    });

    useScrollDashboardWhenReady(!isLoadingClient && !isLoadingTests && !!clientId);

    useEffect(() => {
        if (!clientId) navigate("/dashboard");
    }, [clientId, navigate]);

    const testOptions = useMemo(
        () => [
            { value: "", label: "Selecciona una evaluación" },
            ...availableTests.map((test) => ({
                value: String(test.id),
                label: `${test.name} (${TEST_CATEGORIES[test.category]?.label ?? test.category}) · ${test.unit}`,
            })),
        ],
        [availableTests],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const ok = await submitResult();
            if (!ok) return;
            showSuccess("Evaluación registrada correctamente.", 2000);
            setTimeout(() => goBack({ replace: true }), 1200);
        } catch (err) {
            console.error("Error registrando evaluación:", err);
            showError("No se pudo registrar la evaluación.");
        }
    };

    const handleCreateDefinition = async () => {
        try {
            await submitDefinition();
            showSuccess("Evaluación creada y seleccionada.", 1500);
        } catch (err) {
            console.error("Error creando evaluación:", err);
            showError("No se pudo crear la evaluación.");
        }
    };

    if (isLoadingClient || isLoadingTests) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageTitle
                        title="Registrar evaluación"
                        subtitle="Selecciona o crea una evaluación y registra el resultado."
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goBack()}
                        className="shrink-0"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                        Volver
                    </Button>
                </div>
            </div>

            <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Cliente"
                            type="text"
                            value={
                                client
                                    ? `${client.nombre ?? ""} ${client.apellidos ?? ""}`.trim()
                                    : "Cargando..."
                            }
                            disabled
                            className="bg-muted"
                        />

                        <div className="space-y-2">
                            <FormSelect
                                label="Evaluación"
                                value={formData.test_id}
                                onChange={(e) => updateField("test_id", e.target.value)}
                                options={testOptions}
                                isRequired
                                error={formErrors.test_id}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto px-0 text-primary"
                                onClick={() => setShowDefinitionForm((v) => !v)}
                            >
                                {showDefinitionForm
                                    ? "Ocultar formulario"
                                    : "Crear nueva evaluación"}
                            </Button>
                        </div>

                        {showDefinitionForm && (
                            <div className="rounded-lg border border-border bg-surface/50 p-4 space-y-4">
                                <p className="text-sm font-medium text-foreground">
                                    Nueva evaluación
                                </p>
                                <Input
                                    label="Nombre"
                                    value={definitionForm.name}
                                    onChange={(e) =>
                                        updateDefinitionField("name", e.target.value)
                                    }
                                    error={definitionErrors.name}
                                    isRequired
                                />
                                <FormSelect
                                    label="Categoría"
                                    value={definitionForm.category}
                                    onChange={(e) =>
                                        updateDefinitionField(
                                            "category",
                                            e.target.value as TestCategory,
                                        )
                                    }
                                    options={CATEGORY_OPTIONS}
                                />
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Input
                                        label="Unidad"
                                        value={definitionForm.unit}
                                        onChange={(e) =>
                                            updateDefinitionField("unit", e.target.value)
                                        }
                                        placeholder="kg, cm, s, m…"
                                        error={definitionErrors.unit}
                                        isRequired
                                    />
                                    <Input
                                        label="Frecuencia (semanas)"
                                        type="number"
                                        min="1"
                                        value={definitionForm.default_frequency_weeks}
                                        onChange={(e) =>
                                            updateDefinitionField(
                                                "default_frequency_weeks",
                                                e.target.value,
                                            )
                                        }
                                        error={definitionErrors.default_frequency_weeks}
                                    />
                                </div>
                                <Input
                                    label="Descripción (opcional)"
                                    value={definitionForm.description}
                                    onChange={(e) =>
                                        updateDefinitionField("description", e.target.value)
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isCreatingDefinition}
                                    onClick={() => void handleCreateDefinition()}
                                >
                                    {isCreatingDefinition
                                        ? "Creando…"
                                        : "Guardar evaluación"}
                                </Button>
                            </div>
                        )}

                        {showsStrengthPrHint && (
                            <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
                                {STRENGTH_PR_HINT}
                            </p>
                        )}

                        <Input
                            label="Fecha"
                            type="date"
                            value={formData.test_date}
                            onChange={(e) => updateField("test_date", e.target.value)}
                            error={formErrors.test_date}
                            isRequired
                            max={new Date().toISOString().split("T")[0]}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Valor"
                                type="number"
                                step="0.01"
                                value={formData.value}
                                onChange={(e) => updateField("value", e.target.value)}
                                error={formErrors.value}
                                isRequired
                            />
                            <Input
                                label="Unidad"
                                value={formData.unit}
                                onChange={(e) => updateField("unit", e.target.value)}
                                error={formErrors.unit}
                                isRequired
                                disabled={!!selectedTest}
                            />
                        </div>

                        <Checkbox
                            id="is_baseline"
                            checked={formData.is_baseline}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                updateField("is_baseline", e.target.checked)
                            }
                            label="Marcar como línea base (baseline)"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Superficie (opcional)"
                                value={formData.surface}
                                onChange={(e) => updateField("surface", e.target.value)}
                            />
                            <Input
                                label="Condiciones (opcional)"
                                value={formData.conditions}
                                onChange={(e) => updateField("conditions", e.target.value)}
                            />
                        </div>

                        <Textarea
                            label="Notas (opcional)"
                            value={formData.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            rows={3}
                        />

                        {formErrors.trainer && (
                            <p className="text-sm text-destructive">{formErrors.trainer}</p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => goBack()}
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={isSubmitting || !trainerId}
                                isLoading={isSubmitting}
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                {isSubmitting ? "Guardando…" : "Registrar resultado"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
