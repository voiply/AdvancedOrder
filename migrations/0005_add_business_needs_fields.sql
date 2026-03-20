-- Add business needs fields from step 2
ALTER TABLE sessions ADD COLUMN call_method TEXT;
ALTER TABLE sessions ADD COLUMN num_locations TEXT;
ALTER TABLE sessions ADD COLUMN high_call_volume TEXT;
ALTER TABLE sessions ADD COLUMN need_call_recording TEXT;
