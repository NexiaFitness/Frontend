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
import {
    PLATFORM_ONBOARDING_PAGE_EYEBROW,
    PLATFORM_ONBOARDING_PAGE_SUBTITLE,
    PLATFORM_ONBOARDING_PAGE_TITLE,
    PLATFORM_ONBOARDING_PROGRESS_DIVIDER,
} from "@/components/ui/forms/platformFormPresentation";

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
            <div>
                <p className={PLATFORM_ONBOARDING_PAGE_EYEBROW}>Onboarding · Entrenador</p>
                <h1 className={PLATFORM_ONBOARDING_PAGE_TITLE}>Completa tu perfil profesional</h1>
                <p className={PLATFORM_ONBOARDING_PAGE_SUBTITLE}>
                    Solo necesitamos algunos datos más para personalizar tu experiencia
                </p>
            </div>

            <div className="flex items-center gap-3">
                <StepBadge step={1} label="Cuenta creada" status="done" />
                <div className={PLATFORM_ONBOARDING_PROGRESS_DIVIDER} />
                <StepBadge step={2} label="Perfil profesional" status="active" />
                <div className={PLATFORM_ONBOARDING_PROGRESS_DIVIDER} />
                <StepBadge step={3} label="Dashboard" status="pending" />
            </div>

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
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-success/40 bg-success/15 text-success shadow-[0_0_16px_-6px] shadow-success/50">
                    <CheckCircle2 className="h-4 w-4" />
                </div>
            ) : status === "active" ? (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/15 text-sm font-bold text-primary shadow-[0_0_18px_-6px] shadow-primary/50">
                    {step}
                </div>
            ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 text-sm font-medium text-muted-foreground">
                    {step}
                </div>
            )}
            <span
                className={`hidden text-sm font-medium sm:inline ${
                    status === "active"
                        ? "text-primary"
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
