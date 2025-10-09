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

import { useEffect } from "react";
import { useRoleGuard } from "./useRoleGuard";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { USER_ROLES } from "@nexia/shared/utils/roles";

interface UseCompleteProfileProps {
    onRedirect?: (path: string) => void;
}

export const useCompleteProfile = ({ onRedirect }: UseCompleteProfileProps = {}) => {
    const { user, isTrainer, isAuthenticated } = useRoleGuard("complete-profile");
    
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

    // Verificar si el perfil está completo
    const isProfileComplete = trainer &&
        trainer.occupation &&
        trainer.training_modality &&
        trainer.location_country &&
        trainer.location_city &&
        trainer.telefono;

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
