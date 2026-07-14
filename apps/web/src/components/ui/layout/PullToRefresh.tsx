/**
 * PullToRefresh.tsx — Contenedor PTR móvil (UX-FE-04).
 * Contexto: V01 inicio, V02 sesiones; desktop renderiza children sin gesto.
 * Contratos: DESIGN_MOBILE §6.5, agent.md §5
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";

export interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    className,
    disabled = false,
}) => {
    const isDesktop = useIsAthleteDesktopLayout();
    const { pullDistance, isRefreshing } = usePullToRefresh({
        onRefresh,
        disabled: disabled || isDesktop,
    });

    if (isDesktop) {
        return <div className={className}>{children}</div>;
    }

    const showIndicator = pullDistance > 0 || isRefreshing;
    const progress = Math.min(pullDistance / 72, 1);

    return (
        <div className={cn("relative", className)}>
            <div
                className={cn(
                    "pointer-events-none flex justify-center overflow-hidden transition-[height,opacity] duration-150",
                    showIndicator ? "opacity-100" : "h-0 opacity-0"
                )}
                style={{ height: showIndicator ? Math.max(pullDistance, isRefreshing ? 40 : 0) : 0 }}
                aria-hidden={!showIndicator}
            >
                <Loader2
                    className={cn(
                        "size-5 shrink-0 text-primary",
                        isRefreshing ? "animate-spin" : ""
                    )}
                    style={{
                        marginTop: isRefreshing ? 8 : Math.max(4, pullDistance - 24),
                        transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)`,
                    }}
                />
            </div>
            <div
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
                    transition: pullDistance === 0 ? "transform 0.2s ease-out" : undefined,
                }}
            >
                {children}
            </div>
        </div>
    );
};
