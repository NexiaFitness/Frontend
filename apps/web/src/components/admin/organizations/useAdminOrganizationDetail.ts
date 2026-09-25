/**
 * useAdminOrganizationDetail.ts — Ficha G1 (solo lectura).
 */

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAdminOrganizationQuery } from "@nexia/shared/api/adminOrganizationsApi";

export function useAdminOrganizationDetail() {
    const navigate = useNavigate();
    const { orgId: orgIdParam } = useParams<{ orgId: string }>();
    const orgId = Number(orgIdParam);
    const skip = !Number.isFinite(orgId) || orgId <= 0;

    const { data, isLoading, isError, refetch } = useGetAdminOrganizationQuery(orgId, {
        skip,
    });

    return useMemo(
        () => ({
            orgId,
            skip,
            org: data,
            isLoading,
            isError,
            refetch: () => {
                void refetch();
            },
            backToList: () => navigate("/dashboard/admin/organizations"),
            openUser: (userId: number) => navigate(`/dashboard/admin/users/${userId}`),
        }),
        [orgId, skip, data, isLoading, isError, refetch, navigate]
    );
}
