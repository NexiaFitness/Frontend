/**
 * GreetingHeader — Saludo dinámico + fecha según DASHBOARD_LAYOUT_SPEC
 *
 * Usa PageTitle para mismo patrón que el resto de vistas.
 * getGreeting(): Buenos días (h < 12), Buenas tardes (h < 20), Buenas noches (resto)
 * Fecha: Intl.DateTimeFormat es-ES (weekday, day, month, year)
 *
 * @author Frontend Team
 * @since v5.x - DASHBOARD_LAYOUT_SPEC
 */

import React from "react";
import { PageTitle } from "./PageTitle";

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

interface GreetingHeaderProps {
    userName?: string | null;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ userName }) => {
    const name = userName?.trim() || "Entrenador";
    return (
        <PageTitle
            title={`${getGreeting()}, ${name}.`}
            subtitle={formatToday()}
            subtitleClassName="capitalize"
        />
    );
};
