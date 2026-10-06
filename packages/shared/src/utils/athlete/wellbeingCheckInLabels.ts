/** Labels for athlete pre-session triage (1=Bajo, 2=Normal, 3=Alto). */

export function wellbeingCheckInShortLabel(level: number): string {
    if (level <= 1) return "Bajo";
    if (level >= 3) return "Alto";
    return "Normal";
}

export function wellbeingCheckInAriaLabel(level: number): string {
    return `Check-in pre-sesión: ${wellbeingCheckInShortLabel(level)}`;
}

export function wellbeingCheckInTrainerStatusCopy(input: {
    isLoading: boolean;
    isError: boolean;
    checkIn: { pre_fatigue_level: number } | null | undefined;
}): string {
    if (input.isLoading) return "Check-in…";
    if (input.isError) return "No se pudo cargar el check-in";
    if (input.checkIn) {
        return `Check-in pre-sesión: ${wellbeingCheckInShortLabel(input.checkIn.pre_fatigue_level)}`;
    }
    return "Sin check-in pre-sesión";
}
