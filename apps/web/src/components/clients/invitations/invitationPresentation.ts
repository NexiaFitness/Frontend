import type { InvitationStatus } from "@nexia/shared/types/invitation";

export function getInvitationBadgeLabel(status: InvitationStatus): string {
    if (status === "pending") return "Pendiente de aceptar";
    if (status === "expired") return "Invitación expirada";
    return "Invitación";
}

export function getInvitationBadgeClass(status: InvitationStatus): string {
    if (status === "pending") return "bg-warning/10 text-warning";
    if (status === "expired") return "bg-muted text-muted-foreground";
    return "bg-muted text-muted-foreground";
}

export function getInvitationDisplayName(nombre: string | null | undefined, email: string): string {
    const trimmed = (nombre ?? "").trim();
    return trimmed.length > 0 ? trimmed : email;
}
