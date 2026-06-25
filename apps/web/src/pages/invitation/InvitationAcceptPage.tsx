/**
 * InvitationAcceptPage — ruta pública /invitation?token=...
 */

import React from "react";
import { useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { InvitationAcceptForm } from "@/components/invitation/InvitationAcceptForm";

export const InvitationAcceptPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    return (
        <AuthLayout>
            <InvitationAcceptForm token={token} />
        </AuthLayout>
    );
};

export default InvitationAcceptPage;
