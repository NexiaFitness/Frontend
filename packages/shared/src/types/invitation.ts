export type InvitationStatus = "pending" | "accepted" | "expired" | "cancelled";

export interface InvitationWarning {
    code: string;
    message: string;
    requires_acknowledgement: boolean;
    current_trainer_name?: string | null;
    invitation_id?: number | null;
}

export interface InvitationPrecheckResponse {
    email: string;
    can_invite: boolean;
    warnings: InvitationWarning[];
}

export interface InvitationCreate {
    nombre: string;
    apellidos?: string;
    email: string;
    acknowledge_transfer?: boolean;
}

export interface Invitation {
    id: number;
    client_profile_id?: number | null;
    email: string;
    nombre?: string | null;
    status: InvitationStatus;
    expires_at: string;
    created_at: string;
    magic_link?: string | null;
}

export interface InvitationListResponse {
    items: Invitation[];
    total: number;
    page: number;
    page_size: number;
}

export interface InvitationValidateResponse {
    valid: boolean;
    email?: string | null;
    nombre?: string | null;
    apellidos?: string | null;
    trainer_name?: string | null;
    expires_at?: string | null;
    requires_trainer_switch?: boolean;
    previous_trainer_name?: string | null;
    user_exists?: boolean;
    reason?: string | null;
}

export interface InvitationAcceptRequest {
    token: string;
    password?: string;
    nombre?: string;
    apellidos?: string;
    tos_accepted?: boolean;
    confirm_trainer_switch?: boolean;
    tos_version?: string;
}

export interface InvitationAcceptResponse {
    user: Record<string, unknown>;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    client_profile_id: number;
    requires_onboarding: boolean;
}
