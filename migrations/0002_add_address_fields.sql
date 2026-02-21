-- Add individual address fields
ALTER TABLE sessions ADD COLUMN street TEXT;
ALTER TABLE sessions ADD COLUMN city TEXT;
ALTER TABLE sessions ADD COLUMN state TEXT;
ALTER TABLE sessions ADD COLUMN zip_code TEXT;

-- Add individual billing address fields
ALTER TABLE sessions ADD COLUMN billing_street TEXT;
ALTER TABLE sessions ADD COLUMN billing_city TEXT;
ALTER TABLE sessions ADD COLUMN billing_state TEXT;
ALTER TABLE sessions ADD COLUMN billing_zip_code TEXT;
