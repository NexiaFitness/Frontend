/**
 * CreditsPage.tsx — Créditos públicos de RepDB.
 *
 * Ruta /creditos, sin restricción de rol: visitante, atleta, entrenador y admin.
 */

import React from "react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    CREDITS_BODY,
    CREDITS_CARD,
    CREDITS_COPY,
    CREDITS_LINK,
    CREDITS_META,
    CREDITS_PAGE,
    CREDITS_TITLE,
    CREDITS_URL,
} from "@/pages/creditsPresentation";

const CreditsPage: React.FC = () => {
    return (
        <div className={CREDITS_PAGE}>
            <article className={CREDITS_CARD}>
                <NexiaGlassAccentRim />
                <h1 className={CREDITS_TITLE}>{CREDITS_COPY.title}</h1>
                <p className={CREDITS_META}>{CREDITS_COPY.meta}</p>
                <p className={CREDITS_BODY}>{CREDITS_COPY.sentence}</p>
                <a
                    className={CREDITS_LINK}
                    href={CREDITS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {CREDITS_COPY.linkLabel}
                </a>
            </article>
        </div>
    );
};

export default CreditsPage;
