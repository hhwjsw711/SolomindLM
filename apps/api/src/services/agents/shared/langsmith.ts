import { LangChainTracer } from '@langchain/core/tracers/tracer_langchain';
import { Client } from 'langsmith';
import { env } from '../../../config/env.js';

export interface LangSmithRunConfig {
  runName?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

let tracerInstance: LangChainTracer | null = null;

function isTracingEnabled(): boolean {
  return env.LANGSMITH_TRACING === 'true' || env.LANGCHAIN_TRACING_V2 === 'true';
}

function getLangSmithApiKey(): string | undefined {
  return env.LANGSMITH_API_KEY || env.LANGCHAIN_API_KEY;
}

function getTracer(): LangChainTracer | null {
  if (!isTracingEnabled()) return null;

  const apiKey = getLangSmithApiKey();
  if (!apiKey) return null;

  if (!tracerInstance) {
    const client = new Client({
      apiKey,
      apiUrl: env.LANGSMITH_ENDPOINT,
    });

    tracerInstance = new LangChainTracer({
      client,
      projectName: env.LANGCHAIN_PROJECT || env.LANGSMITH_PROJECT,
    });
  }

  return tracerInstance;
}

export function createLangSmithRunConfig(config: LangSmithRunConfig = {}) {
  const tracer = getTracer();

  if (!tracer) {
    return {};
  }

  return {
    callbacks: [tracer],
    tags: config.tags,
    metadata: config.metadata,
    runName: config.runName,
  };
}
