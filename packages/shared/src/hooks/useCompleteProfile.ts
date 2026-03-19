/**
 * useCompleteProfile.ts
 * -----------------------------------------------------
 * Shared hook for Complete Profile workflow logic.
 * Works for both web and mobile apps.
 * 
 * @scope Shared business logic (cross-platform)
 * @author NEXIA
 * @since v2.3.0
 */

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import type { RootState } from "@nexia/shared/store";

interface UseCompleteProfileProps {
    onRedirect?: (path: string) => void;
}

export const useCompleteProfile = ({ onRedirect }: UseCompleteProfileProps = {}) => {
    // Usar selectors directos para evitar bucle infinito
    const user = useSelector((state: RootState) => state.auth.user);
    const isLoading = useSelector((state: RootState) => state.auth.isLoading);
    const isAuthenticated = Boolean(user) || isLoading;
    const isTrainer = user?.role === USER_ROLES.TRAINER;
    
    // Obtener perfil del trainer actual desde JWT
    const { 
        data: trainerData, 
        isLoading: isLoadingTrainer,
        error: trainerError 
    } = useGetCurrentTrainerProfileQuery(
        undefined,
        { skip: !user || !isTrainer }
    );

    const trainer = trainerData;

    // ✅ OPTIMIZACIÓN: Memoizar isProfileComplete para evitar re-renders innecesarios
    const isProfileComplete = useMemo(() => {
        return Boolean(trainer &&
            trainer.occupation &&
            trainer.training_modality &&
            trainer.location_country &&
            trainer.location_city &&
            trainer.telefono);
    }, [
        trainer?.occupation,
        trainer?.training_modality,
        trainer?.location_country,
        trainer?.location_city,
        trainer?.telefono,
    ]);


    // Redirect si no es trainer
    useEffect(() => {
        if (user && !isTrainer && onRedirect) {
            onRedirect('/dashboard');
        }
    }, [user, isTrainer, onRedirect]);

    // Redirect si ya está completo
    useEffect(() => {
        if (trainer && isProfileComplete && onRedirect) {
            onRedirect('/dashboard');
        }
    }, [trainer, isProfileComplete, onRedirect]);

    // Log estratégico del perfil del trainer
    useEffect(() => {
        if (isTrainer && !isLoadingTrainer) {
            console.info("[useCompleteProfile] Trainer profile:", {
                hasTrainer: !!trainer,
                isComplete: isProfileComplete,
                missingFields: trainer ? {
                    occupation: !trainer.occupation,
                    training_modality: !trainer.training_modality,
                    location_country: !trainer.location_country,
                    location_city: !trainer.location_city,
                    telefono: !trainer.telefono
                } : 'no trainer data'
            });
        }
    }, [trainer, isTrainer, isLoadingTrainer, isProfileComplete]);

    return {
        user,
        trainer,
        isTrainer,
        isAuthenticated,
        isLoadingTrainer,
        trainerError,
        isProfileComplete,
    };
};
