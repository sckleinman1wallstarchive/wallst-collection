-- Add size preset and display order to about_us_content for layout control
ALTER TABLE about_us_content ADD COLUMN IF NOT EXISTS size_preset TEXT DEFAULT 'wide';
ALTER TABLE about_us_content ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;