/**
 * SessionBlockDetail.tsx — Orquestador: dado un SessionBlockView, despacha al
 * componente de grupo adecuado por kind.
 *
 * @author Frontend Team
 * @since v6.5.0
 */

import React from "react";
import type { SessionBlockView, SessionExerciseGroupView } from "@nexia/shared";
import { SingleSetGroup } from "./groups/SingleSetGroup";
import { ParallelGroup } from "./groups/ParallelGroup";
import { DropsetGroup } from "./groups/DropsetGroup";
import { AmrapGroup } from "./groups/AmrapGroup";
import { EmomGroup } from "./groups/EmomGroup";
import { ForTimeGroup } from "./groups/ForTimeGroup";

export interface SessionBlockDetailProps {
    block: SessionBlockView;
}

function renderGroup(blockTitle: string, group: SessionExerciseGroupView): React.ReactNode {
    switch (group.kind) {
        case "single_set":
            return <SingleSetGroup blockTitle={blockTitle} group={group} />;
        case "superset":
        case "giant_set":
            return <ParallelGroup blockTitle={blockTitle} group={group} />;
        case "dropset":
            return <DropsetGroup blockTitle={blockTitle} group={group} />;
        case "amrap":
            return <AmrapGroup blockTitle={blockTitle} group={group} />;
        case "emom":
            return <EmomGroup blockTitle={blockTitle} group={group} />;
        case "for_time":
            return <ForTimeGroup blockTitle={blockTitle} group={group} />;
        default:
            return null;
    }
}

export const SessionBlockDetail: React.FC<SessionBlockDetailProps> = ({ block }) => {
    if (block.groups.length === 0) return null;
    return (
        <div className="space-y-3">
            {block.groups.map((group) => (
                <div key={group.groupId}>{renderGroup(block.blockTypeName, group)}</div>
            ))}
        </div>
    );
};
