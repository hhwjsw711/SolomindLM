import { run, makeWorkerUtils, runMigrations } from 'graphile-worker';
import { pgPool } from '../config/worker.js';
import { docEmbeddingJob, DocEmbeddingJobPayload } from '../services/jobs/DocEmbeddingJob.js';
import { reportGenerationJob, ReportGenerationJobPayload } from '../services/jobs/ReportGenerationJob.js';
import { mindMapGenerationJob, MindMapGenerationJobPayload } from '../services/jobs/MindMapGenerationJob.js';

async function startWorker() {
  console.log('[Worker] Starting Graphile Worker...');

  // Test database connection first
  try {
    const testResult = await pgPool.query('SELECT NOW() as current_time');
    console.log('[Worker] Database connection successful:', testResult.rows[0]);
  } catch (error) {
    console.error('[Worker] Database connection failed:', error);
    throw error;
  }

  // Check for pending jobs
  try {
    const jobsResult = await pgPool.query(
      'SELECT COUNT(*) as count FROM graphile_worker.jobs WHERE locked_at IS NULL'
    );
    console.log(`[Worker] Pending jobs in queue: ${jobsResult.rows[0].count}`);
  } catch (error) {
    console.error('[Worker] Failed to check jobs:', error);
  }

  // Migrate the schema first - this MUST happen before makeWorkerUtils
  try {
    console.log('[Worker] Running Graphile Worker schema migration...');
    await runMigrations({ pgPool });
    console.log('[Worker] Schema migration completed successfully');
  } catch (error) {
    console.error('[Worker] CRITICAL: Schema migration failed:', error);
    if (error instanceof Error) {
      console.error('[Worker] Migration error details:', {
        message: error.message,
        code: (error as any).code,
        detail: (error as any).detail,
      });
    }
    throw error;
  }

  // Initialize worker utilities after schema is ready
  try {
    console.log('[Worker] Initializing Graphile Worker utilities...');
    const workerUtils = await makeWorkerUtils({ pgPool });
    console.log('[Worker] Graphile Worker utilities initialized successfully');
    await workerUtils.release();
  } catch (error) {
    console.error('[Worker] CRITICAL: Failed to initialize utilities:', error);
    if (error instanceof Error) {
      console.error('[Worker] Utilities initialization error details:', {
        message: error.message,
        code: (error as any).code,
        detail: (error as any).detail,
      });
    }
    throw error;
  }

  // Run the worker with tasks defined inline
  console.log('[Worker] Starting Graphile Worker with concurrency=5, pollInterval=2000ms');
  
  try {
    // run() returns a WorkerRunner, do not await it - it needs to run in the background
    run({
      pgPool,
      concurrency: 5,
      pollInterval: 2000,
      // Define tasks directly
      taskList: {
        docEmbedding: async (payload, helpers) => {
          console.log(`[Worker] Received docEmbedding task with payload:`, JSON.stringify(payload).substring(0, 100));
          try {
            await docEmbeddingJob(payload as DocEmbeddingJobPayload);
            console.log(`[Worker] docEmbedding task completed successfully for doc ${(payload as DocEmbeddingJobPayload).documentId}`);
          } catch (error) {
            console.error(`[Worker] docEmbedding task failed:`, error);
            throw error;
          }
        },
        reportGeneration: async (payload, helpers) => {
          console.log(`[Worker] Received reportGeneration task for report ${(payload as ReportGenerationJobPayload).reportId}`);
          try {
            await reportGenerationJob(payload as ReportGenerationJobPayload);
            console.log(`[Worker] reportGeneration task completed successfully for report ${(payload as ReportGenerationJobPayload).reportId}`);
          } catch (error) {
            console.error(`[Worker] reportGeneration task failed:`, error);
            throw error;
          }
        },
        mindmapGeneration: async (payload, helpers) => {
          console.log(`[Worker] Received mindmapGeneration task for mindmap ${(payload as MindMapGenerationJobPayload).mindMapId}`);
          try {
            await mindMapGenerationJob(payload as MindMapGenerationJobPayload);
            console.log(`[Worker] mindmapGeneration task completed successfully for mindmap ${(payload as MindMapGenerationJobPayload).mindMapId}`);
          } catch (error) {
            console.error(`[Worker] mindmapGeneration task failed:`, error);
            throw error;
          }
        },
      },
    }).catch(error => {
      console.error('[Worker] CRITICAL ERROR in Graphile Worker:', error);
      process.exit(1);
    });
    
    console.log('[Worker] Graphile Worker started successfully and running in background');
    console.log('[Worker] Waiting for jobs...');
  } catch (error) {
    console.error('[Worker] CRITICAL ERROR starting Graphile Worker:', error);
    throw error;
  }
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('\nStopping Graphile Worker...');
  await pgPool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nStopping Graphile Worker...');
  await pgPool.end();
  process.exit(0);
});

startWorker().catch(console.error);
