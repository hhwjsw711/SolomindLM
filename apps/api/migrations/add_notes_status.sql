-- Add status column to notes table for report generation
ALTER TABLE notes
ADD COLUMN status TEXT DEFAULT 'completed'
CHECK (status IN ('generating', 'mapping', 'collapsing', 'reducing', 'completed', 'failed'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
