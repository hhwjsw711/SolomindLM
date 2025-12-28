import { Router, Request, Response } from 'express';
import { supabase } from '../config/database.js';
import { pgPool } from '../config/worker.js';
import { ReportGenerationService } from '../services/generation/ReportGenerationService.js';

const router = Router();
const reportService = new ReportGenerationService();

// Helper function to add a job to Graphile Worker
async function addReportJob(payload: any) {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `SELECT graphile_worker.add_job($1::text, $2::text::json)`,
      ['reportGeneration', JSON.stringify(payload)]
    );
    console.log(`[Reports] Successfully added reportGeneration job with ID: ${payload.reportId}`);
  } catch (error) {
    console.error(`[Reports] Failed to add reportGeneration job:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// POST /api/reports - Create report and queue job
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, noteId, documentIds, reportType, customPrompt } = req.body;

    console.log(`[Reports] Creating report:`, { userId, noteId, reportType, documentIds });

    // Validation
    if (!userId || !noteId) {
      return res.status(400).json({ error: 'userId and noteId are required' });
    }

    if (!reportType) {
      return res.status(400).json({ error: 'reportType is required' });
    }

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'At least one documentId is required' });
    }

    // Verify user owns the notebook
    const { data: notebook, error: notebookError } = await supabase
      .from('notebooks')
      .select('user_id')
      .eq('id', noteId)
      .single();

    if (notebookError || !notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }

    if (notebook.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate a unique report ID
    const reportId = crypto.randomUUID();

    // Create note entry with generating status
    const title = reportService.getReportTitle(reportType);
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        id: reportId,
        user_id: userId,
        notebook_id: noteId,
        title,
        content: '',
        note_type: 'report',
        status: 'generating',
        metadata: {
          reportType,
          documentIds,
          phase: 'generating',
          createdAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (noteError || !note) {
      console.error('[Reports] Error creating note:', noteError);
      return res.status(500).json({ error: 'Failed to create report note' });
    }

    // Queue the report generation job
    await addReportJob({
      reportId,
      userId,
      noteId,
      documentIds,
      reportType,
      customPrompt,
    });

    return res.status(201).json({
      reportId,
      status: 'generating',
      note,
    });
  } catch (error) {
    console.error('[Reports] Error creating report:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create report',
    });
  }
});

// GET /api/reports/:id - Get report status and content
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !note) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      id: note.id,
      title: note.title,
      content: note.content,
      status: note.status,
      metadata: note.metadata,
      created_at: note.created_at,
      updated_at: note.updated_at,
    });
  } catch (error) {
    console.error('[Reports] Error fetching report:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch report',
    });
  }
});

// GET /api/reports/notebook/:noteId - Get all reports for a notebook
router.get('/notebook/:noteId', async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('notebook_id', noteId)
      .eq('user_id', userId)
      .eq('note_type', 'report')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Reports] Error fetching reports:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    return res.json(notes || []);
  } catch (error) {
    console.error('[Reports] Error fetching reports:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch reports',
    });
  }
});

// DELETE /api/reports/:id - Delete a report
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Verify user owns the note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Reports] Error deleting report:', deleteError);
      return res.status(500).json({ error: 'Failed to delete report' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[Reports] Error deleting report:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete report',
    });
  }
});

export default router;
