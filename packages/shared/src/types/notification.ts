/**
 * notification.ts — Tipos inbox entrenador (F1).
 */

export type NotificationType =
    | "new_feedback"
    | "fatigue_alert"
    | "injury_alert"
    | "new_client_assigned"
    | "session_cancelled"
    | "low_rating"
    | "habits_incomplete"
    | "session_missed"
    | "pr_achieved";

export interface NotificationPayload {
    client_id?: number;
    tab?: string;
    focus?: "comms" | "alerts" | "inbox";
    feedback_id?: number;
    alert_id?: number;
    injury_id?: number;
    rating_id?: number;
    session_id?: number;
    urgent?: boolean;
}

export interface NotificationItem {
    id: number;
    notification_type: NotificationType;
    title: string;
    body: string;
    payload_json: NotificationPayload | null;
    entity_type?: string | null;
    entity_id?: number | null;
    client_id?: number | null;
    is_read: boolean;
    read_at?: string | null;
    is_resolved: boolean;
    resolved_at?: string | null;
    created_at: string;
}

export interface InboxNotificationListOut {
    items: NotificationItem[];
    total: number;
    unread_count: number;
}

export interface InboxNotificationUnreadCountOut {
    count: number;
    by_type: Record<string, number>;
}

export interface InboxNotificationMarkAllReadOut {
    marked_as_read: number;
}

export type ClientInboxItemType = NotificationType | "feedback_pending" | "fatigue_alert_unread";

export interface ClientInboxItem {
    id: string;
    notificationId: number;
    type: ClientInboxItemType;
    priority: 1 | 2 | 3;
    title: string;
    body: string;
    clientId: number;
    entityType?: string;
    entityId?: number;
    createdAt: string;
    isRead: boolean;
    isResolved: boolean;
    actionLabel: string;
    deepLink: string;
}
