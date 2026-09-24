/**
 * AdminCatalogExerciseEditPage.tsx — Edición ficha Admin (`/catalog/:exercisePk`).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { useParams } from "react-router-dom";
import { Alert } from "@/components/ui/feedback";
import { AdminExerciseCatalogForm } from "@/components/admin/catalog/AdminExerciseCatalogForm";
import { ADMIN_CATALOG_ALERT_SPACING, ADMIN_CATALOG_PAGE } from "@/components/admin/catalog/adminCatalogPresentation";

export const AdminCatalogExerciseEditPage: React.FC = () => {
    const { exercisePk } = useParams<{ exercisePk: string }>();
    const pk = exercisePk ? Number.parseInt(exercisePk, 10) : NaN;

    if (!Number.isFinite(pk) || pk < 1) {
        return (
            <div className={ADMIN_CATALOG_PAGE}>
                <Alert variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                    Identificador de ejercicio inválido
                </Alert>
            </div>
        );
    }

    return <AdminExerciseCatalogForm mode="edit" exercisePk={pk} />;
};
