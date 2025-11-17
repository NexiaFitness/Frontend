export const useClientImprovement = () => {
    return {
        value: 78,
        trend: "+15%",
        label: "Avg Client Improvement",
        description: "across all programs",
        isLoading: false,
        isError: false,
    };
};

export const useClientSatisfaction = () => {
    return {
        value: "4.7/5",
        trend: "+3%",
        label: "Client Satisfaction",
        description: "post-session feedback",
        isLoading: false,
        isError: false,
    };
};

export const usePlanAdherence = () => {
    return {
        value: 92,
        trend: "+5%",
        label: "Plan Adherence",
        description: "planned vs executed",
        isLoading: false,
        isError: false,
    };
};

