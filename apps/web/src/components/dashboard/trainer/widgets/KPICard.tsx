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
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-10 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="h-6 bg-slate-200 rounded animate-pulse w-2/3 mb-1" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2" />
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800">
                    {value}
                </h3>
                <span className="text-green-600 text-sm font-semibold">{trend}</span>
            </div>
            <p className="text-base md:text-lg lg:text-xl font-semibold text-slate-700 mb-1">
                {label}
            </p>
            <p className="text-slate-600 text-sm lg:text-base">{description}</p>
        </div>
    );
};

