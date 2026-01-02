import { supabase } from '../../config/database.js';
import { AudioOverviewGenerationService } from '../generation/AudioOverviewGenerationService.js';

export interface AudioOverviewGenerationJobPayload {
  audioOverviewId: string;
  userId: string;
  notebookId: string;
  documentIds: string[];
  audioType: string;
  length: string;
  focus?: string;
  attempt?: number;
}

// Graphile Worker task handler
export async function audioOverviewGenerationJob(
  payload: AudioOverviewGenerationJobPayload,
  helpers?: { addJob: (identifier: string, payload: unknown, options?: { runAt: Date }) => void }
) {
  const { audioOverviewId, userId: _userId, notebookId: _notebookId, documentIds, audioType, length, focus, attempt = 0 } = payload;

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'AudioOverviewGeneration',
    action: 'process_job',
    audioOverviewId,
    audioType,
    length,
    attempt,
  }));

  const maxRetries = 3;

  try {
    // Update status to generating
    await supabase
      .from('audio_overviews')
      .update({ status: 'generating' })
      .eq('id', audioOverviewId);

    // Initialize service
    const service = new AudioOverviewGenerationService();

    // Status update callback
    // Note: For audio_overviews, intermediate statuses (mapping, reducing, synthesizing) are stored in metadata.phase
    // The database status field only accepts: draft, generating, completed, failed
    const onStatusUpdate = async (status: string) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        service: 'AudioOverviewGeneration',
        action: 'status_update',
        audioOverviewId,
        status,
      }));

      // For audio_overviews, intermediate processing statuses go in metadata.phase only
      // The status field stays as 'generating' until completion
      const validStatuses = ['generating', 'completed', 'failed'];
      const dbStatus = validStatuses.includes(status) ? status : 'generating';

      await service.updateAudioOverviewStatus(audioOverviewId, dbStatus, {
        phase: status,
        updatedAt: new Date().toISOString(),
      });
    };

    // Generate audio overview with timeout (10 minutes)
    const result = await withTimeout(
      service.generateAudioOverview({
        documentIds,
        audioType,
        length,
        focus,
        onStatusUpdate,
      }),
      600000, // 10 minutes total timeout (longer for audio synthesis)
      'Audio overview generation timed out'
    );

    // Upload audio to Supabase Storage
    onStatusUpdate('uploading');
    const audioUrl = await service.uploadAudio(result.audioBuffer, audioOverviewId);

    // Generate AI-powered title from transcript
    const title = await service.generateTitle(result.transcript);

    // Save audio overview
    await service.saveAudioOverview(audioOverviewId, {
      title,
      transcript: result.transcript,
      audio_url: audioUrl,
      status: 'completed',
      metadata: {
        ...result.metadata,
        phase: 'completed',
        generatedAt: new Date().toISOString(),
      },
    });

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'AudioOverviewGeneration',
      action: 'job_complete',
      audioOverviewId,
      transcriptLength: result.transcript.length,
      audioSize: result.audioBuffer.length,
    }));
  } catch (error) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'AudioOverviewGeneration',
      action: 'job_error',
      audioOverviewId,
      error: error instanceof Error ? error.message : 'Unknown error',
      attempt,
      maxRetries,
    }));

    // Retry logic with exponential backoff
    if (attempt < maxRetries && helpers?.addJob) {
      try {
        const backoffDelay = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
        const retryAt = new Date(Date.now() + backoffDelay);

        helpers.addJob(
          'audioOverviewGeneration',
          { ...payload, attempt: attempt + 1 },
          { runAt: retryAt }
        );

        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          service: 'AudioOverviewGeneration',
          action: 'job_retry_scheduled',
          audioOverviewId,
          nextAttempt: attempt + 1,
          retryAt,
        }));
        return; // Don't throw, we'll retry
      } catch (addError) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          service: 'AudioOverviewGeneration',
          action: 'job_retry_failed',
          audioOverviewId,
          error: addError instanceof Error ? addError.message : 'Unknown error',
        }));
        // Fall through to mark as failed
      }
    }

    // Update failed status
    await supabase
      .from('audio_overviews')
      .update({
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          phase: 'failed',
          failedAt: new Date().toISOString(),
          attempts: attempt + 1,
        },
      })
      .eq('id', audioOverviewId);

    throw error; // Re-throw so Graphile Worker knows it failed
  }
}

// Timeout wrapper for async operations
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}
