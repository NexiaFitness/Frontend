export interface ClientProgressData {
    onTrack: number;
    behindSchedule: number;
    needAttention: number;
    overall: number;
    trend: string;
}

export const MOCK_CLIENT_PROGRESS: ClientProgressData = {
    onTrack: 32,
    behindSchedule: 7,
    needAttention: 9,
    overall: 82,
    trend: "+7%",
};

