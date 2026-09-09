/**
 * AddPillGrid.tsx — Contenedor de AddPill (grid premium o wrap compact).
 */

import React from "react";

import { cn } from "@/lib/utils";

import { addPillGridClass, type AddPillVariant } from "./addPillPresentation";

export interface AddPillGridProps {
    variant?: AddPillVariant;
    className?: string;
    children: React.ReactNode;
}

export const AddPillGrid: React.FC<AddPillGridProps> = ({
    variant = "premium",
    className,
    children,
}) => (
    <div className={cn(addPillGridClass(variant), className)}>{children}</div>
);
