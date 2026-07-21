/**
 * clientInboxPresentation.ts — Tokens UI inbox entrenador (F1).
 */

import { cn } from "@/lib/utils";
import {
    CLIENT_HEADER_INBOX_BELL,
    CLIENT_HEADER_INBOX_BELL_ICON,
} from "./clientHeaderPresentation";

export const CLIENT_INBOX_BELL_BUTTON = CLIENT_HEADER_INBOX_BELL;

export const CLIENT_INBOX_BELL_ICON = CLIENT_HEADER_INBOX_BELL_ICON;

export const CLIENT_INBOX_BELL_BADGE = cn(
    "pointer-events-none absolute -right-1 -top-1 z-[1]",
    "flex h-[18px] min-w-[18px] items-center justify-center rounded-full",
    "bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground",
    "shadow-[0_0_8px] shadow-primary/60 ring-2 ring-card",
);

export const CLIENT_INBOX_PANEL_HEADER = "flex items-start justify-between gap-3 border-b border-border px-5 py-4";

export const CLIENT_INBOX_TAB_BUTTON = cn(
    "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const CLIENT_INBOX_TAB_ACTIVE = "bg-primary text-primary-foreground";

export const CLIENT_INBOX_TAB_INACTIVE = "text-muted-foreground hover:bg-surface-2 hover:text-foreground";

export const CLIENT_INBOX_ITEM_CARD = cn(
    "w-full rounded-lg border border-border border-l-4 bg-card p-4 text-left",
    "transition-colors hover:bg-surface-2/60",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
);

export const CLIENT_INBOX_ITEM_TITLE = "font-medium text-foreground";

export const CLIENT_INBOX_ITEM_BODY = "mt-1 text-sm text-muted-foreground line-clamp-2";

export const CLIENT_INBOX_ITEM_META = "mt-2 text-caption text-muted-foreground";
