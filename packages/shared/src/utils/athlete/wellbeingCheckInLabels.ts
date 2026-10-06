/** Labels for athlete pre-session triage (1=Bajo, 2=Normal, 3=Alto). */

export function wellbeingCheckInShortLabel(level: number): string {
    if (level <= 1) return "Bajo";
    if (level >= 3) return "Alto";
    return "Normal";
}

export function wellbeingCheckInAriaLabel(level: number): string {
    return `Check-in pre-sesión: ${wellbeingCheckInShortLabel(level)}`;
}
