import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useBillingStats } from "@nexia/shared";

export const ClientBillingChart: React.FC = () => {
    const { data, summary, isLoading } = useBillingStats();

    if (isLoading) {
        return (
            <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
                <div className="h-64 bg-surface-2 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-xl p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-1">
                        Client Billing
                    </h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Current: {summary.current}</span>
                        <span className="text-success font-semibold">{summary.growth}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{summary.revenue}</div>
                    <div className="text-sm text-muted-foreground">{summary.year}</div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

