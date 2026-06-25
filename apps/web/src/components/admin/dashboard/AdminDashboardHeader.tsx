/**
 * AdminDashboardHeader.tsx — Hero compacto admin (paridad atleta V01).
 */

import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { ATHLETE_PAGE_HEADER_ICON } from "@/components/athlete/account/athleteSettingsPresentation";

export interface AdminDashboardHeaderProps {
    firstName: string;
    subtitle: string;
}

export const AdminDashboardHeader: React.FC<AdminDashboardHeaderProps> = ({
    firstName,
    subtitle,
}) => {
    return (
        <header className="relative space-y-4 lg:space-y-5">
            <div className="flex items-start gap-4 lg:items-center lg:gap-6">
                <div
                    className={cn(ATHLETE_PAGE_HEADER_ICON, "size-12 shrink-0 lg:size-16")}
                    aria-hidden
                >
                    <Shield className="size-5 lg:size-7" />
                </div>
                <div className="min-w-0 flex-1 space-y-1 lg:space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Panel de administración
                    </p>
                    <h1 className="text-xl font-bold leading-tight text-foreground lg:text-3xl xl:text-4xl">
                        Hola,{" "}
                        <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                            {firstName}
                        </span>
                    </h1>
                    <p className="max-w-3xl text-sm text-muted-foreground lg:text-base xl:text-lg">
                        {subtitle}
                    </p>
                </div>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
