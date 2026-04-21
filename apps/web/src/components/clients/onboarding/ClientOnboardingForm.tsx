/**
 * ClientOnboardingForm.tsx — Modern form for client creation.
 *
 * Layout: two-column (main form + sidebar) with card-based sections,
 * collapsible groups, breadcrumbs, and sticky footer.
 *
 * @author Frontend Team
 * @since v4.6.0
 * @updated v7.0.0 — Redesign with FormSection cards and sidebar layout
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Ruler, Target, StickyNote, Sparkles } from "lucide-react";
import type { ClientFormData } from "@nexia/shared/types/client";
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { useCompleteProfileModal } from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { CompleteProfileModal } from "@/components/dashboard/modals/CompleteProfileModal";
import { DashboardFixedFooter } from "@/components/dashboard/shared";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { FormSection } from "@/components/ui/forms/FormSection";
import { PersonalInfo } from "../shared/PersonalInfo";
import { PhysicalMetrics } from "../shared/PhysicalMetrics";
import { AnthropometricMetrics } from "../shared/AnthropometricMetrics";
import { TrainingGoals } from "../shared/TrainingGoals";
import { Experience } from "../shared/Experience";
import { Review } from "../steps/Review";
import { textareaClass, labelClass } from "../shared/formFieldStyles";

export interface ClientOnboardingFormProps {
    initialData: ClientFormData;
    onSubmitSuccess?: (clientId: number) => void;
    onBackToDashboard?: () => void;
}

const BREADCRUMB_ITEMS = [
    { label: "Clientes", path: "/dashboard/clients" },
    { label: "Nuevo cliente", active: true },
];

const REQUIRED_FIELDS: (keyof ClientFormData)[] = [
    "nombre",
    "apellidos",
    "mail",
    "peso",
    "altura",
    "objetivo_entrenamiento",
    "experiencia",
];

export const ClientOnboardingForm: React.FC<ClientOnboardingFormProps> = ({
    initialData,
    onSubmitSuccess,
}) => {
    const navigate = useNavigate();
    const { shouldBlock } = useCompleteProfileModal();
    const { showSuccess } = useToast();
    const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
    const [showReview, setShowReview] = useState(false);

    const { formData, errors, updateField, validate, handleSubmit, isSubmitting } = useClientForm({
        mode: "create",
        initialData,
    });

    const stepProps = { formData, errors, updateField };

    const filledCount = useMemo(() => {
        return REQUIRED_FIELDS.filter((f) => {
            const v = formData[f];
            return v !== undefined && v !== null && v !== "";
        }).length;
    }, [formData]);

    const handleShowReview = () => {
        const { isValid } = validate();
        if (isValid) setShowReview(true);
    };

    const handleCreateProfile = async () => {
        if (shouldBlock) {
            setShowCompleteProfileModal(true);
            return;
        }

        const result = await handleSubmit();
        if (result.success && result.clientId !== undefined) {
            const clientName =
                formData.nombre && formData.apellidos
                    ? `${formData.nombre} ${formData.apellidos}`
                    : formData.nombre || "Cliente";
            showSuccess(`Cliente ${clientName} creado exitosamente. Redirigiendo...`, 2000);
            setTimeout(() => {
                if (onSubmitSuccess && result.clientId !== undefined) {
                    onSubmitSuccess(result.clientId);
                }
            }, 1500);
        }
    };

    if (showReview) {
        return (
            <>
                <Review
                    formData={formData}
                    onBack={() => setShowReview(false)}
                    onCreateProfile={handleCreateProfile}
                    isSubmitting={isSubmitting}
                />
                <CompleteProfileModal
                    isOpen={showCompleteProfileModal}
                    onClose={() => setShowCompleteProfileModal(false)}
                />
            </>
        );
    }

    return (
        <>
            <div className="space-y-6 pb-24">
                {/* Header */}
                <div>
                    <Breadcrumbs items={BREADCRUMB_ITEMS} className="mb-3" />
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                            Nuevo Cliente
                        </h1>
                        <Badge variant="subtle">Borrador</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Completa la información para registrar al cliente
                    </p>
                </div>

                {/* Two-column layout */}
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Main form */}
                    <div className="min-w-0 flex-1 space-y-6">
                        <FormSection
                            icon={<User className="h-4 w-4" />}
                            title="Información Personal"
                        >
                            <PersonalInfo {...stepProps} isEditMode={false} hideHeading />
                        </FormSection>

                        <FormSection
                            icon={<Ruler className="h-4 w-4" />}
                            title="Datos Antropométricos"
                        >
                            <PhysicalMetrics {...stepProps} hideHeading />
                            <AnthropometricMetrics {...stepProps} collapsible />
                        </FormSection>

                        <FormSection
                            icon={<Target className="h-4 w-4" />}
                            title="Parámetros de Entrenamiento"
                        >
                            <TrainingGoals {...stepProps} hideHeading />
                            <div className="mt-6 border-t border-border pt-6">
                                <Experience {...stepProps} />
                            </div>
                        </FormSection>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full space-y-6 lg:w-80 lg:shrink-0">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-bold text-primary">
                                {filledCount}/{REQUIRED_FIELDS.length}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">campos</p>
                                <p className="text-xs text-muted-foreground">Requeridos completados</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <StickyNote className="h-4 w-4 text-warning" />
                                    <h3 className="text-sm font-semibold text-foreground">Notas</h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className={labelClass}>Nota 1</label>
                                    <textarea
                                        value={formData.lesiones_relevantes || ""}
                                        onChange={(e) => updateField("lesiones_relevantes", e.target.value)}
                                        className={`${textareaClass} min-h-[72px]`}
                                        placeholder="Nota 1..."
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Nota 2</label>
                                    <textarea
                                        value={formData.observaciones || ""}
                                        onChange={(e) => updateField("observaciones", e.target.value)}
                                        className={`${textareaClass} min-h-[72px]`}
                                        placeholder="Nota 2..."
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Nota 3</label>
                                    <textarea
                                        value={formData.notes_1 || ""}
                                        onChange={(e) => updateField("notes_1", e.target.value)}
                                        className={`${textareaClass} min-h-[72px]`}
                                        placeholder="Nota 3..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-surface p-5">
                            <div className="mb-4 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-semibold text-foreground">Resumen</h3>
                            </div>
                            <dl className="space-y-2.5 text-sm">
                                <SummaryRow label="Nombre" value={formData.nombre && formData.apellidos ? `${formData.nombre} ${formData.apellidos}` : undefined} />
                                <SummaryRow label="Email" value={formData.mail || undefined} />
                                <SummaryRow label="Peso / Altura" value={formData.peso && formData.altura ? `${formData.peso} kg / ${formData.altura} cm` : undefined} />
                                <SummaryRow label="IMC" value={formData.peso && formData.altura ? (formData.peso / ((formData.altura / 100) ** 2)).toFixed(1) : undefined} />
                                <SummaryRow label="Objetivo" value={formData.objetivo_entrenamiento || undefined} />
                                <SummaryRow label="Experiencia" value={formData.experiencia || undefined} />
                                <SummaryRow label="Sesiones/sem" value={formData.exact_training_frequency?.toString()} />
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            <DashboardFixedFooter>
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate("/dashboard/clients")}
                    >
                        Cancelar
                    </Button>
                    <Button variant="primary" size="md" onClick={handleShowReview}>
                        Siguiente
                    </Button>
                </div>
            </DashboardFixedFooter>

            <CompleteProfileModal
                isOpen={showCompleteProfileModal}
                onClose={() => setShowCompleteProfileModal(false)}
            />
        </>
    );
};

function SummaryRow({ label, value }: { label: string; value?: string }) {
    return (
        <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-foreground">{value || "—"}</dd>
        </div>
    );
}
