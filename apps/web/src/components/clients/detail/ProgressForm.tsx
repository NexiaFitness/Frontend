/**
 * ProgressForm.tsx — Form for adding client progress records.
 *
 * Renders inside the "Progreso" tab of ClientDetail.
 * Fields: peso (kg), altura (cm), fecha_registro, notas.
 * The backend auto-calculates BMI.
 *
 * @author Frontend Team
 * @since v4.3.0
 * @updated v7.0.0 — Redesign with FormSection card layout
 */

import React, { useState, useEffect, useMemo } from "react";
import { Scale, Calendar } from "lucide-react";
import { useCreateClientProgress } from "@nexia/shared/hooks/clients/useCreateClientProgress";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { calculateBMI } from "@nexia/shared";
import type { CreateClientProgressData } from "@nexia/shared/types/progress";
import { FormSection } from "@/components/ui/forms/FormSection";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import {
    inputClass,
    labelClass,
    errorClass,
    textareaClass,
} from "@/components/clients/shared/formFieldStyles";
import { Input } from "@/components/ui/forms";

interface ProgressFormProps {
    clientId: number;
}

export const ProgressForm: React.FC<ProgressFormProps> = ({ clientId }) => {
    const [formData, setFormData] = useState<Partial<CreateClientProgressData>>({
        fecha_registro: new Date().toISOString().split("T")[0],
        unidad: "metric" as "metric" | "imperial",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<boolean>(false);

    const { createProgressRecord, isLoading, error, isSuccess } = useCreateClientProgress(clientId);
    const { data: client } = useGetClientQuery(clientId);

    useEffect(() => {
        if (client?.altura) {
            setFormData((prev) => {
                if (prev.altura === undefined || prev.altura === null) {
                    return { ...prev, altura: client.altura };
                }
                return prev;
            });
        }
    }, [client?.altura]);

    const bmi = useMemo(() => {
        if (formData.peso && formData.altura) {
            return calculateBMI(formData.peso, formData.altura / 100);
        }
        return null;
    }, [formData.peso, formData.altura]);

    const updateField = <K extends keyof Partial<CreateClientProgressData>>(
        field: K,
        value: Partial<CreateClientProgressData>[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors((prev) => ({ ...prev, [field as string]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);

        const newErrors: Record<string, string> = {};

        if (!formData.peso) {
            newErrors.peso = "El peso es requerido";
        } else if (formData.peso < 20 || formData.peso > 300) {
            newErrors.peso = "El peso debe estar entre 20 y 300 kg";
        }

        if (!formData.altura) {
            newErrors.altura = "La altura es requerida";
        } else if (formData.altura < 100 || formData.altura > 250) {
            newErrors.altura = "La altura debe estar entre 100 y 250 cm";
        }

        if (!formData.fecha_registro) {
            newErrors.fecha_registro = "La fecha de medición es requerida";
        } else {
            const fechaRegistro = new Date(formData.fecha_registro);
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            if (fechaRegistro > hoy) {
                newErrors.fecha_registro = "La fecha de medición no puede ser futura";
            }

            if (client?.fecha_alta) {
                const fechaAlta = new Date(client.fecha_alta);
                fechaAlta.setHours(0, 0, 0, 0);
                if (fechaRegistro < fechaAlta) {
                    newErrors.fecha_registro = `La fecha no puede ser anterior a la fecha de alta (${new Date(client.fecha_alta).toLocaleDateString()})`;
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await createProgressRecord({
                fecha_registro: formData.fecha_registro!,
                peso: formData.peso!,
                altura: formData.altura!,
                unidad: formData.unidad || "metric",
                notas: formData.notas || null,
            });

            setSuccess(true);
            setFormData({
                fecha_registro: new Date().toISOString().split("T")[0],
                unidad: "metric" as "metric" | "imperial",
            });
            setErrors({});
        } catch (err) {
            console.error("Error al crear registro de progreso:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-5">
                {/* Body metrics */}
                <FormSection icon={<Scale className="h-4 w-4" />} title="Mediciones corporales">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className={labelClass}>
                                Peso <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    size="sm"
                                    step="0.1"
                                    value={formData.peso ?? ""}
                                    onChange={(e) => updateField("peso", Number(e.target.value))}
                                    className="pr-12"
                                    placeholder="20-300"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    kg
                                </span>
                            </div>
                            {errors.peso && <p className={errorClass}>{errors.peso}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>
                                Altura <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    size="sm"
                                    step="0.1"
                                    value={formData.altura ?? ""}
                                    onChange={(e) => updateField("altura", Number(e.target.value))}
                                    className="pr-12"
                                    placeholder="100-250"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    cm
                                </span>
                            </div>
                            {errors.altura && <p className={errorClass}>{errors.altura}</p>}
                        </div>

                        <div>
                            <label className={labelClass}>IMC</label>
                            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                                <span className="text-muted-foreground">Auto-calculado</span>
                                <span>{bmi !== null ? bmi.toFixed(1) : "—"}</span>
                            </div>
                        </div>
                    </div>
                </FormSection>

                {/* Date & notes */}
                <FormSection icon={<Calendar className="h-4 w-4" />} title="Fecha y observaciones">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>
                                Fecha de medición <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.fecha_registro ?? new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                    updateField("fecha_registro", e.target.value);
                                    if (e.target.value) {
                                        const fecha = new Date(e.target.value);
                                        const hoy = new Date();
                                        hoy.setHours(23, 59, 59, 999);
                                        if (fecha > hoy) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                fecha_registro: "La fecha no puede ser futura",
                                            }));
                                        } else if (client?.fecha_alta && fecha < new Date(client.fecha_alta)) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                fecha_registro: `Anterior a fecha de alta (${new Date(client.fecha_alta).toLocaleDateString()})`,
                                            }));
                                        } else {
                                            setErrors((prev) => {
                                                const next = { ...prev };
                                                delete next.fecha_registro;
                                                return next;
                                            });
                                        }
                                    }
                                }}
                                max={new Date().toISOString().split("T")[0]}
                                min={
                                    client?.fecha_alta
                                        ? new Date(client.fecha_alta).toISOString().split("T")[0]
                                        : undefined
                                }
                                className={inputClass}
                                required
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                No puede ser futura
                            </p>
                            {errors.fecha_registro && (
                                <p className={errorClass}>{errors.fecha_registro}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className={labelClass}>Notas (opcional)</label>
                            <textarea
                                value={formData.notas ?? ""}
                                onChange={(e) => updateField("notas", e.target.value || null)}
                                rows={3}
                                className={textareaClass}
                                placeholder="Observaciones sobre este registro..."
                            />
                            {errors.notas && <p className={errorClass}>{errors.notas}</p>}
                        </div>
                    </div>
                </FormSection>

                {/* Feedback */}
                {isLoading && (
                    <div className="flex justify-center py-2">
                        <LoadingSpinner size="md" />
                    </div>
                )}
                {!!error && (
                    <Alert variant="error">
                        Error al guardar el registro. Por favor, inténtalo de nuevo.
                    </Alert>
                )}
                {(success || isSuccess) && (
                    <Alert variant="success">
                        Registro creado correctamente. Los gráficos se actualizarán en breve.
                    </Alert>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="md" disabled={isLoading}>
                        {isLoading ? "Guardando..." : "Guardar registro"}
                    </Button>
                </div>
            </div>
        </form>
    );
};
