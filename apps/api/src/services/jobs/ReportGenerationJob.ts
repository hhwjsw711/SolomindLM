import { supabase } from '../../config/database.js';
import { ReportGenerationService } from '../generation/ReportGenerationService.js';

export interface ReportGenerationJobPayload {
  reportId: string;  // This is the note/report ID
  userId: string;
  noteId: string;    // This is the notebook ID
  documentIds: string[];
  reportType: string;
  customPrompt?: string;
}

// Graphile Worker task handler
export async function reportGenerationJob(payload: ReportGenerationJobPayload) {
  const { reportId, userId, noteId, documentIds, reportType, customPrompt } = payload;

  console.log(`[ReportGeneration] Processing report ${reportId} of type ${reportType}`);

  try {
    // Update status to generating - use reportId (the note ID)
    await supabase
      .from('notes')
      .update({ status: 'generating' })
      .eq('id', reportId);

    // Initialize service
    const service = new ReportGenerationService();

    // Status update callback - use reportId (the note ID)
    const onStatusUpdate = async (status: string) => {
      console.log(`[ReportGeneration] Status update: ${status}`);
      await service.updateReportStatus(reportId, status, {
        phase: status,
        updatedAt: new Date().toISOString(),
      });
    };

    // Generate report
    const result = await service.generateReport({
      documentIds,
      reportType,
      customPrompt,
      onStatusUpdate,
    });

    // Generate AI-powered title from report content
    const title = await service.generateTitleFromContent(result.content);

    // Save report - use reportId (the note ID)
    await service.saveReport({
      noteId: reportId,  // Use reportId as the note ID
      title,
      content: result.content,
      reportType,
      metadata: {
        ...result.metadata,
        phase: 'completed',
        generatedAt: new Date().toISOString(),
      },
    });

    console.log(`[ReportGeneration] Report ${reportId} processed successfully`);
  } catch (error) {
    console.error(`[ReportGeneration] Error processing report ${reportId}:`, error);

    // Update failed status - use reportId (the note ID)
    await supabase
      .from('notes')
      .update({
        status: 'failed',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          phase: 'failed',
          failedAt: new Date().toISOString(),
        },
      })
      .eq('id', reportId);

    throw error; // Re-throw so Graphile Worker knows it failed
  }
}
