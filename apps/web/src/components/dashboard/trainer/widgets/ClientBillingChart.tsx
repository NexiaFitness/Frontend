import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBillingStats } from "@nexia/shared";

export const ClientBillingChart: React.FC = () => {
    const { data, summary, isLoading } = useBillingStats();

    if (isLoading) {
        return (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                <div className="h-64 bg-slate-200 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                        Client Billing
                    </h3>
                    <div className="flex gap-4 text-sm text-slate-600">
                        <span>Current: {summary.current}</span>
                        <span className="text-green-600 font-semibold">{summary.growth}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{summary.revenue}</div>
                    <div className="text-sm text-slate-600">{summary.year}</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#4A67B3" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

