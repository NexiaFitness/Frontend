/**
 * WellbeingCheckInForm.tsx — Selección energía pre-sesión (presentacional).
 */

import React from "react";
import { Activity, BatteryLow, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WellbeingLevel } from "@/hooks/athlete/useWellbeingCheckIn";
import {
    WELLBEING_OPTION_BASE,
    WELLBEING_OPTION_HINT,
    WELLBEING_OPTION_ICON,
    WELLBEING_OPTION_ICON_WRAP,
    WELLBEING_OPTION_IDLE,
    WELLBEING_OPTION_LABEL,
    WELLBEING_OPTION_LIST,
    WELLBEING_OPTION_SELECTED,
    type WellbeingOptionTone,
} from "./athleteWellbeingPresentation";

const OPTIONS: {
    level: WellbeingLevel;
    label: string;
    hint: string;
    tone: WellbeingOptionTone;
    Icon: typeof BatteryLow;
}[] = [
    {
        level: 1,
        label: "Bajo",
        hint: "Llego cansado o con poca energía",
        tone: "warning",
        Icon: BatteryLow,
    },
    {
        level: 2,
        label: "Normal",
        hint: "Me siento bien para entrenar",
        tone: "primary",
        Icon: Activity,
    },
    {
        level: 3,
        label: "Alto",
        hint: "Con buena energía hoy",
        tone: "primary",
        Icon: Zap,
    },
];

export interface WellbeingCheckInFormProps {
    selected: WellbeingLevel | null;
    onSelect: (level: WellbeingLevel) => void;
    disabled?: boolean;
}

export const WellbeingCheckInForm: React.FC<WellbeingCheckInFormProps> = ({
    selected,
    onSelect,
    disabled = false,
}) => {
    return (
        <div className={WELLBEING_OPTION_LIST} role="radiogroup" aria-label="Nivel de energía hoy">
            {OPTIONS.map(({ level, label, hint, tone, Icon }) => {
                const isSelected = selected === level;

                return (
                    <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        disabled={disabled}
                        onClick={() => onSelect(level)}
                        className={cn(
                            WELLBEING_OPTION_BASE,
                            isSelected
                                ? WELLBEING_OPTION_SELECTED[tone]
                                : WELLBEING_OPTION_IDLE
                        )}
                    >
                        <span className={WELLBEING_OPTION_ICON_WRAP[tone]} aria-hidden>
                            <Icon className={WELLBEING_OPTION_ICON[tone]} strokeWidth={2} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className={WELLBEING_OPTION_LABEL}>{label}</span>
                            <span className={WELLBEING_OPTION_HINT}>{hint}</span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
