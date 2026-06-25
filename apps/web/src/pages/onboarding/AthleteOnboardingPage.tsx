/**
 * AthleteOnboardingPage — wizard 4 pasos post-invitación.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAthleteOnboarding } from "@nexia/shared";
import { ATHLETE_ONBOARDING_STEP_LABELS } from "@nexia/shared/types/athleteOnboarding";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { TrainingGoals } from "@/components/clients/shared/TrainingGoals";
import { Experience } from "@/components/clients/shared/Experience";
import { AthleteOnboardingIdentityStep } from "@/components/athlete/onboarding/AthleteOnboardingIdentityStep";
import { AthleteOnboardingHealthStep } from "@/components/athlete/onboarding/AthleteOnboardingHealthStep";
import {
    ATHLETE_ONBOARDING_FOOTER,
    ATHLETE_ONBOARDING_PAGE,
    ATHLETE_ONBOARDING_PROGRESS_TRACK,
    athleteOnboardingProgressWidth,
} from "@/components/athlete/onboarding/athleteOnboardingPresentation";

export const AthleteOnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        isProfileLoading,
        isProfileError,
        formData,
        errors,
        serverError,
        currentStep,
        totalSteps,
        updateField,
        goNext,
        goBack,
        submitOnboarding,
        isSubmitting,
        isLastStep,
    } = useAthleteOnboarding();

    const stepProps = { formData, errors, updateField };

    const handlePrimary = async () => {
        if (isLastStep) {
            const ok = await submitOnboarding();
            if (ok) navigate("/dashboard", { replace: true });
            return;
        }
        goNext();
    };

    if (isProfileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isProfileError) {
        return (
            <div className={ATHLETE_ONBOARDING_PAGE}>
                <Alert variant="error">
                    No se pudo cargar tu perfil. Recarga la página o vuelve a iniciar sesión.
                </Alert>
            </div>
        );
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <AthleteOnboardingIdentityStep {...stepProps} />;
            case 1:
                return <TrainingGoals {...stepProps} hideHeading />;
            case 2:
                return <Experience {...stepProps} />;
            case 3:
                return <AthleteOnboardingHealthStep {...stepProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className={ATHLETE_ONBOARDING_PAGE}>
                <header className="mb-6 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Paso {currentStep + 1} de {totalSteps}
                    </p>
                    <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                        Completa tu perfil
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {ATHLETE_ONBOARDING_STEP_LABELS[currentStep]}
                    </p>
                    <div className={ATHLETE_ONBOARDING_PROGRESS_TRACK} aria-hidden>
                        <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: athleteOnboardingProgressWidth(currentStep, totalSteps) }}
                        />
                    </div>
                </header>

                {serverError ? (
                    <div className="mb-4">
                        <Alert variant="error">{serverError}</Alert>
                    </div>
                ) : null}

                <div className="rounded-lg bg-surface p-4 sm:p-6">{renderStep()}</div>
            </div>

            <div className={ATHLETE_ONBOARDING_FOOTER}>
                <div className="mx-auto flex w-full max-w-lg gap-3 lg:max-w-2xl">
                    {currentStep > 0 ? (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goBack}
                            disabled={isSubmitting}
                            className="min-h-touch flex-1 lg:min-h-0"
                        >
                            Anterior
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handlePrimary}
                        disabled={isSubmitting}
                        className="min-h-touch flex-1 lg:min-h-0"
                    >
                        {isSubmitting
                            ? "Guardando…"
                            : isLastStep
                              ? "Confirmar y empezar"
                              : "Siguiente"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AthleteOnboardingPage;
