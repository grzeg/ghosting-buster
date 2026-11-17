import { describe, expect, it } from "vitest";
import {
  assertTransition,
  canTransition,
  IllegalTransitionError,
  isStage,
  isTerminal,
  nextStages,
  STAGES,
} from "./stage";

describe("stage machine", () => {
  it("allows the happy path saved -> applied -> screening -> interview -> offer", () => {
    expect(canTransition("saved", "applied")).toBe(true);
    expect(canTransition("applied", "screening")).toBe(true);
    expect(canTransition("screening", "interview")).toBe(true);
    expect(canTransition("interview", "offer")).toBe(true);
  });

  it("does not allow applying skipped or going backwards", () => {
    expect(canTransition("saved", "interview")).toBe(false);
    expect(canTransition("interview", "applied")).toBe(false);
  });

  it("lets a ghosted application come back to life", () => {
    expect(canTransition("ghosted", "screening")).toBe(true);
    expect(canTransition("ghosted", "interview")).toBe(true);
  });

  it("treats rejected as terminal", () => {
    expect(isTerminal("rejected")).toBe(true);
    expect(nextStages("rejected")).toEqual([]);
    expect(isTerminal("ghosted")).toBe(false);
  });

  it("never allows a stage to transition to itself", () => {
    for (const stage of STAGES) {
      expect(canTransition(stage, stage)).toBe(false);
    }
  });

  it("assertTransition throws IllegalTransitionError with from and to", () => {
    expect(() => {
      assertTransition("saved", "offer");
    }).toThrow(IllegalTransitionError);
    expect(() => {
      assertTransition("applied", "ghosted");
    }).not.toThrow();
  });

  it("isStage narrows unknown values", () => {
    expect(isStage("applied")).toBe(true);
    expect(isStage("hired")).toBe(false);
    expect(isStage(42)).toBe(false);
  });
});
