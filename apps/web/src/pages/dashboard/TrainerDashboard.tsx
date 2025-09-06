/**
 * Página principal del dashboard del entrenador
 * Usa ProtectedRoute + DashboardLayout component
 * Siguiendo arquitectura modular establecida
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { DashboardLayout } from "../../components/dashboard/DashboardLayout";

export const TrainerDashboard: React.FC = () => {
    return (
        <ProtectedRoute>
            <DashboardLayout />
        </ProtectedRoute>
    );
};

export default TrainerDashboard;