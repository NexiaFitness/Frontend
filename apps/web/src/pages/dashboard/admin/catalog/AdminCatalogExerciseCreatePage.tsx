/**
 * AdminCatalogExerciseCreatePage.tsx — Alta ficha Admin (`/catalog/new`).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { AdminExerciseCatalogForm } from "@/components/admin/catalog/AdminExerciseCatalogForm";

export const AdminCatalogExerciseCreatePage: React.FC = () => (
    <AdminExerciseCatalogForm mode="create" exercisePk={null} />
);
