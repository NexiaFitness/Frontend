/**
 * adminDashboardApi.ts — RTK Query /admin/dashboard/summary (D1).
 */

import { baseApi } from "./baseApi";
import type { AdminDashboardSummaryOut } from "../types/adminDashboard";

export const adminDashboardApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAdminDashboardSummary: builder.query<AdminDashboardSummaryOut, void>({
            query: () => `/admin/dashboard/summary`,
            providesTags: [{ type: "AdminDashboard", id: "SUMMARY" }],
        }),
    }),
    overrideExisting: false,
});

export const { useGetAdminDashboardSummaryQuery } = adminDashboardApi;
