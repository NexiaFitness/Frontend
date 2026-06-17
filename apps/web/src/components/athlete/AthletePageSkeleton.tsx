/**

 * AthletePageSkeleton.tsx — Shimmer de carga móvil portal atleta (UX-FE-05).

 * Contexto: sustituye LoadingSpinner full-page en `< lg` (todas las vistas atleta).

 * Contratos: DESIGN_MOBILE §3.2, 09_UX §10.8, agent.md §5

 * @author Frontend Team

 * @since v6.2.0

 */



import React from "react";

import { cn } from "@/lib/utils";



export type AthletePageSkeletonVariant =

    | "dashboard"

    | "sessions-list"

    | "progress"

    | "session-preview"

    | "session-run"

    | "session-summary"

    | "session-feedback"

    | "feedback-history"

    | "plan"

    | "exercise-detail"

    | "account"

    | "default";



export interface AthletePageSkeletonProps {

    variant: AthletePageSkeletonVariant;

    className?: string;

}



export interface AthleteInlineListSkeletonProps {

    count?: number;

    itemClassName?: string;

    className?: string;

}



function Block({ className }: { className?: string }) {

    return (

        <div

            className={cn("rounded-md bg-surface-2 animate-pulse motion-reduce:animate-none", className)}

            aria-hidden

        />

    );

}



/** Skeleton inline para sheets y listas parciales (no full-page). */

export function AthleteInlineListSkeleton({

    count = 3,

    itemClassName = "h-20 rounded-lg",

    className,

}: AthleteInlineListSkeletonProps) {

    return (

        <div className={cn("space-y-3", className)} role="status" aria-busy="true" aria-label="Cargando">

            <span className="sr-only">Cargando contenido</span>

            {Array.from({ length: count }).map((_, i) => (

                <Block key={i} className={itemClassName} />

            ))}

        </div>

    );

}



function DashboardSkeleton() {

    return (

        <div className="space-y-6">

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                    <Block className="h-9 w-44 sm:h-10" />
                    <Block className="h-4 w-56" />
                </div>

                <Block className="size-11 shrink-0 rounded-full" />

            </div>

            <Block className="h-40 w-full rounded-xl" />

            <div className="space-y-3">
                <div className="flex justify-between">
                    <Block className="h-3 w-20" />
                    <Block className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="grid flex-1 grid-cols-7 gap-0.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Block key={i} className="mx-auto h-14 w-full max-w-[2.5rem] rounded-md" />
                        ))}
                    </div>
                    <Block className="size-14 shrink-0 rounded-full" />
                </div>
            </div>

            <div className="space-y-3">

                <Block className="h-4 w-32" />

                <div className="grid grid-cols-2 gap-3">

                    <Block className="h-24 rounded-lg" />

                    <Block className="h-24 rounded-lg" />

                </div>

            </div>

        </div>

    );

}



function SessionsListSkeleton() {

    return (

        <div className="space-y-4">

            <div className="space-y-2">

                <Block className="h-7 w-36" />

                <Block className="h-4 w-52" />

            </div>

            <div className="flex flex-wrap gap-2">

                {Array.from({ length: 4 }).map((_, i) => (

                    <Block key={i} className="h-8 w-20 rounded-full" />

                ))}

            </div>

            <div className="space-y-3">

                {Array.from({ length: 5 }).map((_, i) => (

                    <Block key={i} className="h-[88px] w-full rounded-lg" />

                ))}

            </div>

        </div>

    );

}



function ProgressSkeleton() {

    return (

        <div className="space-y-6">

            <Block className="h-5 w-20" />

            <div className="space-y-2">

                <Block className="h-8 w-40" />

                <Block className="h-4 w-56" />

            </div>

            <div className="grid gap-3 sm:grid-cols-3">

                {Array.from({ length: 3 }).map((_, i) => (

                    <Block key={i} className="h-24 rounded-lg" />

                ))}

            </div>

            <Block className="h-[200px] w-full rounded-lg" />

            <Block className="h-[200px] w-full rounded-lg" />

            <div className="space-y-2">

                <Block className="h-4 w-28" />

                <Block className="h-32 w-full rounded-lg" />

            </div>

        </div>

    );

}



function SessionPreviewSkeleton() {

    return (

        <div className="flex min-h-[70vh] flex-col">

            <Block className="mb-4 h-5 w-16" />

            <div className="flex-1 space-y-4">

                <div className="space-y-2">

                    <Block className="h-6 w-24 rounded-full" />

                    <Block className="h-8 w-3/4 max-w-xs" />

                    <Block className="h-4 w-40" />

                </div>

                <div className="flex gap-4">

                    <Block className="h-4 w-28" />

                    <Block className="h-4 w-36" />

                </div>

                <Block className="h-10 w-full rounded-lg" />

                {Array.from({ length: 3 }).map((_, i) => (

                    <Block key={i} className="h-28 w-full rounded-lg" />

                ))}

            </div>

            <Block className="mt-6 h-12 w-full rounded-lg" />

        </div>

    );

}



function SessionRunSkeleton() {

    return (

        <div className="flex min-h-[70vh] flex-col">

            <Block className="mb-4 h-9 w-full rounded-lg" />

            <div className="flex-1 space-y-4">

                <Block className="h-4 w-32" />

                <Block className="h-8 w-2/3 max-w-sm" />

                <Block className="h-5 w-48" />

                <Block className="aspect-video w-full rounded-lg" />

                <div className="space-y-3 pt-2">

                    <Block className="h-12 w-full rounded-lg" />

                    <Block className="h-12 w-full rounded-lg" />

                    <Block className="h-12 w-full rounded-lg" />

                </div>

            </div>

            <Block className="mt-6 h-12 w-full rounded-lg" />

        </div>

    );

}



function SessionSummarySkeleton() {

    return (

        <div className="flex min-h-[70vh] flex-col">

            <div className="flex-1 space-y-6">

                <Block className="h-[148px] w-full rounded-xl" />

                <div className="space-y-2">

                    {Array.from({ length: 2 }).map((_, i) => (

                        <Block key={i} className="h-12 w-full rounded-lg" />

                    ))}

                </div>

                <Block className="h-28 w-full rounded-xl" />

                <div className="space-y-2">

                    {Array.from({ length: 3 }).map((_, i) => (

                        <Block key={i} className="h-12 w-full rounded-lg" />

                    ))}

                </div>

            </div>

            <div className="mt-6 space-y-2">

                <Block className="h-12 w-full rounded-lg" />

                <Block className="h-12 w-full rounded-lg" />

            </div>

        </div>

    );

}



function SessionFeedbackSkeleton() {

    return (

        <div className="flex min-h-[70vh] flex-col">

            <div className="mb-6 space-y-2">

                <Block className="h-7 w-48" />

                <Block className="h-4 w-full max-w-sm" />

            </div>

            <div className="flex-1 space-y-6">

                {Array.from({ length: 2 }).map((_, i) => (

                    <div key={i} className="space-y-3 rounded-lg border border-border p-4">

                        <Block className="h-5 w-32" />

                        <Block className="h-2 w-full rounded-full" />

                        <div className="flex justify-between">

                            <Block className="h-3 w-8" />

                            <Block className="h-3 w-8" />

                        </div>

                    </div>

                ))}

                <Block className="h-14 w-full rounded-lg" />

            </div>

            <Block className="mt-6 h-12 w-full rounded-lg" />

        </div>

    );

}



function FeedbackHistorySkeleton() {

    return (

        <div className="space-y-4">

            <div className="flex items-center gap-3">

                <Block className="size-10 shrink-0 rounded-md" />

                <div className="flex-1 space-y-2">

                    <Block className="h-7 w-32" />

                    <Block className="h-4 w-56" />

                </div>

            </div>

            <AthleteInlineListSkeleton count={4} itemClassName="h-[100px] rounded-lg" />

        </div>

    );

}



function PlanSkeleton() {

    return (

        <div className="space-y-6">

            <div className="space-y-2 rounded-lg border border-border p-4">

                <Block className="h-4 w-20" />

                <Block className="h-7 w-3/4 max-w-xs" />

                <Block className="h-4 w-40" />

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {Array.from({ length: 3 }).map((_, i) => (

                    <Block key={i} className="h-24 rounded-lg" />

                ))}

            </div>

            <div className="space-y-3">

                <Block className="h-5 w-36" />

                {Array.from({ length: 2 }).map((_, i) => (

                    <Block key={i} className="h-16 w-full rounded-lg" />

                ))}

            </div>

        </div>

    );

}



function ExerciseDetailSkeleton() {

    return (

        <div className="space-y-6">

            <Block className="h-5 w-28" />

            <div className="space-y-2">

                <Block className="h-8 w-2/3 max-w-sm" />

                <Block className="h-4 w-32" />

            </div>

            <Block className="h-[220px] w-full rounded-lg" />

            <div className="space-y-2">

                <Block className="h-4 w-24" />

                {Array.from({ length: 4 }).map((_, i) => (

                    <Block key={i} className="h-14 w-full rounded-lg" />

                ))}

            </div>

        </div>

    );

}



function AccountSkeleton() {

    return (

        <div className="space-y-6">

            <div className="space-y-2">

                <Block className="h-8 w-36" />

                <Block className="h-4 w-64" />

            </div>

            <Block className="h-28 w-full rounded-lg" />

            <div className="space-y-4">

                <Block className="h-5 w-40" />

                <Block className="h-12 w-full rounded-lg" />

                <Block className="h-12 w-full rounded-lg" />

                <Block className="h-12 w-full rounded-lg" />

            </div>

            <Block className="h-32 w-full rounded-lg" />

        </div>

    );

}



function DefaultSkeleton() {

    return (

        <div className="space-y-6">

            <div className="space-y-2">

                <Block className="h-7 w-40" />

                <Block className="h-4 w-56" />

            </div>

            {Array.from({ length: 3 }).map((_, i) => (

                <Block key={i} className="h-32 w-full rounded-lg" />

            ))}

        </div>

    );

}



const VARIANTS: Record<AthletePageSkeletonVariant, React.FC> = {

    dashboard: DashboardSkeleton,

    "sessions-list": SessionsListSkeleton,

    progress: ProgressSkeleton,

    "session-preview": SessionPreviewSkeleton,

    "session-run": SessionRunSkeleton,

    "session-summary": SessionSummarySkeleton,

    "session-feedback": SessionFeedbackSkeleton,

    "feedback-history": FeedbackHistorySkeleton,

    plan: PlanSkeleton,

    "exercise-detail": ExerciseDetailSkeleton,

    account: AccountSkeleton,

    default: DefaultSkeleton,

};



export const AthletePageSkeleton: React.FC<AthletePageSkeletonProps> = ({

    variant,

    className,

}) => {

    const Content = VARIANTS[variant];



    return (

        <div

            className={cn("px-4 pb-24 pt-4 lg:hidden", className)}

            role="status"

            aria-busy="true"

            aria-label="Cargando"

        >

            <span className="sr-only">Cargando contenido</span>

            <Content />

        </div>

    );

};


