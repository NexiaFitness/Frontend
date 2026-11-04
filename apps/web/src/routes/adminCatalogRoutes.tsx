/**
 * adminCatalogRoutes.tsx — Rutas del catálogo admin.
 *
 * Extraídas de App.tsx (H5, agent.md §7.1) para que la revisión masiva
 * no vuelva a alargar ese archivo.
 */

import React from "react";
import { Route } from "react-router-dom";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

const AdminCatalogListPage = lazyWithRetry(() =>
    import("@/pages/dashboard/admin/catalog").then((m) => ({
        default: m.AdminCatalogListPage,
    }))
);
const AdminCatalogExerciseCreatePage = lazyWithRetry(() =>
    import("@/pages/dashboard/admin/catalog").then((m) => ({
        default: m.AdminCatalogExerciseCreatePage,
    }))
);
const AdminCatalogExerciseEditPage = lazyWithRetry(() =>
    import("@/pages/dashboard/admin/catalog").then((m) => ({
        default: m.AdminCatalogExerciseEditPage,
    }))
);
const AdminCatalogImportPage = lazyWithRetry(() =>
    import("@/pages/dashboard/admin/catalog").then((m) => ({
        default: m.AdminCatalogImportPage,
    }))
);

export const AdminCatalogRoutes: React.FC = () => {
    return (
        <>
            <Route
                path="admin/catalog/new"
                element={
                    <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} redirectTo="/dashboard">
                        <AdminCatalogExerciseCreatePage />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="admin/catalog/import"
                element={
                    <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} redirectTo="/dashboard">
                        <AdminCatalogImportPage />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="admin/catalog/:exercisePk"
                element={
                    <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} redirectTo="/dashboard">
                        <AdminCatalogExerciseEditPage />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="admin/catalog"
                element={
                    <RoleProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} redirectTo="/dashboard">
                        <AdminCatalogListPage />
                    </RoleProtectedRoute>
                }
            />
        </>
    );
};
