/**
 * ClientSessionProgrammingTab.tsx — Tab de programación de sesiones
 *
 * Contexto:
 * - Calendario mensual con sesiones del cliente
 * - Lista de Session Templates disponibles
 * - Crear sesión desde template
 * - Ver bloques y ejercicios de sesiones
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React, { useState } from "react";
import { useGetSessionTemplatesQuery } from "@nexia/shared/api/sessionProgrammingApi";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientSessionProgrammingTabProps {
    clientId: number;
}

export const ClientSessionProgrammingTab: React.FC<ClientSessionProgrammingTabProps> = ({
    clientId,
}) => {
    const { data: templates, isLoading, isError, error } = useGetSessionTemplatesQuery({
        skip: 0,
        limit: 100,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        const errorMessage =
            error && typeof error === "object" && "data" in error
                ? String((error as { data: unknown }).data)
                : "No se pudieron cargar las plantillas de sesión";

        return (
            <div className="p-6">
                <Alert variant="error" title="Error al cargar templates" message={errorMessage} />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className={TYPOGRAPHY.sectionTitle}>Session Programming</h2>
                <p className="text-slate-600 mt-2">
                    Gestiona las sesiones de entrenamiento del cliente
                </p>
            </div>

            {/* TODO: Implementar calendario mensual */}
            {/* TODO: Implementar lista de templates */}
            {/* TODO: Implementar crear sesión desde template */}
            {/* TODO: Implementar visualización de bloques y ejercicios */}

            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                    <p className="text-slate-500 text-lg mb-2">🚧 En desarrollo</p>
                    <p className="text-slate-400 text-sm">
                        Implementación con backend real en progreso
                    </p>
                    {templates && templates.length > 0 && (
                        <p className="text-slate-400 text-sm mt-2">
                            {templates.length} template(s) disponible(s)
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

