/**
 * Formato compacto para tablas expandibles V04 (sin scroll lateral en móvil).
 */

export function formatPrescriptionTableRest(
    seconds: number | null | undefined
): string | null {
    if (seconds == null || seconds <= 0) return null;
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min}m`;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function formatPrescriptionTableLoad(kg: number | null | undefined): string | null {
    if (kg == null || !Number.isFinite(kg)) return null;
    return Number.isInteger(kg) ? `${kg}kg` : `${kg}kg`;
}
