/**
 * GreetingHeader — Saludo premium + fecha (dashboard entrenador).
 *
 * Tokens: trainerDashboardPresentation.ts · NEXIA_PORTAL_GREETING_*
 * Doc: DESIGN_PREMIUM.md
 */

import React from "react";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    TRAINER_DASHBOARD_GREETING_WRAP,
} from "@/components/dashboard/trainer/trainerDashboardPresentation";

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
}

function formatToday(): string {
    return new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function displayFirstName(fullName: string): string {
    const trimmed = fullName.trim();
    if (!trimmed) return "Entrenador";
    return trimmed.split(/\s+/)[0] ?? trimmed;
}

interface GreetingHeaderProps {
    userName?: string | null;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
    const firstName = displayFirstName(userName ?? "");

    return (
        <header className={TRAINER_DASHBOARD_GREETING_WRAP}>
            <div className="min-w-0 space-y-1.5">
                <h1 className={NEXIA_PORTAL_GREETING_H1}>
                    {getGreeting()},{" "}
                    <span className={NEXIA_PORTAL_GREETING_NAME}>{firstName}</span>
                </h1>
                <p className={`${NEXIA_PORTAL_GREETING_SUBTITLE} capitalize`}>{formatToday()}</p>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
