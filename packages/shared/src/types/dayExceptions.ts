/**
 * Day Exception types — client-level rest/exception days.
 */

export interface DayException {
    id: number;
    client_id: number;
    date: string;
    is_trainable: boolean;
    note: string | null;
}

export interface DayExceptionCreate {
    client_id: number;
    date: string;
    is_trainable?: boolean;
    note?: string | null;
}
