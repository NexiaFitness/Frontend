/**
 * adminCatalogImportChangePresentation.ts — Copy y formato de los cambios del import Excel.
 *
 * Contexto: QA_H8_P_2026-11-07. El resumen mostraba un cambio de músculos como el JSON en
 * bruto. El backend envía `items` (añadido, quitado, cambiado, con nombre en español) y aquí
 * se convierten en frases: «Añadido: Glúteo mayor (Sinergista)», «Erectores espinales ·
 * Objetivo: prioridad 0 → 2». Las palabras son las del Excel (Objetivo, Primario,
 * Extrapolación, Sí/No) para que el administrador lea lo mismo en los dos sitios.
 * Notas de mantenimiento: vive aparte porque `adminCatalogPresentation.ts` está en el límite
 * de 600 líneas. La nota de evidencia nunca se muestra: solo que cambió. Lo usan el resumen
 * del import y el historial de la ficha: una sola forma de leer un cambio.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import type {
    CatalogImportItemAttribute,
    CatalogImportItemAttributeChangeOut,
    CatalogImportItemChangeOut,
} from "@nexia/shared/types/adminCatalog";

export const ADMIN_CATALOG_IMPORT_CHANGE_COPY = {
    added: "Añadido",
    removed: "Quitado",
    arrow: "→",
    empty: "—",
    noteChanged: "nota de evidencia cambiada",
    /** El elemento ya no existe en el catálogo (p. ej. una etiqueta retirada). */
    removedFromCatalog: "elemento ya eliminado del catálogo",
    attribute: {
        role: "rol",
        priority: "prioridad",
        evidence_level: "evidencia",
        is_coach_decision: "decisión del entrenador",
        evidence_note: "nota de evidencia",
    } satisfies Record<CatalogImportItemAttribute, string>,
    role: {
        prime_mover: "Objetivo",
        synergist: "Sinergista",
        stabilizer: "Estabilizador",
        primary: "Primario",
        secondary: "Secundario",
    } as Record<string, string>,
    evidenceLevel: {
        closed: "Cerrado",
        extrapolation: "Extrapolación",
        limited: "Evidencia limitada",
    } as Record<string, string>,
    boolean: { true: "Sí", false: "No" } as Record<string, string>,
} as const;

const COPY = ADMIN_CATALOG_IMPORT_CHANGE_COPY;

function roleLabel(role: string | null | undefined): string | null {
    if (!role) return null;
    return COPY.role[role] ?? role;
}

function attributeValue(attribute: CatalogImportItemAttribute, value: string | null): string {
    if (value == null || value === "") return COPY.empty;
    if (attribute === "role") return roleLabel(value) ?? value;
    if (attribute === "evidence_level") return COPY.evidenceLevel[value] ?? value;
    if (attribute === "is_coach_decision") return COPY.boolean[value] ?? value;
    return value;
}

function attributeText(change: CatalogImportItemAttributeChangeOut): string {
    if (change.attribute === "evidence_note") return COPY.noteChanged;
    const label = COPY.attribute[change.attribute];
    const before = attributeValue(change.attribute, change.before);
    const after = attributeValue(change.attribute, change.after);
    return `${label} ${before} ${COPY.arrow} ${after}`;
}

/** Una línea legible por elemento de una relación del ejercicio. */
export function catalogImportItemLine(item: CatalogImportItemChangeOut): string {
    const role = roleLabel(item.role);
    const name = item.name ?? COPY.removedFromCatalog;
    if (item.change === "added" || item.change === "removed") {
        const verb = item.change === "added" ? COPY.added : COPY.removed;
        return role ? `${verb}: ${name} (${role})` : `${verb}: ${name}`;
    }
    const subject = role ? `${name} · ${role}` : name;
    return `${subject}: ${item.attributes.map(attributeText).join("; ")}`;
}
