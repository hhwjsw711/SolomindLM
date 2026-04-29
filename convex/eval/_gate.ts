/**
 * Shared gate for eval-only Convex actions.
 *
 * Eval actions bypass user auth (identity is derived from notebook owner),
 * so they MUST be gated by:
 *   - RAG_EVALS_ENABLED=true on the deployment
 *   - RAG_EVAL_SECRET (≥16 chars) matching the caller-supplied secret
 *
 * Used by chatEvalAction and studioEvalAction.
 */

export function assertRagEvalGate(evalSecret: string): void {
  if (process.env.RAG_EVALS_ENABLED !== "true") {
    throw new Error(
      "RAG evals are disabled (set RAG_EVALS_ENABLED=true on this deployment to enable)."
    );
  }
  const expected = process.env.RAG_EVAL_SECRET ?? "";
  if (!expected || expected.length < 16) {
    throw new Error(
      "RAG_EVAL_SECRET must be set to a strong value (min 16 chars) on this deployment."
    );
  }
  if (evalSecret.length !== expected.length) {
    throw new Error("Invalid eval credentials.");
  }
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= evalSecret.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    throw new Error("Invalid eval credentials.");
  }
}
