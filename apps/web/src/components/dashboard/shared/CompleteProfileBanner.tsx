/**
 * CompleteProfileBanner - Aviso para perfiles incompletos.
 * 
 * Extraído desde TrainerDashboard para reutilización en cualquier dashboard.
 * Mantiene el diseño responsive y los estilos originales.
 * 
 * @since v2.4.1
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons/Button";

interface Props {
    isProfileComplete: boolean;
    redirectTo?: string;
}

export const CompleteProfileBanner: React.FC<Props> = ({
    isProfileComplete,
    redirectTo = "/dashboard/trainer/complete-profile",
}) => {
    const navigate = useNavigate();

    if (isProfileComplete) return null;

    return (
        <div className="px-4 lg:px-8 mb-8">
            <div className="bg-yellow-500/90 backdrop-blur-sm rounded-xl p-4 lg:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg border-2 border-yellow-600/30">
                <div className="flex items-start space-x-3">
                    <svg
                        className="w-6 h-6 text-yellow-900 shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div>
                        <h3 className="font-semibold text-yellow-900 text-base lg:text-lg">
                            Completa tu perfil profesional
                        </h3>
                        <p className="text-yellow-800 text-sm lg:text-base mt-1">
                            Necesitamos algunos datos más para que puedas gestionar clientes y entrenamientos
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate(redirectTo)}
                    variant="outline"
                    size="md"
                    className="whitespace-nowrap"
                >
                    Completar ahora
                </Button>
            </div>
        </div>
    );
};
