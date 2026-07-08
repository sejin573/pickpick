import { analyzeMessage } from "@/lib/agent";

import { IntentChainResult } from "./types";

export function runIntentChain(message: string): IntentChainResult {
  return {
    analysis: analyzeMessage(message),
  };
}
