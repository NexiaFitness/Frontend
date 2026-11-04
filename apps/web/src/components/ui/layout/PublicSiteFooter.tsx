/**
 * PublicSiteFooter.tsx — Pie de la web pública con el enlace a Créditos.
 */

import React from "react";
import { Link } from "react-router-dom";
import {
    CREDITS_COPY,
    CREDITS_PATH,
    PUBLIC_SITE_FOOTER,
    PUBLIC_SITE_FOOTER_LINK,
} from "@/pages/creditsPresentation";

export const PublicSiteFooter: React.FC = () => {
    return (
        <footer className={PUBLIC_SITE_FOOTER}>
            <Link className={PUBLIC_SITE_FOOTER_LINK} to={CREDITS_PATH}>
                {CREDITS_COPY.footerLabel}
            </Link>
        </footer>
    );
};
