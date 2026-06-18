/**
 * Account.tsx — Mi cuenta: plataforma (trainer/admin) o atleta mobile premium.
 */

import React from "react";
import { useSelector } from "react-redux";
import { PageTitle } from "@/components/dashboard/shared";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AthleteAccountPage } from "@/pages/dashboard/athlete/AthleteAccountPage";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { selectUser } from "@nexia/shared";

export const Account: React.FC = () => {
    const user = useSelector(selectUser);

    if (user?.role === USER_ROLES.ATHLETE) {
        return <AthleteAccountPage />;
    }

    return (
        <>
            <PageTitle
                title="Mi Cuenta"
                subtitle="Gestiona tu información personal y configuración de seguridad"
                className="mb-6"
            />

            <div className="space-y-6 px-4 pb-12 lg:px-8 lg:pb-20">
                <ProfileForm />
            </div>
        </>
    );
};

export default Account;
