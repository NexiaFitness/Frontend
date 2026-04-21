/**
 * Review.tsx — Paso final del wizard de Onboarding
 *
 * Muestra resumen completo de todos los datos capturados antes de crear el perfil.
 * Rediseñado con tokens del diseño Nexia Sparkle Flow (bg-surface, border, text-foreground).
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v8.0.0 - Rediseño dark-mode tokens, español, FormSection, DashboardFixedFooter
 */

import React, { useMemo } from "react";
import type { ReviewStepProps } from "@nexia/shared/types/clientOnboarding";
import { calculateBMI, useClientPreview, TRAINING_DAY_LABELS, type TrainingDayValue } from "@nexia/shared";
import { SomatotipoChart } from "../charts/SomatotipoChart";
import { Button } from "@/components/ui/buttons";
import { Avatar } from "@/components/ui/avatar";
import { FormSection } from "@/components/ui/forms";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { User, Ruler, Target, StickyNote, Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";

interface ExtendedReviewProps extends ReviewStepProps {
    onBack?: () => void;
    onCreateProfile?: () => void;
    isSubmitting?: boolean;
}

const display = (value: string | number | undefined | null) => value || "—";

function formatDateShort(dateStr: string | undefined | null): string {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function calculateAge(birthdate: string | undefined | null): number | null {
    if (!birthdate) return null;
    try {
        const birth = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    } catch {
        return null;
    }
}

const GENDER_LABELS: Record<string, string> = {
    Masculino: "Masculino",
    Femenino: "Femenino",
    masculino: "Masculino",
    femenino: "Femenino",
};

const FREQUENCY_LABELS: Record<string, string> = {
    Baja: "1-2 sesiones/semana",
    Media: "3-5 sesiones/semana",
    Alta: "6-7 sesiones/semana",
};

const DURATION_LABELS: Record<string, string> = {
    short_lt_1h: "Menos de 1 h",
    medium_1h_to_1h30: "1 h – 1 h 30 min",
    long_gt_1h30: "Más de 1 h 30 min",
};

const GOAL_LABELS: Record<string, string> = {
    hypertrophy: "Hipertrofia muscular",
    strength: "Fuerza máxima",
    power: "Potencia / explosividad",
    endurance: "Resistencia cardiovascular",
    weight_loss: "Pérdida de peso / definición",
    rehabilitation: "Rehabilitación / readaptación",
    fitness: "Fitness general",
};

const EXPERIENCE_LABELS: Record<string, string> = {
    Baja: "Principiante",
    Media: "Intermedio",
    Alta: "Avanzado",
};

function DataField({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-primary">
                {label}
            </span>
            <p className="text-sm font-medium text-foreground">{value || "—"}</p>
        </div>
    );
}

export const Review: React.FC<ExtendedReviewProps> = ({
    formData,
    onBack,
    onCreateProfile,
    isSubmitting = false,
}) => {
    const { preview, isLoading: isLoadingPreview } = useClientPreview({
        formData,
        enabled: true,
    });

    const bmi = useMemo(() => {
        if (preview?.bmi != null) return preview.bmi;
        if (formData.peso && formData.altura) {
            return calculateBMI(formData.peso, formData.altura / 100);
        }
        return null;
    }, [preview?.bmi, formData.peso, formData.altura]);

    const age = useMemo(() => {
        if (formData.birthdate) return calculateAge(formData.birthdate);
        return formData.edad ?? null;
    }, [formData.birthdate, formData.edad]);

    const notes = useMemo(() => {
        return [
            formData.lesiones_relevantes,
            formData.observaciones,
            formData.notes_1,
            formData.notes_2,
            formData.notes_3,
        ].filter(Boolean) as string[];
    }, [
        formData.lesiones_relevantes,
        formData.observaciones,
        formData.notes_1,
        formData.notes_2,
        formData.notes_3,
    ]);

    const trainingDaysStr = useMemo(() => {
        const days = formData.training_days;
        if (!days || days.length === 0) return "—";
        return days.map((d) => TRAINING_DAY_LABELS[d as TrainingDayValue] ?? d).join(", ");
    }, [formData.training_days]);

    const hasSomatotypeData = useMemo(() => {
        const hasManualValues =
            formData.somatotype_endomorph != null ||
            formData.somatotype_mesomorph != null ||
            formData.somatotype_ectomorph != null;

        const hasAnthropometricData = !!(
            formData.skinfold_triceps &&
            formData.skinfold_subscapular &&
            formData.skinfold_supraspinal &&
            formData.skinfold_calf &&
            formData.girth_flexed_contracted_arm &&
            formData.girth_maximum_calf &&
            formData.diameter_humerus_biepicondylar &&
            formData.diameter_femur_bicondylar
        );

        return hasManualValues || hasAnthropometricData;
    }, [formData]);

    return (
        <>
            <div className="space-y-6 pb-24">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                        Revisar perfil del cliente
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Verifica la información antes de crear el perfil
                    </p>
                </div>

                {/* Información Personal */}
                <FormSection icon={<User className="h-4 w-4" />} title="Información Personal">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <div className="shrink-0">
                            <Avatar
                                nombre={formData.nombre}
                                apellidos={formData.apellidos}
                                size="lg"
                                variant="default"
                            />
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                            <DataField label="Nombre" value={display(formData.nombre)} />
                            <DataField label="Apellidos" value={display(formData.apellidos)} />
                            <DataField label="Teléfono" value={display(formData.telefono)} />
                            <DataField label="Fecha de nacimiento" value={formatDateShort(formData.birthdate)} />
                            <DataField label="Sexo" value={GENDER_LABELS[formData.sexo ?? ""] ?? display(formData.sexo)} />
                            <DataField label="Edad" value={age ? `${age} años` : "—"} />
                            <DataField label="Email" value={display(formData.mail)} />
                            <DataField label="DNI / Pasaporte" value={display(formData.id_passport)} />
                        </div>
                    </div>
                </FormSection>

                {/* Datos Antropométricos */}
                <FormSection icon={<Ruler className="h-4 w-4" />} title="Datos Antropométricos">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                        <DataField label="Peso" value={formData.peso ? `${formData.peso} kg` : "—"} />
                        <DataField label="Altura" value={formData.altura ? `${formData.altura} cm` : "—"} />
                        <DataField label="IMC" value={bmi ? bmi.toFixed(1) : "—"} />
                    </div>
                </FormSection>

                {/* Two-column: Parámetros + Somatotipo */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Parámetros de Entrenamiento */}
                    <FormSection icon={<Target className="h-4 w-4" />} title="Parámetros de Entrenamiento">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <DataField
                                label="Objetivo"
                                value={GOAL_LABELS[formData.objetivo_entrenamiento ?? ""] ?? display(formData.objetivo_entrenamiento)}
                            />
                            <DataField
                                label="Nivel de experiencia"
                                value={EXPERIENCE_LABELS[formData.experiencia ?? ""] ?? display(formData.experiencia)}
                            />
                            <DataField
                                label="Frecuencia de entrenamiento"
                                value={FREQUENCY_LABELS[formData.frecuencia_semanal ?? ""] ?? display(formData.frecuencia_semanal)}
                            />
                            <DataField
                                label="Duración de sesión"
                                value={DURATION_LABELS[formData.session_duration ?? ""] ?? display(formData.session_duration)}
                            />
                            <DataField
                                label="Sesiones/semana (exacto)"
                                value={
                                    formData.exact_training_frequency != null
                                        ? `${formData.exact_training_frequency} día${formData.exact_training_frequency === 1 ? "" : "s"}/semana`
                                        : "—"
                                }
                            />
                            <DataField label="Días concretos" value={trainingDaysStr} />
                        </div>
                    </FormSection>

                    {/* Somatotipo */}
                    <FormSection icon={<Activity className="h-4 w-4" />} title="Somatotipo">
                        {hasSomatotypeData ? (
                            <>
                                <SomatotipoChart
                                    endomorph={formData.somatotype_endomorph ?? preview?.somatotype?.endomorph ?? null}
                                    mesomorph={formData.somatotype_mesomorph ?? preview?.somatotype?.mesomorph ?? null}
                                    ectomorph={formData.somatotype_ectomorph ?? preview?.somatotype?.ectomorph ?? null}
                                />
                                {isLoadingPreview && (
                                    <p className="mt-2 text-center text-xs text-muted-foreground">
                                        Calculando somatotipo…
                                    </p>
                                )}
                            </>
                        ) : (
                            <EmptyState
                                icon={<Activity className="h-12 w-12" />}
                                title="Somatotipo no disponible"
                                description="Añade las medidas corporales del cliente para calcular su somatotipo."
                                action={
                                    onBack ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onBack}
                                            disabled={isSubmitting}
                                        >
                                            Completar medidas antropométricas
                                        </Button>
                                    ) : undefined
                                }
                                className="py-8"
                            />
                        )}
                    </FormSection>
                </div>

                {/* Notas */}
                <FormSection icon={<StickyNote className="h-4 w-4" />} title="Notas">
                    {notes.length > 0 ? (
                        <ul className="space-y-2">
                            {notes.map((note, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                    <span className="mt-0.5 text-primary">•</span>
                                    {note}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm italic text-muted-foreground">
                            No hay notas para este cliente.
                        </p>
                    )}
                </FormSection>
            </div>

            {/* Footer fijo */}
            {(onBack || onCreateProfile) && (
                <DashboardFixedFooter>
                    <div className="flex items-center justify-end gap-3">
                        {onBack && (
                            <Button
                                variant="outline"
                                size="md"
                                onClick={onBack}
                                disabled={isSubmitting}
                            >
                                Atrás
                            </Button>
                        )}
                        {onCreateProfile && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={onCreateProfile}
                                isLoading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creando…" : "Crear Perfil"}
                            </Button>
                        )}
                    </div>
                </DashboardFixedFooter>
            )}
        </>
    );
};
