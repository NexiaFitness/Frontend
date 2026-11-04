/**
 * Account.tsx — Mi cuenta: atleta V13, admin premium (experimento), trainer legacy.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ScrollText } from "lucide-react";
import { PageTitle } from "@/components/dashboard/shared";
import { ProfileForm } from "@/components/account/ProfileForm";
import { AthleteSettingsRow } from "@/components/athlete/account/AthleteSettingsRow";
import { AthleteSettingsSection } from "@/components/athlete/account/AthleteSettingsSection";
import { AthleteAccountPage } from "@/pages/dashboard/athlete/AthleteAccountPage";
import { PlatformPremiumAccountPage } from "@/pages/account/PlatformPremiumAccountPage";
import { CREDITS_COPY, CREDITS_PATH } from "@/pages/creditsPresentation";
import { USER_ROLES } from "@nexia/shared/utils/roles";
import { selectUser } from "@nexia/shared";

export const Account: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector(selectUser);

    if (user?.role === USER_ROLES.ATHLETE) {
        return <AthleteAccountPage />;
    }

    if (user?.role === USER_ROLES.ADMIN) {
        return <PlatformPremiumAccountPage />;
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
                <AthleteSettingsSection title="Información">
                    <AthleteSettingsRow
                        icon={ScrollText}
                        label={CREDITS_COPY.settingsLabel}
                        hint={CREDITS_COPY.settingsHint}
                        onClick={() => navigate(CREDITS_PATH)}
                        isLast
                    />
                </AthleteSettingsSection>
            </div>
        </>
    );
};

export default Account;
