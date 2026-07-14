/**
 * AthleteRunGroupHero.tsx — Hero grupo+ronda (V05 B.2, §5b.1).
 */

import React from "react";
import {
    ATHLETE_RUN_GROUP_HERO,
    ATHLETE_RUN_GROUP_HERO_ENTER,
    ATHLETE_RUN_GROUP_HERO_ROUND,
    ATHLETE_RUN_GROUP_HERO_TITLE,
} from "./athleteRunPresentation";

export interface AthleteRunGroupHeroProps {
    badgeLabel: string;
    roundLabel: string;
}

export const AthleteRunGroupHero: React.FC<AthleteRunGroupHeroProps> = ({
    badgeLabel,
    roundLabel,
}) => {
    return (
        <div className={`${ATHLETE_RUN_GROUP_HERO} ${ATHLETE_RUN_GROUP_HERO_ENTER}`}>
            <p className={ATHLETE_RUN_GROUP_HERO_TITLE}>{badgeLabel}</p>
            <h1 className={ATHLETE_RUN_GROUP_HERO_ROUND}>{roundLabel}</h1>
        </div>
    );
};
