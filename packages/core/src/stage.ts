/**
 * Recruitment stages and the legal transitions between them.
 * Pure domain logic: no I/O, no framework.
 */
export const STAGES = [
  "saved",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "ghosted",
] as const;

export type Stage = (typeof STAGES)[number];

const TRANSITIONS: Readonly<Record<Stage, readonly Stage[]>> = {
  saved: ["applied"],
  applied: ["screening", "interview", "rejected", "ghosted"],
  screening: ["interview", "rejected", "ghosted"],
  interview: ["offer", "rejected", "ghosted"],
  offer: ["rejected"],
  rejected: [],
  // A recruiter can come back after silence, so ghosted is not a dead end.
  ghosted: ["screening", "interview", "offer", "rejected"],
};

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && (STAGES as readonly string[]).includes(value);
}

export function nextStages(from: Stage): readonly Stage[] {
  return TRANSITIONS[from];
}

export function canTransition(from: Stage, to: Stage): boolean {
  return TRANSITIONS[from].includes(to);
}

export class IllegalTransitionError extends Error {
  constructor(
    readonly from: Stage,
    readonly to: Stage,
  ) {
    super(`Illegal stage transition: ${from} -> ${to}`);
    this.name = "IllegalTransitionError";
  }
}

export function assertTransition(from: Stage, to: Stage): void {
  if (!canTransition(from, to)) {
    throw new IllegalTransitionError(from, to);
  }
}

export function isTerminal(stage: Stage): boolean {
  return TRANSITIONS[stage].length === 0;
}
