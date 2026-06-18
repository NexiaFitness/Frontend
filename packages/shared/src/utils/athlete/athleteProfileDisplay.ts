/**
 * athleteProfileDisplay.ts — Texto e iniciales de perfil atleta (sin DOM).
 * Contexto: V13 cuenta, hero dashboard. Contratos: agent.md §5.
 */

export function getAthleteDisplayFirstName(fullName: string): string {
    const trimmed = fullName.trim();
    if (!trimmed) return "Atleta";
    return trimmed.split(/\s+/)[0] ?? trimmed;
}

export function getAthleteProfileInitials(nombre: string, apellidos: string): string {
    const first = nombre.trim().charAt(0);
    const last = apellidos.trim().charAt(0);
    const combined = `${first}${last}`.toUpperCase();
    return combined || "A";
}

export function formatAthleteMemberSince(isoDate: string | undefined | null): string | null {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}
