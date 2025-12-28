import { Router, Request, Response } from 'express';
import { supabase } from '../config/database.js';

const router = Router();

// GET /api/notebooks/:notebookId/notes - Get all notes (reports + user notes) for a notebook
router.get('/notebooks/:notebookId/notes', async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Only fetch reports and text notes (other types like audio, quiz, flashcards will have their own tables)
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('notebook_id', notebookId)
      .eq('user_id', userId)
      .in('note_type', ['report', 'text'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Notes] Error fetching notes:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }

    return res.json(notes || []);
  } catch (error) {
    console.error('[Notes] Error fetching notes:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch notes',
    });
  }
});

// GET /api/notes/:id - Get a single note by ID
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
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json(note);
  } catch (error) {
    console.error('[Notes] Error fetching note:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch note',
    });
  }
});

// PATCH /api/notes/:id - Update a note (e.g., rename)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId as string;
    const { title } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    // Verify user owns the note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: updatedNote, error: updateError } = await supabase
      .from('notes')
      .update({ title })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[Notes] Error updating note:', updateError);
      return res.status(500).json({ error: 'Failed to update note' });
    }

    return res.json(updatedNote);
  } catch (error) {
    console.error('[Notes] Error updating note:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update note',
    });
  }
});

// DELETE /api/notes/:id - Delete a note
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
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Notes] Error deleting note:', deleteError);
      return res.status(500).json({ error: 'Failed to delete note' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[Notes] Error deleting note:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to delete note',
    });
  }
});

export default router;
