ALTER TABLE transcripts
ADD COLUMN segments JSONB DEFAULT '[]'::jsonb;
