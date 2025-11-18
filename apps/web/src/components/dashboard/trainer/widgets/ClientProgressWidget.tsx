import React from "react";
import { useClientProgressCategories } from "@nexia/shared";

export const ClientProgressWidget: React.FC = () => {
    const { onTrack, behindSchedule, needAttention, overall, trend, isLoading } = useClientProgressCategories();

    if (isLoading) {
        return (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-48 bg-slate-200 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                        Overall Client Progress
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-800">{overall}%</span>
                        <span className="text-green-600 text-sm font-semibold">{trend}</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{onTrack}</div>
                    <div className="text-sm text-slate-600">On Track</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{behindSchedule}</div>
                    <div className="text-sm text-slate-600">Behind Schedule</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{needAttention}</div>
                    <div className="text-sm text-slate-600">Need Attention</div>
                </div>
            </div>
        </div>
    );
};

