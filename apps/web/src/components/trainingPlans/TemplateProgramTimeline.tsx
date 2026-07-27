/**
 * TemplateProgramTimeline — Vista semana → sesión (tokens canónicos atleta).
 */

import React from "react";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import type { TemplateProgramSessionListItem } from "@nexia/shared/types/templateProgram";
import { Button } from "@/components/ui/buttons";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    TEMPLATE_EDITOR_COPY,
    TEMPLATE_EDITOR_EMPTY,
    TEMPLATE_EDITOR_EMPTY_ACTION,
    TEMPLATE_EDITOR_EMPTY_BODY,
    TEMPLATE_EDITOR_EMPTY_CTA,
    TEMPLATE_EDITOR_EMPTY_GLOW,
    TEMPLATE_EDITOR_EMPTY_TITLE,
    TEMPLATE_EDITOR_SECTION,
    TEMPLATE_EDITOR_SECTION_EYEBROW,
    TEMPLATE_EDITOR_SECTION_HEAD,
    TEMPLATE_EDITOR_SECTION_HINT,
    TEMPLATE_EDITOR_SESSION_CHEVRON,
    TEMPLATE_EDITOR_SESSION_DELETE,
    TEMPLATE_EDITOR_SESSION_LIST_ITEM,
    TEMPLATE_EDITOR_SESSION_MAIN,
    TEMPLATE_EDITOR_SESSION_META,
    TEMPLATE_EDITOR_SESSION_ROW,
    TEMPLATE_EDITOR_SESSION_TITLE,
    TEMPLATE_EDITOR_TIMELINE_STACK,
    TEMPLATE_EDITOR_WEEK_GROUP,
    TEMPLATE_EDITOR_WEEK_HEADER,
    TEMPLATE_EDITOR_WEEK_LIST,
    displayTemplateSessionSubtitle,
    displayTemplateSessionTitle,
    groupTemplateSessionsByWeek,
} from "./templateEditorPresentation";

export interface TemplateProgramTimelineProps {
    sessions: TemplateProgramSessionListItem[];
    isArchived: boolean;
    onEditSession: (sessionId: number) => void;
    onDeleteSession: (sessionId: number) => void;
    onAddSession: () => void;
}

export const TemplateProgramTimeline: React.FC<TemplateProgramTimelineProps> = ({
    sessions,
    isArchived,
    onEditSession,
    onDeleteSession,
    onAddSession,
}) => {
    const weekGroups = groupTemplateSessionsByWeek(sessions);

    if (weekGroups.length === 0) {
        return (
            <div className={TEMPLATE_EDITOR_EMPTY}>
                <NexiaGlassAccentRim />
                <div className={TEMPLATE_EDITOR_EMPTY_GLOW} aria-hidden />
                <p className={TEMPLATE_EDITOR_EMPTY_TITLE}>
                    {TEMPLATE_EDITOR_COPY.emptyProgramTitle}
                </p>
                <p className={TEMPLATE_EDITOR_EMPTY_BODY}>
                    {TEMPLATE_EDITOR_COPY.emptyProgramBody}
                </p>
                {!isArchived ? (
                    <div className={TEMPLATE_EDITOR_EMPTY_ACTION}>
                        <Button
                            variant="primary"
                            size="sm"
                            className={TEMPLATE_EDITOR_EMPTY_CTA}
                            onClick={onAddSession}
                        >
                            <Plus className="mr-2 h-4 w-4" aria-hidden />
                            {TEMPLATE_EDITOR_COPY.emptyProgramCta}
                        </Button>
                    </div>
                ) : null}
            </div>
        );
    }

    return (
        <section className={TEMPLATE_EDITOR_SECTION} aria-label={TEMPLATE_EDITOR_COPY.timelineTitle}>
            <div className={TEMPLATE_EDITOR_SECTION_HEAD}>
                <div>
                    <p className={TEMPLATE_EDITOR_SECTION_EYEBROW}>
                        {TEMPLATE_EDITOR_COPY.timelineTitle}
                    </p>
                    <p className={TEMPLATE_EDITOR_SECTION_HINT}>
                        {TEMPLATE_EDITOR_COPY.timelineHint}
                    </p>
                </div>
                {!isArchived ? (
                    <Button variant="outline-primary" size="sm" onClick={onAddSession}>
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                        {TEMPLATE_EDITOR_COPY.addSession}
                    </Button>
                ) : null}
            </div>

            <div className={TEMPLATE_EDITOR_TIMELINE_STACK}>
                {weekGroups.map(({ week, sessions: weekSessions }) => (
                    <div key={week} className={TEMPLATE_EDITOR_WEEK_GROUP}>
                        <h3 className={TEMPLATE_EDITOR_WEEK_HEADER}>
                            {TEMPLATE_EDITOR_COPY.weekLabel(week)}
                        </h3>
                        <ul className={TEMPLATE_EDITOR_WEEK_LIST}>
                            {weekSessions.map((session) => {
                                const title = displayTemplateSessionTitle(session);
                                const subtitle = displayTemplateSessionSubtitle(session);
                                return (
                                    <li key={session.id} className={TEMPLATE_EDITOR_SESSION_LIST_ITEM}>
                                        <button
                                            type="button"
                                            className={TEMPLATE_EDITOR_SESSION_ROW}
                                            onClick={() => onEditSession(session.id)}
                                            aria-label={TEMPLATE_EDITOR_COPY.sessionEditAria(title)}
                                        >
                                            <div className={TEMPLATE_EDITOR_SESSION_MAIN}>
                                                <p className={TEMPLATE_EDITOR_SESSION_TITLE}>
                                                    {title}
                                                </p>
                                                <p className={TEMPLATE_EDITOR_SESSION_META}>
                                                    {subtitle}
                                                </p>
                                            </div>
                                            <ChevronRight
                                                className={TEMPLATE_EDITOR_SESSION_CHEVRON}
                                                aria-hidden
                                            />
                                        </button>
                                        {!isArchived ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={TEMPLATE_EDITOR_SESSION_DELETE}
                                                onClick={() => onDeleteSession(session.id)}
                                                aria-label={TEMPLATE_EDITOR_COPY.sessionDeleteAria(
                                                    title,
                                                )}
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden />
                                            </Button>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};
