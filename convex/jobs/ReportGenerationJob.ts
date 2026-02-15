"use node";
/**
 * ReportGenerationJob - Multi-Phase Architecture
 *
 * Breaks report generation into separate scheduled actions to avoid
 * Cloudflare 524 timeouts. Each phase runs in its own action with
 * its own timeout window.
 *
 * Phases:
 * 1. reportGeneration (entry) - Load docs, pack chunks, schedule map tasks
 * 2. processReportMapChunk - Process one chunk (parallel, own timeout)
 * 3. finalizeReportPhase - Collapse + Reduce + Save (after all maps done)
 */

import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';
import { packChunks, validateChunks } from '../lib/agents/ReportGraph';
import { env } from '../lib/helpers/env';
import {
  createJobLogger,
  createErrorMetadata,
} from '../lib/agents/shared/logging';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { MAP_SYSTEM_PROMPT, MAP_PROMPTS, REDUCE_SYSTEM_PROMPT, REDUCE_PROMPTS } from '../lib/agents/report/prompts';
import { MapOutputSchema, type MapOutput } from '../lib/agents/report/nodes';
import { z } from 'zod';

// Interface for the structured LLM to avoid deep type instantiation
interface MapOutputInvoker {
  invoke(messages: Array<SystemMessage | HumanMessage>): Promise<MapOutput>;
}

// Helper function to create a structured LLM without triggering deep type instantiation
function createStructuredLLM(llm: ChatTogetherAI, schema: z.ZodTypeAny): MapOutputInvoker {
  // @ts-ignore - Type instantiation is excessively deep with LangChain's withStructuredOutput
  return llm.withStructuredOutput(schema, {
    name: 'extract_topics_and_summary',
  });
}

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  MAP_CHUNK_SIZE_TOKENS: parseInt(env.REPORT_MAP_CHUNK_TOKENS || '5000', 10),
  PER_CHUNK_TIMEOUT_MS: 90000, // 90 seconds per chunk (under 100s Cloudflare limit)
  REDUCE_TIMEOUT_MS: 90000, // 90 seconds for reduce
  MAX_OUTPUT_TOKENS: parseInt(env.REPORT_REDUCE_MAX_OUTPUT_TOKENS || '32000', 10),
  MIN_SUMMARY_LENGTH: 50,
} as const;

// ============================================================
// HELPER: Create structured LLM for map phase
// ============================================================

function createMapLLM(): ChatTogetherAI {
  return new ChatTogetherAI({
    apiKey: env.TOGETHER_AI_API_KEY,
    model: env.FAST_LLM,
    temperature: 0.3,
    timeout: CONFIG.PER_CHUNK_TIMEOUT_MS,
    maxTokens: parseInt(env.REPORT_MAP_MAX_OUTPUT_TOKENS || '8192', 10),
  });
}

function createReduceLLM(): ChatTogetherAI {
  return new ChatTogetherAI({
    apiKey: env.TOGETHER_AI_API_KEY,
    model: env.SMART_LLM,
    temperature: 0.5,
    timeout: CONFIG.REDUCE_TIMEOUT_MS,
    maxTokens: CONFIG.MAX_OUTPUT_TOKENS,
  });
}

// ============================================================
// PHASE 1: Initialize & Schedule Map Tasks
// ============================================================

export const reportGeneration = internalAction({
  args: {
    reportId: v.id('reports'),
    userId: v.string(),
    notebookId: v.id('notebooks'),
    documentIds: v.array(v.id('documents')),
    reportType: v.optional(v.string()),
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";

    const { reportId, userId, notebookId, documentIds, reportType, customPrompt } = args;

    // Initialize structured logger
    const logger = createJobLogger({
      jobType: 'report',
      jobId: reportId,
      notebookId,
      userId,
    });

    logger.jobStart({
      reportType: reportType || 'summary',
      docCount: documentIds.length,
    });

    try {
      // Phase: Initializing
      logger.phaseStart('initializing', { progress: 5 });
      await ctx.runMutation(internal.jobs.helpers.updateReportStatus, {
        reportId,
        status: 'generating',
        metadata: {
          phase: 'initializing',
          progress: 5,
          currentStep: 'Initializing...',
        },
      });
      logger.phaseComplete('initializing');

      // Phase: Loading documents
      logger.phaseStart('loading_documents', { progress: 15, docCount: documentIds.length });
      await ctx.runMutation(internal.jobs.helpers.updateReportStatus, {
        reportId,
        status: 'generating',
        metadata: {
          phase: 'loading_documents',
          progress: 15,
          currentStep: 'Loading documents...',
        },
      });

      // Get document chunks
      const chunkObjects = await ctx.runAction(internal.documents.fetchChunks, {
        documentIds,
      });

      // Extract content from chunk objects for the agent
      const rawChunks = chunkObjects.map((chunk: any) => chunk.content);

      logger.phaseComplete('loading_documents', { chunkCount: rawChunks.length });

      // Validate and pack chunks
      const validatedChunks = validateChunks(rawChunks);
      const packedChunks = packChunks(validatedChunks, CONFIG.MAP_CHUNK_SIZE_TOKENS);

      console.log(`[ReportJob] Packed ${rawChunks.length} chunks into ${packedChunks.length} map tasks`);

      if (packedChunks.length === 0) {
        throw new Error('No valid chunks to process');
      }

      // Initialize map phase metadata
      await ctx.runMutation(internal.jobs.helpers.initReportMapPhase, {
        reportId,
        totalMapTasks: packedChunks.length,
        reportType: reportType || 'summary',
        customPrompt,
      });

      // Schedule each map task as a separate action - pass chunk directly to avoid race conditions
      for (let i = 0; i < packedChunks.length; i++) {
        await ctx.scheduler.runAfter(0, internal.jobs.ReportGenerationJob.processReportMapChunk, {
          reportId,
          userId,
          notebookId,
          chunkIndex: i,
          totalChunks: packedChunks.length,
          chunk: packedChunks[i], // Pass chunk directly instead of storing in metadata
          reportType: reportType || 'summary',
          customPrompt,
        });
        console.log(`[ReportJob] Scheduled map task ${i + 1}/${packedChunks.length}`);
      }

      logger.info('Map phase initialized', {
        totalMapTasks: packedChunks.length,
        chunkSizes: packedChunks.map(c => c.length),
      });

    } catch (error) {
      const errorMeta = createErrorMetadata(error, 'initializing');

      logger.jobError(error, {
        phase: 'initializing',
        errorType: errorMeta.type,
        retryable: errorMeta.retryable,
      });

      await ctx.runMutation(internal.jobs.helpers.markReportFailed, {
        reportId,
        error: errorMeta.message,
        metadata: {
          phase: 'failed',
          errorPhase: 'initializing',
          errorType: errorMeta.type,
          retryable: errorMeta.retryable,
          failedAt: Date.now(),
        },
      });

      throw error;
    }
  },
});

// ============================================================
// PHASE 2: Process Individual Map Chunk
// ============================================================

export const processReportMapChunk = internalAction({
  args: {
    reportId: v.id('reports'),
    userId: v.string(),
    notebookId: v.id('notebooks'),
    chunkIndex: v.number(),
    totalChunks: v.number(),
    chunk: v.string(), // Chunk content passed directly
    reportType: v.string(),
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";

    const { reportId, userId, notebookId, chunkIndex, totalChunks, chunk, reportType, customPrompt } = args;

    const logger = createJobLogger({
      jobType: 'report',
      jobId: reportId,
      notebookId,
      userId,
    });

    const chunkId = `[Chunk ${chunkIndex + 1}/${totalChunks}]`;
    console.log(`[ReportJob] ${chunkId} Starting map processing`);

    try {
      // Check if report still exists
      const report = await ctx.runQuery(internal.reports.getInternal, { id: reportId });
      if (!report) {
        console.log(`[ReportJob] ${chunkId} Report deleted, skipping`);
        return;
      }

      // Process with LLM using structured output
      const llm = createMapLLM();
      const structuredLLM = createStructuredLLM(llm, MapOutputSchema);

      const promptTemplate = MAP_PROMPTS[reportType] || MAP_PROMPTS['custom'];
      const prompt = promptTemplate
        .replace('{chunk}', chunk)
        .replace('{customPrompt}', customPrompt ? sanitizeUserInput(customPrompt) : '');

      const structuredPrompt = `${prompt}

IMPORTANT: Respond with a JSON object containing:
1. "topics": An array of 3-5 key topics this section covers
2. "summary": The complete structured summary as described above`;

      console.log(`[ReportJob] ${chunkId} Calling LLM (${prompt.length} chars)`);

      const startTime = Date.now();
      const mapOutput = await structuredLLM.invoke([
        new SystemMessage(MAP_SYSTEM_PROMPT),
        new HumanMessage(structuredPrompt),
      ]);

      const elapsed = Date.now() - startTime;
      console.log(`[ReportJob] ${chunkId} LLM completed in ${elapsed}ms`);

      // Store result
      const result = {
        topics: mapOutput.topics,
        summary: mapOutput.summary,
        processingTimeMs: elapsed,
      };

      await ctx.runMutation(internal.jobs.helpers.storeReportMapResult, {
        reportId,
        chunkIndex,
        result: JSON.stringify(result),
      });

      logger.info(`Map chunk completed`, {
        chunkIndex,
        elapsed,
        topics: mapOutput.topics,
      });

      // Check if all maps are complete
      const updatedReport = await ctx.runQuery(internal.reports.getInternal, { id: reportId });
      if (!updatedReport) return;

      const completedMaps = updatedReport.metadata?.mapResults
        ? Object.keys(updatedReport.metadata.mapResults).length
        : 0;
      const totalMaps = updatedReport.metadata?.totalMapTasks || totalChunks;

      console.log(`[ReportJob] Map progress: ${completedMaps}/${totalMaps}`);

      if (completedMaps >= totalMaps) {
        console.log(`[ReportJob] All map tasks complete, scheduling finalization`);
        // All maps done - schedule finalization
        await ctx.scheduler.runAfter(0, internal.jobs.ReportGenerationJob.finalizeReportPhase, {
          reportId,
          userId,
          notebookId,
          reportType,
          customPrompt,
        });
      }

    } catch (error) {
      const errorMeta = createErrorMetadata(error, 'map_processing');
      const elapsed = Date.now();

      console.error(`[ReportJob] ${chunkId} FAILED:`, errorMeta.message);

      // Store error result
      await ctx.runMutation(internal.jobs.helpers.storeReportMapResult, {
        reportId,
        chunkIndex,
        result: JSON.stringify({
          _error: true,
          errorMessage: errorMeta.message,
          isTimeout: errorMeta.type === 'llm_timeout',
        }),
      });

      logger.warn(`Map chunk failed`, {
        chunkIndex,
        error: errorMeta.message,
        errorType: errorMeta.type,
      });

      // Check if we should still proceed with partial results
      const report = await ctx.runQuery(internal.reports.getInternal, { id: reportId });
      if (!report) return;

      const completedMaps = report.metadata?.mapResults
        ? Object.keys(report.metadata.mapResults).length
        : 0;
      const totalMaps = report.metadata?.totalMapTasks || totalChunks;
      const failedMaps = report.metadata?.mapResults
        ? Object.values(report.metadata.mapResults).filter(
            (r: any) => JSON.parse(r as string)?._error
          ).length
        : 0;

      // If all tasks have completed (success or failure), proceed to finalization
      if (completedMaps >= totalMaps) {
        const successCount = totalMaps - failedMaps;
        console.log(`[ReportJob] All tasks done. Success: ${successCount}/${totalMaps}`);

        if (successCount > 0) {
          // Proceed with partial results
          await ctx.scheduler.runAfter(0, internal.jobs.ReportGenerationJob.finalizeReportPhase, {
            reportId,
            userId,
            notebookId,
            reportType,
            customPrompt,
          });
        } else {
          // All failed - mark report as failed
          await ctx.runMutation(internal.jobs.helpers.markReportFailed, {
            reportId,
            error: 'All map tasks failed',
            metadata: {
              phase: 'failed',
              errorPhase: 'map_processing',
              errorType: 'llm_failure',
              failedAt: Date.now(),
            },
          });
        }
      }
    }
  },
});

// ============================================================
// PHASE 3: Finalize (Collapse + Reduce + Save)
// ============================================================

export const finalizeReportPhase = internalAction({
  args: {
    reportId: v.id('reports'),
    userId: v.string(),
    notebookId: v.id('notebooks'),
    reportType: v.string(),
    customPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";

    const { reportId, userId, notebookId, reportType, customPrompt } = args;

    const logger = createJobLogger({
      jobType: 'report',
      jobId: reportId,
      notebookId,
      userId,
    });

    logger.info('Starting finalization phase');

    try {
      // Get report with map results
      const report = await ctx.runQuery(internal.reports.getInternal, { id: reportId });
      if (!report) {
        console.log('[ReportJob] Report deleted during finalization');
        return;
      }

      const mapResults = report.metadata?.mapResults as Record<string, string> || {};

      // Separate successful and failed results
      const successfulResults: string[] = [];
      const failedCount = { count: 0 };

      for (const [idx, resultJson] of Object.entries(mapResults)) {
        try {
          const parsed = JSON.parse(resultJson);
          if (parsed._error) {
            failedCount.count++;
          } else {
            successfulResults.push(parsed.summary);
          }
        } catch {
          failedCount.count++;
        }
      }

      console.log(`[ReportJob] Finalization: ${successfulResults.length} successful, ${failedCount.count} failed`);

      if (successfulResults.length === 0) {
        throw new Error('No successful map results to process');
      }

      // Update status
      await ctx.runMutation(internal.jobs.helpers.updateReportStatus, {
        reportId,
        status: 'generating',
        metadata: {
          phase: 'collapsing',
          progress: 60,
          currentStep: 'Synthesizing content...',
        },
      });

      // Collapse: just combine summaries (skip LLM collapse for speed)
      const combinedContent = successfulResults.join('\n\n---\n\n');
      console.log(`[ReportJob] Combined content: ${combinedContent.length} chars`);

      // Update to reduce phase
      await ctx.runMutation(internal.jobs.helpers.updateReportStatus, {
        reportId,
        status: 'generating',
        metadata: {
          phase: 'reducing',
          progress: 70,
          currentStep: 'Generating final report...',
        },
      });

      // Reduce phase with LLM
      const llm = createReduceLLM();
      let promptTemplate = REDUCE_PROMPTS[reportType] || REDUCE_PROMPTS['custom'];

      const prompt = promptTemplate
        .replace('{content}', combinedContent)
        .replace('{customPrompt}', customPrompt ? sanitizeUserInput(customPrompt) : '');

      console.log(`[ReportJob] Reduce prompt: ${prompt.length} chars`);

      const startTime = Date.now();
      // Use 'as any' to avoid type compatibility issues with ChatTogetherAICallOptions
      const response = await (llm as any).invoke([
        new SystemMessage(REDUCE_SYSTEM_PROMPT),
        new HumanMessage(prompt),
      ]);

      const elapsed = Date.now() - startTime;
      const content = typeof response.content === 'string'
        ? response.content
        : String(response.content);

      console.log(`[ReportJob] Reduce completed in ${elapsed}ms, output: ${content.length} chars`);

      // Generate title
      let title = 'Report';
      try {
        title = await ctx.runAction(internal.titleGenerator.generateTitle, {
          chunk: combinedContent.substring(0, 2000),
        });
      } catch (e) {
        console.log('[ReportJob] Title generation failed, using default');
      }

      // Save results
      await ctx.runMutation(internal.jobs.helpers.saveReportResults, {
        reportId,
        content,
        metadata: {
          title,
          phase: 'completed',
          progress: 100,
          completedAt: Date.now(),
          mapSuccessCount: successfulResults.length,
          mapFailedCount: failedCount.count,
        },
      });

      // Clear intermediate data
      await ctx.runMutation(internal.jobs.helpers.clearReportMapData, { reportId });

      logger.jobComplete({
        contentLength: content.length,
        title,
        mapSuccess: successfulResults.length,
        mapFailed: failedCount.count,
      });

    } catch (error) {
      const errorMeta = createErrorMetadata(error, 'finalization');

      logger.jobError(error, {
        phase: 'finalization',
        errorType: errorMeta.type,
        retryable: errorMeta.retryable,
      });

      await ctx.runMutation(internal.jobs.helpers.markReportFailed, {
        reportId,
        error: errorMeta.message,
        metadata: {
          phase: 'failed',
          errorPhase: 'finalization',
          errorType: errorMeta.type,
          retryable: errorMeta.retryable,
          failedAt: Date.now(),
        },
      });

      throw error;
    }
  },
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function sanitizeUserInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\{.*?\}/g, '')
    .replace(/<\|.*?\|>/g, '')
    .trim()
    .substring(0, 5000);
}
