/**
 * AthleteRunLoggingSummary.tsx — Resumen compacto en fase logging_rest (V05).
 */

import React from "react";
import { ATHLETE_RUN_LOGGING_SUMMARY } from "./athleteRunPresentation";

export interface AthleteRunLoggingSummaryProps {
    label: string;
}

export const AthleteRunLoggingSummary: React.FC<AthleteRunLoggingSummaryProps> = ({ label }) => {
    return <p className={ATHLETE_RUN_LOGGING_SUMMARY}>{label}</p>;
};
