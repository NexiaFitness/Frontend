/**
 * KPICard — Card de KPI para dashboards (StatCard design según DASHBOARD_LAYOUT_SPEC)
 *
 * Diseño spec: rounded-lg bg-surface p-5, title text-sm, value text-3xl font-bold,
 * subtitle text-xs, icono en rounded-lg bg-surface-2 p-2.5, hover -translate-y-0.5 + glow.
 *
 * @author Frontend Team
 * @updated v5.x - DASHBOARD_LAYOUT_SPEC: layout profesional de raíz
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type KPICardColor = "primary" | "success" | "warning" | "destructive" | "info";

interface KPICardProps {
    value: string | number;
    trend: string;
    label: string;
    description: string;
    icon: LucideIcon;
    color?: KPICardColor;
    isLoading?: boolean;
    className?: string;
}

const colorMap: Record<KPICardColor, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    info: "text-info",
};

const glowMap: Record<KPICardColor, string> = {
    primary: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)]",
    success: "hover:shadow-[0_0_20px_hsl(var(--success)/0.15)]",
    warning: "hover:shadow-[0_0_20px_hsl(var(--warning)/0.15)]",
    destructive: "hover:shadow-[0_0_20px_hsl(var(--destructive)/0.15)]",
    info: "hover:shadow-[0_0_20px_hsl(var(--info)/0.15)]",
};

export const KPICard: React.FC<KPICardProps> = ({
    value,
    trend,
    label,
    description,
    icon: Icon,
    color = "primary",
    isLoading,
    className,
}) => {
    if (isLoading) {
        return (
            <div
                className={cn(
                    "rounded-lg bg-surface p-5 transition-all duration-150 ease-out",
                    className
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="h-4 bg-surface-2 rounded animate-pulse w-24 mb-2" />
                        <div className="h-8 bg-surface-2 rounded animate-pulse w-16 mb-1" />
                        <div className="h-3 bg-surface-2 rounded animate-pulse w-32" />
                    </div>
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-surface-2 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-lg bg-surface p-5 transition-all duration-150 ease-out",
                "hover:-translate-y-0.5",
                glowMap[color],
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                    {trend && (
                        <span className="mt-1 inline-block text-xs font-semibold text-success">{trend}</span>
                    )}
                </div>
                <div className={cn("shrink-0 rounded-lg bg-surface-2 p-2.5", colorMap[color])}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
};
