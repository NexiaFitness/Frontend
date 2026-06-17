/**
 * AthleteNotificationPrefsCard.tsx — Toggles notificaciones in-app + push PWA (V13 F3a).
 */

import React, { useCallback } from "react";
import { Bell } from "lucide-react";
import { useAthleteNotificationPrefs } from "@/hooks/athlete/useAthleteNotificationPrefs";
import { useWebPush } from "@/hooks/athlete/useWebPush";

interface PrefToggleProps {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}

const PrefToggle: React.FC<PrefToggleProps> = ({
    id,
    label,
    description,
    checked,
    disabled = false,
    onChange,
}) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <div className="min-w-0">
            <label htmlFor={id} className="text-sm font-medium text-foreground">
                {label}
            </label>
            <p className="text-caption text-muted-foreground">{description}</p>
        </div>
        <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 size-5 shrink-0 rounded border-border accent-primary disabled:opacity-50"
        />
    </div>
);

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

    return (
        <section
            aria-label="Notificaciones"
            className="rounded-lg border border-border bg-card p-4 lg:p-6"
        >
            <div className="mb-4 flex items-center gap-2">
                <Bell className="size-5 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
                Ajusta qué avisos quieres recibir. Push funciona en PWA instalada (Chrome/Android;
                iOS limitado).
            </p>
            <div className="divide-y divide-border">
                <PrefToggle
                    id="pref-push"
                    label="Notificaciones push"
                    description="Respuestas del entrenador y recordatorios de sesión (requiere permiso)."
                    checked={prefs.pushNotifications}
                    disabled={pushBusy || status === "unsupported" || status === "disabled"}
                    onChange={handlePushToggle}
                />
                {errorMessage && (
                    <p className="py-2 text-caption text-destructive" role="status">
                        {errorMessage}
                    </p>
                )}
                <PrefToggle
                    id="pref-session-reminders"
                    label="Recordatorios de sesión"
                    description="Avisos cuando tienes entrenamiento programado hoy (in-app)."
                    checked={prefs.sessionReminders}
                    onChange={(v) => updatePref("sessionReminders", v)}
                />
                <PrefToggle
                    id="pref-feedback-prompts"
                    label="Feedback post-sesión"
                    description="Recuerda enviar sensaciones tras completar un entreno."
                    checked={prefs.feedbackPrompts}
                    onChange={(v) => updatePref("feedbackPrompts", v)}
                />
                <PrefToggle
                    id="pref-progress-highlights"
                    label="Logros y progreso"
                    description="Rachas, récords y hitos en tu dashboard."
                    checked={prefs.progressHighlights}
                    onChange={(v) => updatePref("progressHighlights", v)}
                />
            </div>
        </section>
    );
};
