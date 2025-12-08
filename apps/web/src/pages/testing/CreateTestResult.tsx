/**
 * CreateTestResult.tsx — Página para crear resultado de test físico
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear resultado de test
 * - Permite configurar todos los detalles del test
 * - Cliente viene pre-rellenado desde query params
 *
 * @author Frontend Team
 * @since v5.5.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import { useCreateTestResult } from "@nexia/shared";
import { useGetClientQuery, useGetPhysicalTestsQuery } from "@nexia/shared/api/clientsApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";

export const CreateTestResult: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showSuccess, showError } = useToast();

    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : 0;
    const fallbackPath = clientId ? `/dashboard/clients/${clientId}` : "/dashboard";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    // Obtener perfil del trainer actual
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    const { createTestResult, isSubmitting } = useCreateTestResult();

    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId, {
        skip: !clientId,
    });

    const { data: availableTests = [], isLoading: isLoadingTests } = useGetPhysicalTestsQuery(
        { isStandard: true },
        { skip: !clientId }
    );

    const [formData, setFormData] = useState({
        test_id: "",
        test_date: new Date().toISOString().split("T")[0],
        value: "",
        unit: "",
        is_baseline: false,
        notes: "",
        surface: "",
        conditions: "",
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Test seleccionado
    const selectedTest = React.useMemo(() => {
        if (!formData.test_id) return null;
        return availableTests.find((t) => t.id === parseInt(formData.test_id, 10)) || null;
    }, [formData.test_id, availableTests]);

    // Actualizar unidad cuando se selecciona un test
    useEffect(() => {
        if (selectedTest && selectedTest.unit) {
            setFormData((prev) => ({
                ...prev,
                unit: String(selectedTest.unit),
            }));
        }
    }, [selectedTest]);

    useEffect(() => {
        if (!clientId) {
            navigate("/dashboard");
        }
    }, [clientId, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        const errors: Record<string, string> = {};

        if (!formData.test_id) {
            errors.test_id = "Debes seleccionar un test";
        }

        if (!formData.test_date) {
            errors.test_date = "La fecha es obligatoria";
        }

        if (!formData.value || isNaN(parseFloat(formData.value))) {
            errors.value = "El valor debe ser un número válido";
        }

        if (!formData.unit) {
            errors.unit = "La unidad es obligatoria";
        }

        if (!trainerId) {
            errors.trainer = "No se pudo obtener el ID del trainer";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await createTestResult({
                client_id: clientId,
                test_id: parseInt(formData.test_id, 10),
                trainer_id: trainerId,
                test_date: formData.test_date,
                value: parseFloat(formData.value),
                unit: formData.unit,
                is_baseline: formData.is_baseline,
                notes: formData.notes || null,
                surface: formData.surface || null,
                conditions: formData.conditions || null,
            });

            showSuccess("Test creado exitosamente. Redirigiendo...", 2000);
            setTimeout(() => {
                goBack({ replace: true });
            }, 1500);
        } catch (err) {
            console.error("Error creando test:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al crear el test")
                    : "Error al crear el test";
            showError(errorMessage);
        }
    };

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    if (isLoadingClient || isLoadingTests) {
        return (
            <>
                <DashboardNavbar menuItems={menuItems} />
                <TrainerSideMenu />
                <DashboardLayout>
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner size="lg" />
                    </div>
                </DashboardLayout>
            </>
        );
    }

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                                Nuevo Test Físico
                            </h2>
                            <p className="text-white/80 text-sm md:text-base">
                                Registrar un nuevo resultado de test físico
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => goBack()}>
                            Volver
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">
                            Detalles del Test
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Cliente
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        client
                                            ? `${String(client.nombre || "")} ${String(client.apellidos || "")}`.trim()
                                            : "Cargando..."
                                    }
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Test *
                                </label>
                                <FormSelect
                                    value={formData.test_id}
                                    onChange={(e) =>
                                        setFormData({ ...formData, test_id: e.target.value })
                                    }
                                    required
                                    options={[
                                        { value: "", label: "Selecciona un test" },
                                        ...availableTests.map((test) => ({
                                            value: String(test.id),
                                            label: `${String(test.name || "")} (${String(test.category || "")}) - ${String(test.unit || "")}`,
                                        })),
                                    ]}
                                />
                                {formErrors.test_id ? (
                                    <p className="text-red-600 text-xs mt-1">{String(formErrors.test_id)}</p>
                                ) : null}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Fecha del Test *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.test_date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, test_date: e.target.value })
                                    }
                                    required
                                    max={new Date().toISOString().split("T")[0]}
                                />
                                {formErrors.test_date ? (
                                    <p className="text-red-600 text-xs mt-1">{String(formErrors.test_date)}</p>
                                ) : null}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Valor *
                                    </label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.value}
                                        onChange={(e) =>
                                            setFormData({ ...formData, value: e.target.value })
                                        }
                                        required
                                        placeholder="Ej: 80.5"
                                    />
                                    {formErrors.value ? (
                                        <p className="text-red-600 text-xs mt-1">{String(formErrors.value)}</p>
                                    ) : null}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Unidad *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) =>
                                            setFormData({ ...formData, unit: e.target.value })
                                        }
                                        required
                                        placeholder="Ej: kg, cm, s"
                                        disabled={!!selectedTest}
                                        className={selectedTest ? "bg-slate-50" : ""}
                                    />
                                    {selectedTest ? (
                                        <p className="text-slate-500 text-xs mt-1">
                                            Unidad automática del test seleccionado
                                        </p>
                                    ) : null}
                                    {formErrors.unit ? (
                                        <p className="text-red-600 text-xs mt-1">{String(formErrors.unit)}</p>
                                    ) : null}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <Checkbox
                                        id="is_baseline"
                                        checked={formData.is_baseline}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setFormData({
                                                ...formData,
                                                is_baseline: e.target.checked,
                                            })
                                        }
                                        label="Marcar como test de referencia (baseline)"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Superficie (opcional)
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.surface}
                                        onChange={(e) =>
                                            setFormData({ ...formData, surface: e.target.value })
                                        }
                                        placeholder="Ej: Pista, Césped, Gimnasio"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Condiciones (opcional)
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.conditions}
                                        onChange={(e) =>
                                            setFormData({ ...formData, conditions: e.target.value })
                                        }
                                        placeholder="Ej: Clima, temperatura, etc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Notas (opcional)
                                </label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Observaciones adicionales sobre el test..."
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                                    {isSubmitting ? "Creando..." : "Crear Test"}
                                </Button>
                            </div>

                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};