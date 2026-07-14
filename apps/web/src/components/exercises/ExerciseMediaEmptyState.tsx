/**
 * ExerciseMediaEmptyState — Hero sin video/imagen para detalle de ejercicio.
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    EXERCISE_DETAIL_MEDIA_CONTENT,
    EXERCISE_DETAIL_MEDIA_DESCRIPTION,
    EXERCISE_DETAIL_MEDIA_FRAME,
    EXERCISE_DETAIL_MEDIA_IMAGE,
    EXERCISE_DETAIL_MEDIA_OVERLAY,
    EXERCISE_DETAIL_MEDIA_TITLE,
    EXERCISE_MEDIA_EMPTY_COPY,
} from "./exerciseDetailPresentation";

export interface ExerciseMediaEmptyStateProps {
    className?: string;
}

export const ExerciseMediaEmptyState: React.FC<ExerciseMediaEmptyStateProps> = ({
    className,
}) => {
    const { imageSrc, imageAlt, title, description } = EXERCISE_MEDIA_EMPTY_COPY;

    return (
        <div className={cn(EXERCISE_DETAIL_MEDIA_FRAME, className)} role="img" aria-label={imageAlt}>
            <img
                src={imageSrc}
                alt=""
                aria-hidden
                className={EXERCISE_DETAIL_MEDIA_IMAGE}
                loading="lazy"
                decoding="async"
            />
            <div className={EXERCISE_DETAIL_MEDIA_OVERLAY} aria-hidden />
            <div className={EXERCISE_DETAIL_MEDIA_CONTENT}>
                <p className={EXERCISE_DETAIL_MEDIA_TITLE}>{title}</p>
                <p className={EXERCISE_DETAIL_MEDIA_DESCRIPTION}>{description}</p>
            </div>
        </div>
    );
};
