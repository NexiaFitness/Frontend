export type InvitationInvalidReason =
    | "invalid"
    | "expired"
    | "cancelled"
    | "already_accepted"
    | string;

const INVALID_REASON_MESSAGES: Record<string, string> = {
    invalid: "Este enlace de invitación no es válido.",
    expired: "Esta invitación ha expirado. Pide a tu entrenador que te reenvíe una nueva.",
    cancelled: "Esta invitación fue cancelada por el entrenador.",
    already_accepted: "Esta invitación ya fue aceptada. Puedes iniciar sesión con tu cuenta.",
};

export function getInvitationInvalidMessage(reason?: InvitationInvalidReason | null): string {
    if (!reason) return INVALID_REASON_MESSAGES.invalid;
    return INVALID_REASON_MESSAGES[reason] ?? INVALID_REASON_MESSAGES.invalid;
}

export function formatInvitationExpiry(expiresAt?: string | null): string | null {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
