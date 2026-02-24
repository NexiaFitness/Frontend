/**
 * KPICard — Card de KPI para dashboards (tokenizado Nexia Sparkle Flow)
 *
 * @author Frontend Team
 * @updated v5.0.0 - Fase 4: tokens
 */
import React from "react";

interface KPICardProps {
    value: string | number;
    trend: string;
    label: string;
    description: string;
    isLoading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ value, trend, label, description, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-10 bg-muted rounded animate-pulse mb-2" />
                <div className="h-6 bg-muted rounded animate-pulse w-2/3 mb-1" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    {value}
                </h3>
                <span className="text-success text-sm font-semibold">{trend}</span>
            </div>
            <p className="text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1">
                {label}
            </p>
            <p className="text-muted-foreground text-sm lg:text-base">{description}</p>
        </div>
    );
};

