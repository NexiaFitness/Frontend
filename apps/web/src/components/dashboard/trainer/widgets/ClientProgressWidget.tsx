import React from "react";
import { useClientProgressCategories } from "@nexia/shared";

export const ClientProgressWidget: React.FC = () => {
    const { onTrack, behindSchedule, needAttention, overall, trend, isLoading } = useClientProgressCategories();

    if (isLoading) {
        return (
            <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-48 bg-muted rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                        Overall Client Progress
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">{overall}%</span>
                        <span className="text-success text-sm font-semibold">{trend}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-success">{onTrack}</div>
                    <div className="text-sm text-muted-foreground">On Track</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{behindSchedule}</div>
                    <div className="text-sm text-muted-foreground">Behind Schedule</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">{needAttention}</div>
                    <div className="text-sm text-muted-foreground">Need Attention</div>
                </div>
            </div>
        </div>
    );
};

