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
        <header className="space-y-4">
            <div className="flex items-center gap-4">
                <div
                    className={cn(
                        "flex size-16 shrink-0 items-center justify-center rounded-2xl",
                        "bg-gradient-to-br from-primary/25 via-primary/10 to-success/10",
                        "ring-1 ring-primary/30 shadow-[0_8px_24px_-12px] shadow-primary/25"
                    )}
                    aria-hidden
                >
                    <span className="text-xl font-bold text-primary">{initials}</span>
                </div>
                <div className="min-w-0 space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Tu cuenta
                    </p>
                    <h1 className="truncate text-xl font-bold leading-tight text-foreground">
                        Hola,{" "}
                        <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                            {firstName}
                        </span>
                    </h1>
                    <p className="truncate text-sm text-muted-foreground">{email}</p>
                    {memberSince && (
                        <p className="text-caption text-muted-foreground/80">
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
