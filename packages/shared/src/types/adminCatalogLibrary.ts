/**
 * adminCatalogLibrary.ts — Contrato de la biblioteca RepDB (SPEC_H5 §2.3, 2026-11-05).
 *
 * Copiado del OpenAPI de la app: los candidatos de tanda son de solo lectura
 * (`writable: false`, `scope: "batch"`). Emparejar, descartar y adoptar existen
 * para `scope: "library"` en estado `new`.
 */

import type { ExerciseCatalogBundleCreateIn } from "./adminCatalog";

export type LibraryCandidateStatus = "new" | "matched" | "adopted" | "discarded";
export type LibraryCandidateScope = "batch" | "library";

export interface LibraryDraftMuscleOut {
    muscle: string;
    role: string;
}

export interface LibraryUnresolvedMuscleOut {
    repdb_muscle: string;
    role: string;
    reason: string;
}

export interface LibraryDraftOut {
    nombre?: string | null;
    nombre_ingles: string;
    tipo?: string | null;
    objetivo_entrenamiento?: string | null;
    laterality: string;
    nivel?: string | null;
    muscles: LibraryDraftMuscleOut[];
    unresolved_muscles: LibraryUnresolvedMuscleOut[];
    equipment?: string | null;
    mapping_discard_reason?: string | null;
    unmapped: string[];
}

export interface LibraryCandidateOut {
    id: number;
    source_ref: string;
    name_en: string;
    name_es?: string | null;
    status: LibraryCandidateStatus | string;
    scope: LibraryCandidateScope;
    writable: boolean;
    review_note?: string | null;
    matched_exercise_id?: number | null;
    adopted_exercise_id?: number | null;
}

export interface LibraryCandidateDetailOut extends LibraryCandidateOut {
    draft: LibraryDraftOut;
}

export interface LibraryCandidateListOut {
    items: LibraryCandidateOut[];
    total: number;
    skip: number;
    limit: number;
    versioned_batch_refs: number;
    batch_count: number;
    library_count: number;
}

export interface LibraryCandidateListParams {
    skip?: number;
    limit?: number;
    q?: string;
    status?: LibraryCandidateStatus;
    scope?: LibraryCandidateScope;
}

export interface LibraryAdoptOut {
    exercise_pk: number;
    candidate: LibraryCandidateOut;
}

export interface LibraryAdoptArgs {
    candidateId: number;
    body: ExerciseCatalogBundleCreateIn;
}
