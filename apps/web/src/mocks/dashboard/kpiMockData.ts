export interface KPIData {
    value: number | string;
    trend: string;
    label: string;
    description: string;
}

export const MOCK_CLIENT_IMPROVEMENT: KPIData = {
    value: 78,
    trend: "+15%",
    label: "Avg Client Improvement",
    description: "across all programs",
};

export const MOCK_CLIENT_SATISFACTION: KPIData = {
    value: "4.7/5",
    trend: "+3%",
    label: "Client Satisfaction",
    description: "post-session feedback",
};

export const MOCK_PLAN_ADHERENCE: KPIData = {
    value: 92,
    trend: "+5%",
    label: "Plan Adherence",
    description: "planned vs executed",
};

