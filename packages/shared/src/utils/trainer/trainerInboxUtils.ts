/**
 * trainerInboxUtils.ts — Inbox entrenador: prioridad, badge y deep links (F1).
 */

import type {
    ClientInboxItem,
    NotificationItem,
    NotificationPayload,
    NotificationType,
} from "../../types/notification";
import type { ClientFeedback } from "../../types/training";

const URGENT_FATIGUE_THRESHOLD = 8;

export function feedbackNeedsUrgentAttention(item: ClientFeedback): boolean {
    const hasPain = Boolean(item.pain_or_discomfort?.trim());
    const highFatigue =
        item.fatigue_level != null && item.fatigue_level >= URGENT_FATIGUE_THRESHOLD;
    return hasPain || highFatigue;
}

export function countPendingTrainerResponses(feedback: ClientFeedback[]): number {
    return feedback.filter((item) => !item.trainer_response?.trim()).length;
}

function getNotificationPriority(notification: NotificationItem): 1 | 2 | 3 {
    if (notification.notification_type === "new_feedback") {
        return notification.payload_json?.urgent ? 1 : 2;
    }
    if (notification.notification_type === "fatigue_alert") return 2;
    if (notification.notification_type === "session_cancelled") return 2;
    if (notification.notification_type === "new_client_assigned") return 3;
    return 3;
}

function getActionLabel(type: NotificationType): string {
    switch (type) {
        case "new_feedback":
            return "Ver feedback";
        case "fatigue_alert":
            return "Ver alerta";
        case "session_cancelled":
            return "Ver agenda";
        case "new_client_assigned":
            return "Ver resumen";
        default:
            return "Ver detalle";
    }
}

export function buildInboxDeepLink(
    clientId: number,
    payload: NotificationPayload | null | undefined,
): string {
    const tab = payload?.tab ?? "overview";
    const focus = payload?.focus;
    const base = `/dashboard/clients/${clientId}?tab=${tab}`;
    if (focus) return `${base}&focus=${focus}`;
    return base;
}

export function notificationToInboxItem(notification: NotificationItem): ClientInboxItem {
    const clientId = notification.client_id ?? notification.payload_json?.client_id ?? 0;
    const entityId = notification.entity_id ?? undefined;

    return {
        id: `${notification.notification_type}-${notification.id}`,
        notificationId: notification.id,
        type: notification.notification_type,
        priority: getNotificationPriority(notification),
        title: notification.title,
        body: notification.body,
        clientId,
        entityType: notification.entity_type ?? undefined,
        entityId,
        createdAt: notification.created_at,
        isRead: notification.is_read,
        isResolved: notification.is_resolved,
        actionLabel: getActionLabel(notification.notification_type),
        deepLink: buildInboxDeepLink(clientId, notification.payload_json),
    };
}

export function buildClientInboxItemsFromNotifications(
    notifications: NotificationItem[],
): ClientInboxItem[] {
    return [...notifications]
        .map(notificationToInboxItem)
        .sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
}

export function computeInboxBadge(items: ClientInboxItem[]): number {
    return items.filter((item) => !item.isResolved).length;
}

export function formatInboxBadgeCount(count: number): string | null {
    if (count <= 0) return null;
    return count > 9 ? "9+" : String(count);
}

export function getInboxItemBorderClass(priority: 1 | 2 | 3): string {
    if (priority === 1) return "border-l-warning";
    if (priority === 2) return "border-l-destructive";
    return "border-l-primary";
}
