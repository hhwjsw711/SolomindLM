/**
 * Cache utilities that require Node.js crypto
 * This file should only be imported from "use node" files
 */
"use node";
import crypto from "crypto";

/**
 * Generate a hash using SHA-256 for better distribution
 */
export function hashInput(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 16);
}

/**
 * Generate a cache key for agent invocations
 * Format: {agentType}:{version}:{hash}
 */
export function generateAgentCacheKey(
  agentType: string,
  version: string,
  params: Record<string, unknown>
): string {
  const paramsStr = JSON.stringify(params, Object.keys(params).sort());
  const hash = hashInput(paramsStr);
  return `${agentType}:${version}:${hash}`;
}

/**
 * Generate cache key for embeddings
 */
export function generateEmbeddingCacheKey(text: string): string {
  const hash = hashInput(text);
  return `embedding:${hash}`;
}
