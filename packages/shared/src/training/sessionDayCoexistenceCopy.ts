/**
 * Copy para avisos de coexistencia de sesiones el mismo día (G4 / QA-9).
 * Aviso informativo, no bloqueo.
 */

export type SessionDayCoexistenceKind = "program" | "standalone";

export interface SessionDayCoexistenceItem {
    session_kind: "training" | "standalone";
    session_name?: string | null;
}

function labelForItem(item: SessionDayCoexistenceItem): string {
    const name = item.session_name?.trim() || "Sesión sin nombre";
    if (item.session_kind === "standalone") {
        return `sesión suelta «${name}»`;
    }
    return `sesión de programa «${name}»`;
}

/**
 * Mensaje cuando ya hay sesiones en la fecha y el usuario crea otra (modo programa o suelta).
 * null si no hay sesiones ese día.
 */
export function buildSessionDayCoexistenceMessage(
    existingOnDay: readonly SessionDayCoexistenceItem[],
    creatingKind: SessionDayCoexistenceKind,
): string | null {
    if (existingOnDay.length === 0) return null;

    const labels = existingOnDay.map(labelForItem);
    const listed =
        labels.length === 1
            ? labels[0]
            : `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;

    if (creatingKind === "program") {
        return `Este día ya tiene ${listed}. Puedes crear además una sesión de programa; no sustituye la(s) existente(s).`;
    }
    return `Este día ya tiene ${listed}. Puedes crear otra sesión suelta el mismo día si lo necesitas.`;
}
