-- Add selected phones JSON and num users fields
ALTER TABLE sessions ADD COLUMN selected_phones TEXT;
ALTER TABLE sessions ADD COLUMN num_users INTEGER DEFAULT 1;
