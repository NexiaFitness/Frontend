/**
 * clientAvatar.ts — Utilidades para avatares de clientes (solo clientes, no coaches/admins)
 *
 * El color es determinista por clientId: idNum % 5 → índice 0–4.
 * Mismo id → mismo color siempre. Usar únicamente para avatares de clientes.
 * La app (web/mobile) aplica el token con sus propios estilos (Tailwind, StyleSheet, etc.).
 *
 * @author NEXIA Frontend Team
 * @since v5.x
 */

/** Tokens de color semánticos para avatares de clientes (primary, success, warning, destructive, info) */
export type ClientAvatarColor = "primary" | "success" | "warning" | "destructive" | "info";

const AVATAR_COLORS: ClientAvatarColor[] = [
    "primary",
    "success",
    "warning",
    "destructive",
    "info",
];

/**
 * Devuelve el token de color para el avatar de un cliente.
 * Determinista: clientId % 5 → índice. Solo usar para clientes.
 *
 * @param clientId - ID del cliente (number o string)
 * @returns Token de color (primary | success | warning | destructive | info)
 */
export function getClientAvatarColor(clientId: number | string): ClientAvatarColor {
    const idNum = typeof clientId === "string" ? parseInt(clientId, 10) || 0 : clientId;
    const index = Math.abs(idNum) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

/**
 * Obtiene las iniciales del cliente (primeras letras de las 2 primeras palabras, mayúsculas).
 * Ej: "Laura", "Fernández" → "LF"
 *
 * @param nombre - Nombre del cliente
 * @param apellidos - Apellidos del cliente
 * @returns Iniciales en mayúsculas o "—" si no hay datos
 */
export function getClientInitials(nombre?: string | null, apellidos?: string | null): string {
    const first = nombre?.trim().charAt(0)?.toUpperCase() || "";
    const last = apellidos?.trim().charAt(0)?.toUpperCase() || "";
    return `${first}${last}`.trim() || "—";
}
