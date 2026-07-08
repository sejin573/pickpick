import {
  AgentActionName,
  AgentTraceEntry,
  PickPickAgentState,
} from "./types";

function createRunId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `agent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createAgentState(goal: string): PickPickAgentState {
  return {
    runId: createRunId(),
    goal,
    trace: [],
  };
}

export async function runAgentAction<T>(
  state: PickPickAgentState,
  action: AgentActionName,
  executor: () => Promise<{ result: T; observation: string }> | {
    result: T;
    observation: string;
  },
): Promise<T> {
  const startedAt = Date.now();

  try {
    const executed = await executor();
    state.trace.push({
      action,
      status: "completed",
      observation: executed.observation,
      elapsedMs: Date.now() - startedAt,
    });
    return executed.result;
  } catch (error) {
    state.trace.push({
      action,
      status: "failed",
      observation: error instanceof Error ? error.message : "unknown error",
      elapsedMs: Date.now() - startedAt,
    });
    throw error;
  }
}

export function skipAgentAction(
  state: PickPickAgentState,
  action: AgentActionName,
  observation: string,
) {
  state.trace.push({
    action,
    status: "skipped",
    observation,
    elapsedMs: 0,
  });
}

export function summarizeAgentTrace(trace: AgentTraceEntry[]): string[] {
  return trace.map((entry) => `${entry.action}: ${entry.observation}`);
}
