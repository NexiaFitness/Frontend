/**
 * ExercisesLibraryEmptyState.tsx — Empty state glass premium biblioteca de ejercicios.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    EXERCISES_LIBRARY_EMPTY_ACTION,
    EXERCISES_LIBRARY_EMPTY_ART,
    EXERCISES_LIBRARY_EMPTY_CARD,
    EXERCISES_LIBRARY_EMPTY_COPY,
    EXERCISES_LIBRARY_EMPTY_DESCRIPTION,
    EXERCISES_LIBRARY_EMPTY_GLOW,
    EXERCISES_LIBRARY_EMPTY_IMAGE,
    EXERCISES_LIBRARY_EMPTY_TITLE,
} from "./exercisesLibraryPresentation";

export interface ExercisesLibraryEmptyStateProps {
    variant: "library" | "filtered";
    action?: React.ReactNode;
    className?: string;
}

export const ExercisesLibraryEmptyState: React.FC<ExercisesLibraryEmptyStateProps> = ({
    variant,
    action,
    className,
}) => {
    const copy =
        variant === "library"
            ? EXERCISES_LIBRARY_EMPTY_COPY.libraryEmpty
            : EXERCISES_LIBRARY_EMPTY_COPY.filteredEmpty;

    return (
        <div className={cn(EXERCISES_LIBRARY_EMPTY_CARD, className)} role="status">
            <NexiaGlassAccentRim />
            <div className={EXERCISES_LIBRARY_EMPTY_GLOW} aria-hidden />
            <div className={EXERCISES_LIBRARY_EMPTY_ART}>
                <img
                    src={EXERCISES_LIBRARY_EMPTY_COPY.imageSrc}
                    alt={EXERCISES_LIBRARY_EMPTY_COPY.imageAlt}
                    className={EXERCISES_LIBRARY_EMPTY_IMAGE}
                    loading="lazy"
                    decoding="async"
                />
            </div>
            <h3 className={cn(EXERCISES_LIBRARY_EMPTY_TITLE, "relative z-[1]")}>{copy.title}</h3>
            <p className={cn(EXERCISES_LIBRARY_EMPTY_DESCRIPTION, "relative z-[1]")}>
                {copy.description}
            </p>
            {action && <div className={EXERCISES_LIBRARY_EMPTY_ACTION}>{action}</div>}
        </div>
    );
};
