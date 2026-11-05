/**
 * AdminCatalogExerciseCreatePage.tsx — Alta ficha Admin (`/catalog/new`).
 *
 * `?libraryCandidate=` prellena el borrador y guarda por el alta de la biblioteca.
 */

import React from "react";
import { useSearchParams } from "react-router-dom";
import { AdminExerciseCatalogForm } from "@/components/admin/catalog/AdminExerciseCatalogForm";

export const AdminCatalogExerciseCreatePage: React.FC = () => {
    const [params] = useSearchParams();
    const raw = params.get("libraryCandidate");
    const libraryCandidateId = raw != null && /^\d+$/.test(raw) ? Number(raw) : null;
    return (
        <AdminExerciseCatalogForm
            mode="create"
            exercisePk={null}
            libraryCandidateId={libraryCandidateId}
        />
    );
};
