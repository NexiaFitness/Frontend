/**
 * AddPillGrid.tsx — Contenedor de AddPill (grid premium o wrap compact).
 */

import React from "react";

import { cn } from "@/lib/utils";

import {
    addPillGridClass,
    type AddPillGridLayout,
    type AddPillVariant,
} from "./addPillPresentation";

export interface AddPillGridProps {
    variant?: AddPillVariant;
    /** premium: inline (default) o grid de celdas anchas. */
    layout?: AddPillGridLayout;
    className?: string;
    children: React.ReactNode;
}

export const AddPillGrid: React.FC<AddPillGridProps> = ({
    variant = "premium",
    layout = "inline",
    className,
    children,
}) => (
    <div className={cn(addPillGridClass(variant, layout), className)}>{children}</div>
);
