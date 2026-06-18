/**
 * AthleteNotificationPrefsCard.tsx — Toggles notificaciones in-app + push PWA (V13 F3a).
 */

import React, { useCallback } from "react";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { AthleteSettingsToggleRow } from "@/components/athlete/account/AthleteSettingsToggleRow";
import { useAthleteNotificationPrefs } from "@/hooks/athlete/useAthleteNotificationPrefs";
import { useWebPush } from "@/hooks/athlete/useWebPush";

const PREFS = [
    {
        id: "pref-session-reminders",
        key: "sessionReminders" as const,
        label: "Recordatorios de sesión",
        description: "Te avisamos cuando tienes entreno programado hoy.",
    },
    {
        id: "pref-feedback-prompts",
        key: "feedbackPrompts" as const,
        label: "Feedback post-sesión",
        description: "Recuerda compartir sensaciones tras completar un entreno.",
    },
    {
        id: "pref-progress-highlights",
        key: "progressHighlights" as const,
        label: "Logros y progreso",
        description: "Rachas, récords e hitos en tu inicio.",
    },
] as const;

export const AthleteNotificationPrefsCard: React.FC = () => {
    const { prefs, updatePref } = useAthleteNotificationPrefs();
    const { status, errorMessage, subscribe, unsubscribe } = useWebPush();

    const handlePushToggle = useCallback(
        async (enabled: boolean) => {
            if (enabled) {
                const ok = await subscribe();
                updatePref("pushNotifications", ok);
            } else {
                await unsubscribe();
                updatePref("pushNotifications", false);
            }
        },
        [subscribe, unsubscribe, updatePref]
    );

    const pushBusy = status === "subscribing";
    const pushDisabled =
        pushBusy || status === "unsupported" || status === "disabled";

    return (
        <AthleteSettingsSection
            title="Notificaciones"
            description="Elige qué avisos quieres recibir."
        >
            <AthleteSettingsToggleRow
                id="pref-push"
                label="Notificaciones push"
                description="Respuestas del entrenador y recordatorios en tu móvil."
                checked={prefs.pushNotifications}
                disabled={pushDisabled}
                onChange={handlePushToggle}
            />
            {errorMessage && (
                <p
                    className="border-b border-border/60 px-4 py-2 text-caption text-destructive"
                    role="status"
                >
                    {errorMessage}
                </p>
            )}
            {PREFS.map((pref, index) => (
                <AthleteSettingsToggleRow
                    key={pref.id}
                    id={pref.id}
                    label={pref.label}
                    description={pref.description}
                    checked={prefs[pref.key]}
                    onChange={(value) => updatePref(pref.key, value)}
                    isLast={index === PREFS.length - 1}
                />
            ))}
        </AthleteSettingsSection>
    );
};
