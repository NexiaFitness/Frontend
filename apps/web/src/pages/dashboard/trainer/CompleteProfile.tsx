/**
 * CompleteProfile — Página de completado de perfil profesional para trainers.
 * Aparece tras registro básico; requerido para acceso completo al dashboard.
 *
 * @author Frontend Team
 * @since v2.2.0
 * @updated v8.0.0 - Rediseño con tokens dark Nexia Sparkle Flow
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { CompleteProfileForm } from "@/components/dashboard/trainer";
import { useCompleteProfile } from "@nexia/shared";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { CheckCircle2 } from "lucide-react";

export const CompleteProfile: React.FC = () => {
    const navigate = useNavigate();

    const { isLoadingTrainer } = useCompleteProfile({
        onRedirect: (path: string) => navigate(path, { replace: true }),
    });

    if (isLoadingTrainer) {
        return (
            <div className="flex items-center justify-center py-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                    Completa tu perfil profesional
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Solo necesitamos algunos datos más para personalizar tu experiencia
                </p>
            </div>

            {/* Progress stepper */}
            <div className="flex items-center gap-3">
                <StepBadge step={1} label="Cuenta creada" status="done" />
                <div className="h-px flex-1 bg-border" />
                <StepBadge step={2} label="Perfil profesional" status="active" />
                <div className="h-px flex-1 bg-border" />
                <StepBadge step={3} label="Dashboard" status="pending" />
            </div>

            {/* Form */}
            <CompleteProfileForm />
        </div>
    );
};

function StepBadge({
    step,
    label,
    status,
}: {
    step: number;
    label: string;
    status: "done" | "active" | "pending";
}) {
    return (
        <div className="flex items-center gap-2">
            {status === "done" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/20 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
            ) : status === "active" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-sm font-bold text-primary">
                    {step}
                </div>
            ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground">
                    {step}
                </div>
            )}
            <span
                className={`hidden text-sm font-medium sm:inline ${
                    status === "active"
                        ? "text-foreground"
                        : status === "done"
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                }`}
            >
                {label}
            </span>
        </div>
    );
}
