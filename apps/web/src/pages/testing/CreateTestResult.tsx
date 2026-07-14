/**
 * Legacy redirect — /testing/create-test → register-evaluation (Spec 01 F1).
 */

import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";

export const CreateTestResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.toString();
    const target = query
        ? `/dashboard/testing/register-evaluation?${query}`
        : "/dashboard/testing/register-evaluation";
    return <Navigate to={target} replace />;
};
