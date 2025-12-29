import { supabase } from '../../config/database.js';
import { MindMapGenerationService } from '../generation/MindMapGenerationService.js';

export interface MindMapGenerationJobPayload {
  mindMapId: string;
  userId: string;
  notebookId: string;
  documentIds: string[];
}

// Graphile Worker task handler
export async function mindMapGenerationJob(payload: MindMapGenerationJobPayload) {
  const { mindMapId, userId, notebookId, documentIds } = payload;

  console.log(`[MindMapGeneration] Processing mind map ${mindMapId}`);

  try {
    // Update status to generating
    await supabase
      .from('mindmaps')
      .update({ status: 'generating' })
      .eq('id', mindMapId);

    // Initialize service
    const service = new MindMapGenerationService();

    // Status update callback
    const onStatusUpdate = async (status: string) => {
      console.log(`[MindMapGeneration] Status update: ${status}`);
      await service.updateMindMapStatus(mindMapId, status, {
        phase: status,
        updatedAt: new Date().toISOString(),
      });
    };

    // Generate mind map
    const result = await service.generateMindMap({
      documentIds,
      onStatusUpdate,
    });

    // Generate AI-powered title from mind map content
    const title = await service.generateTitleFromContent(result.data);

    // Save mind map
    await service.saveMindMap({
      mindMapId,
      title,
      data: result.data,
      metadata: {
        ...result.metadata,
        phase: 'completed',
        generatedAt: new Date().toISOString(),
      },
    });

    console.log(`[MindMapGeneration] Mind map ${mindMapId} processed successfully`);
  } catch (error) {
    console.error(`[MindMapGeneration] Error processing mind map ${mindMapId}:`, error);

    // Update failed status
    await supabase
      .from('mindmaps')
      .update({
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          phase: 'failed',
          failedAt: new Date().toISOString(),
        },
      })
      .eq('id', mindMapId);

    throw error; // Re-throw so Graphile Worker knows it failed
  }
}
