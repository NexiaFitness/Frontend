/**
 * AdminDashboardHeader.tsx — Hero compacto admin (paridad atleta V01 / F3b §3.11).
 */

import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import {
    ATHLETE_PAGE_HEADER_ICON,
    NEXIA_PORTAL_GREETING_H1,
    NEXIA_PORTAL_GREETING_NAME,
    NEXIA_PORTAL_GREETING_SUBTITLE,
    NEXIA_PORTAL_PAGE_EYEBROW,
} from "@/components/athlete/account/athleteSettingsPresentation";

export interface AdminDashboardHeaderProps {
    firstName: string;
    subtitle: string;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
    firstName,
    subtitle,
}) => {
    return (
        <header className="space-y-4">
            <div className="flex items-start gap-4">
                <div className={cn(ATHLETE_PAGE_HEADER_ICON, "shrink-0")} aria-hidden>
                    <Shield className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                    <p className={NEXIA_PORTAL_PAGE_EYEBROW}>Panel de administración</p>
                    <h1 className={NEXIA_PORTAL_GREETING_H1}>
                        Hola, <span className={NEXIA_PORTAL_GREETING_NAME}>{firstName}</span>
                    </h1>
                    <p className={NEXIA_PORTAL_GREETING_SUBTITLE}>{subtitle}</p>
                </div>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
