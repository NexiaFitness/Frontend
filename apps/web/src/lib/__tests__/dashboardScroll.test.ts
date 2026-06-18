/**
 * dashboardScroll.test.ts — Scroll del main del dashboard (portal atleta + trainer).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    DASHBOARD_MAIN_SCROLL_ID,
    dashboardRouteDefersScrollReset,
    scrollDashboardMainToElement,
} from "../dashboardScroll";

function mockRect(top: number, height: number): DOMRect {
    return {
        top,
        bottom: top + height,
        left: 0,
        right: 100,
        width: 100,
        height,
        x: 0,
        y: top,
        toJSON: () => ({}),
    } as DOMRect;
}

describe("dashboardScroll", () => {
    describe("dashboardRouteDefersScrollReset", () => {
        it("aplaza reset cuando hay ?focus=", () => {
            expect(dashboardRouteDefersScrollReset("?focus=pain")).toBe(true);
            expect(dashboardRouteDefersScrollReset("?focus=notes")).toBe(true);
        });

        it("no aplaza reset sin focus", () => {
            expect(dashboardRouteDefersScrollReset("")).toBe(false);
            expect(dashboardRouteDefersScrollReset("?tab=sessions")).toBe(false);
        });
    });

    describe("scrollDashboardMainToElement", () => {
        let main: HTMLDivElement;
        let target: HTMLTextAreaElement;

        beforeEach(() => {
            main = document.createElement("div");
            main.id = DASHBOARD_MAIN_SCROLL_ID;
            main.scrollBy = vi.fn();
            vi.spyOn(main, "getBoundingClientRect").mockReturnValue(mockRect(0, 800));

            target = document.createElement("textarea");
            target.id = "athlete-feedback-pain";
            target.focus = vi.fn();

            document.body.appendChild(main);
            document.body.appendChild(target);
        });

        afterEach(() => {
            document.body.innerHTML = "";
            vi.restoreAllMocks();
        });

        it("align start desplaza el target al borde superior visible", () => {
            vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect(600, 60));

            scrollDashboardMainToElement(target, { align: "start", offsetTop: 8 });

            expect(main.scrollBy).toHaveBeenCalledWith({
                top: 592,
                behavior: "auto",
            });
            expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });
        });

        it("align contain solo desplaza lo mínimo cuando sobresale abajo", () => {
            vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect(600, 70));

            scrollDashboardMainToElement(target, { align: "contain", offsetBottom: 160 });

            expect(main.scrollBy).toHaveBeenCalledWith({
                top: 30,
                behavior: "auto",
            });
        });

        it("align contain no desplaza si el target ya cabe", () => {
            vi.spyOn(target, "getBoundingClientRect").mockReturnValue(mockRect(100, 60));

            scrollDashboardMainToElement(target, { align: "contain", offsetBottom: 160 });

            expect(main.scrollBy).not.toHaveBeenCalled();
            expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });
        });
    });
});
