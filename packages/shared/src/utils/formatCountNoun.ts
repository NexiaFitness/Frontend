/**
 * formatCountNoun.ts — «1 patrón» / «2 patrones» (es-ES, cantidad + sustantivo).
 */

export function formatCountNoun(
    count: number,
    singular: string,
    plural: string,
): string {
    return `${count} ${count === 1 ? singular : plural}`;
}
