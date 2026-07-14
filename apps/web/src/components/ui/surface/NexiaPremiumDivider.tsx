/**
 * NexiaPremiumDivider.tsx — Divisor horizontal cyan reutilizable.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { NEXIA_DIVIDER, type NexiaDividerTone } from "./nexiaDividerPresentation";

export interface NexiaPremiumDividerProps {
    tone?: NexiaDividerTone;
    className?: string;
}

export const NexiaPremiumDivider: React.FC<NexiaPremiumDividerProps> = ({
    tone = "subtle",
    className,
}) => {
    return <div className={cn(NEXIA_DIVIDER[tone], className)} aria-hidden />;
};
