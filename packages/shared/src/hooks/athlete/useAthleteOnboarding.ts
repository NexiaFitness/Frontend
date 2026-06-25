/**
 * useAthleteOnboarding — wizard 4 pasos + PUT /clients/profile/onboarding.
 */

import { useCallback, useEffect, useState } from "react";
import {
    useCompleteAthleteOnboardingMutation,
    useGetCurrentClientProfileQuery,
} from "../../api/clientsApi";
import type { Client, ClientFormData, ClientFormErrors } from "../../types/client";
import { ATHLETE_ONBOARDING_STEP_COUNT } from "../../types/athleteOnboarding";
import {
    toAthleteOnboardingPayload,
    validateAthleteOnboardingStep,
} from "../../utils/validations/clients/athleteOnboardingValidation";

function mapProfileToFormData(profile: Client): ClientFormData {
    return {
        nombre: profile.nombre ?? "",
        apellidos: profile.apellidos ?? "",
        mail: profile.mail ?? "",
        telefono: profile.telefono ?? "",
        sexo: profile.sexo ?? undefined,
        birthdate: profile.birthdate ?? "",
        peso: profile.peso ?? undefined,
        altura: profile.altura ?? undefined,
        objetivo_entrenamiento: profile.objetivo_entrenamiento ?? undefined,
        descripcion_objetivos: profile.descripcion_objetivos ?? "",
        experiencia: profile.experiencia ?? undefined,
        frecuencia_semanal: profile.frecuencia_semanal ?? undefined,
        lesiones_relevantes: profile.lesiones_relevantes ?? "",
        id_passport: profile.id_passport ?? "",
        observaciones: profile.observaciones ?? "",
    };
}

const EMPTY_FORM: ClientFormData = {
    nombre: "",
    apellidos: "",
    mail: "",
};

function getFetchErrorDetail(error: unknown): string {
    if (error && typeof error === "object" && "data" in error) {
        const data = (error as { data?: unknown }).data;
        if (typeof data === "string") return data;
        if (data && typeof data === "object" && "detail" in data) {
            const detail = (data as { detail?: unknown }).detail;
            if (typeof detail === "string") return detail;
        }
    }
    return "No se pudo guardar tu perfil. Inténtalo de nuevo.";
}

export function useAthleteOnboarding() {
    const { data: profile, isLoading: isProfileLoading, isError: isProfileError } =
        useGetCurrentClientProfileQuery();
    const [completeOnboarding, { isLoading: isSubmitting }] =
        useCompleteAthleteOnboardingMutation();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<ClientFormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<ClientFormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (profile && !hydrated) {
            setFormData(mapProfileToFormData(profile));
            setHydrated(true);
        }
    }, [profile, hydrated]);

    const updateField = useCallback(
        <K extends keyof ClientFormData>(field: K, value: ClientFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => ({ ...prev, [field]: undefined }));
            setServerError(null);
        },
        [],
    );

    const validateCurrentStep = useCallback(() => {
        const result = validateAthleteOnboardingStep(currentStep, formData);
        setErrors(result.errors);
        return result.isValid;
    }, [currentStep, formData]);

    const goNext = useCallback(() => {
        if (!validateCurrentStep()) return false;
        setCurrentStep((prev) => Math.min(prev + 1, ATHLETE_ONBOARDING_STEP_COUNT - 1));
        return true;
    }, [validateCurrentStep]);

    const goBack = useCallback(() => {
        setErrors({});
        setServerError(null);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const submitOnboarding = useCallback(async (): Promise<boolean> => {
        const result = validateAthleteOnboardingStep(3, formData);
        setErrors(result.errors);
        if (!result.isValid) return false;

        setServerError(null);
        try {
            await completeOnboarding(toAthleteOnboardingPayload(formData)).unwrap();
            return true;
        } catch (error) {
            setServerError(getFetchErrorDetail(error));
            return false;
        }
    }, [completeOnboarding, formData]);

    return {
        profile,
        isProfileLoading,
        isProfileError,
        formData,
        errors,
        serverError,
        currentStep,
        totalSteps: ATHLETE_ONBOARDING_STEP_COUNT,
        updateField,
        goNext,
        goBack,
        submitOnboarding,
        isSubmitting,
        isLastStep: currentStep === ATHLETE_ONBOARDING_STEP_COUNT - 1,
    };
}
