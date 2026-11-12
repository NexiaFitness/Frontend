/**
 * Evita regresión B-24: bucle infinito cuando blocks es [] nuevo en cada render (cliente sin plan).
 */

import React from "react";
import { renderHook } from "@testing-library/react";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { TestProviders } from "@/test-utils/TestProviders";
import { usePeriodBlocksStructurePendingDates } from "../usePeriodBlocksStructurePendingDates";

function wrapper({ children }: { children: React.ReactNode }) {
  return <TestProviders>{children}</TestProviders>;
}

describe("usePeriodBlocksStructurePendingDates", () => {
  it("no entra en bucle con cliente sin plan (blocks = [] nuevo cada render)", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender, result } = renderHook(
      () => {
        const unstableEmptyBlocks: PlanPeriodBlock[] = [];
        return usePeriodBlocksStructurePendingDates({
          planId: undefined,
          blocks: unstableEmptyBlocks,
          enabled: false,
        });
      },
      { wrapper },
    );

    for (let i = 0; i < 50; i++) {
      rerender();
    }

    expect(result.current.size).toBe(0);
    expect(
      consoleError.mock.calls.some((args) =>
        String(args[0]).includes("Maximum update depth exceeded"),
      ),
    ).toBe(false);

    consoleError.mockRestore();
  });
});
