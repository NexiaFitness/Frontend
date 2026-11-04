/**
 * catalogPreview.ts — Texto de «Por serie» en la ficha del admin (H5 §2.1).
 *
 * El número sale del multiplicador de una serie. La coma decimal es la de la UI.
 */

export function formatCatalogMultiplier(raw: string): string {
    const value = Number(raw);
    if (!Number.isFinite(value)) return raw;
    if (Number.isInteger(value)) return String(value);
    return String(value).replace(".", ",");
}

export function formatCatalogVolumePerSet(
    groups: ReadonlyArray<{ name: string; multiplier: string }>
): string {
    if (groups.length === 0) return "";
    const parts = groups.map(
        (group) => `${group.name} ${formatCatalogMultiplier(group.multiplier)}`
    );
    return `Por serie: ${parts.join(" · ")}`;
}
