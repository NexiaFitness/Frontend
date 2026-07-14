/**
 * trainerActivityIcons.tsx — Iconos del feed de actividad entrenador (F2-FE-02).
 */

import React from "react";
import {
    Calendar,
    ClipboardList,
    Clock,
    HeartPulse,
    MessageSquare,
    Reply,
    Trophy,
    UserPlus,
} from "lucide-react";

export function getTrainerActivityIcon(type: string): React.ReactNode {
    const className = "size-4 shrink-0";
    switch (type) {
        case "session_completed":
            return <Clock className={className} aria-hidden />;
        case "wellbeing_checkin":
            return <HeartPulse className={className} aria-hidden />;
        case "feedback_submitted":
            return <MessageSquare className={className} aria-hidden />;
        case "trainer_response":
            return <Reply className={className} aria-hidden />;
        case "client_added":
            return <UserPlus className={className} aria-hidden />;
        case "session_scheduled":
            return <Calendar className={className} aria-hidden />;
        case "test_completed":
            return <ClipboardList className={className} aria-hidden />;
        case "goal_achieved":
            return <Trophy className={className} aria-hidden />;
        default:
            return <Clock className={className} aria-hidden />;
    }
}
