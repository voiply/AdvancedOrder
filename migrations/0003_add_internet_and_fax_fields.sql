-- Add online fax and internet service fields
ALTER TABLE sessions ADD COLUMN online_fax INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN has_internet INTEGER;
ALTER TABLE sessions ADD COLUMN add_internet_package INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN internet_package TEXT DEFAULT 'phone-only';
ALTER TABLE sessions ADD COLUMN internet_device TEXT DEFAULT 'rental';
