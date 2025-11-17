export interface BillingDataPoint {
    month: string;
    revenue: number;
    clients: number;
}

export const MOCK_BILLING_DATA: BillingDataPoint[] = [
    { month: "Jan", revenue: 4200, clients: 40 },
    { month: "Feb", revenue: 4500, clients: 42 },
    { month: "Mar", revenue: 4800, clients: 44 },
    { month: "Apr", revenue: 5000, clients: 46 },
    { month: "May", revenue: 5100, clients: 47 },
    { month: "Jun", revenue: 5200, clients: 48 },
    { month: "Jul", revenue: 5280, clients: 48 },
    { month: "Aug", revenue: 5280, clients: 48 },
    { month: "Sep", revenue: 5280, clients: 48 },
    { month: "Oct", revenue: 5280, clients: 48 },
    { month: "Nov", revenue: 5280, clients: 48 },
    { month: "Dec", revenue: 5280, clients: 48 },
];

