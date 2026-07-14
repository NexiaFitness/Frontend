/**
 * useAthleteNotificationPrefs.ts — Preferencias in-app atleta (F2-FE-12 / V13).
 */

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "athleteNotificationPrefs";

export interface AthleteNotificationPrefs {
    sessionReminders: boolean;
    feedbackPrompts: boolean;
    progressHighlights: boolean;
    /** Web push PWA — requiere permiso navegador + VAPID en servidor (F3a). */
    pushNotifications: boolean;
}

const DEFAULT_PREFS: AthleteNotificationPrefs = {
    sessionReminders: true,
    feedbackPrompts: true,
    progressHighlights: true,
    pushNotifications: false,
};

function readPrefs(): AthleteNotificationPrefs {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PREFS;
        const parsed = JSON.parse(raw) as Partial<AthleteNotificationPrefs>;
        return { ...DEFAULT_PREFS, ...parsed };
    } catch {
        return DEFAULT_PREFS;
    }
}

export function useAthleteNotificationPrefs() {
    const [prefs, setPrefs] = useState<AthleteNotificationPrefs>(readPrefs);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }, [prefs]);

    const updatePref = useCallback(
        (key: keyof AthleteNotificationPrefs, value: boolean) => {
            setPrefs((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    return { prefs, updatePref };
}
