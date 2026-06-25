/**
 * AthleteAccountProfileHero.tsx — Hero perfil read-only (V13 atleta).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";

export interface AthleteAccountProfileHeroProps {
    firstName: string;
    fullName: string;
    email: string;
    initials: string;
    memberSince: string | null;
}

export const AthleteAccountProfileHero: React.FC<AthleteAccountProfileHeroProps> = ({
    firstName,
    fullName,
    email,
    initials,
    memberSince,
}) => {
    return (
        <header className="relative space-y-4">
            <div
                className="pointer-events-none absolute -inset-x-4 -top-4 h-32 rounded-3xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-2xl lg:-inset-x-8 lg:h-40"
                aria-hidden
            />
            <div className="relative flex items-center gap-4 lg:gap-6">
                <div
                    className={cn(
                        "flex size-16 shrink-0 items-center justify-center rounded-2xl lg:size-20",
                        "bg-gradient-to-br from-primary/25 via-primary/10 to-success/10",
                        "ring-1 ring-primary/30 shadow-[0_8px_24px_-12px] shadow-primary/25",
                        "lg:shadow-[0_12px_32px_-12px] lg:shadow-primary/30"
                    )}
                    aria-hidden
                >
                    <span className="text-xl font-bold text-primary lg:text-2xl">{initials}</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tu cuenta
                    </p>
                    <h1 className="truncate text-xl font-bold leading-tight text-foreground lg:text-2xl">
                        Hola,{" "}
                        <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                            {firstName}
                        </span>
                    </h1>
                    <p className="truncate text-sm text-muted-foreground lg:text-base">{email}</p>
                    {memberSince && (
                        <p className="text-caption text-muted-foreground/80 lg:text-sm">
                            Atleta desde {memberSince}
                        </p>
                    )}
                    <p className="sr-only">{fullName}</p>
                </div>
            </div>
            <NexiaPremiumDivider className="w-full" />
        </header>
    );
};
