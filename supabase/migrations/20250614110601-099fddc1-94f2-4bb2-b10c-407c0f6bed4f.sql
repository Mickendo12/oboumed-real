
-- Add access_key column to qr_codes table
ALTER TABLE public.qr_codes 
ADD COLUMN access_key text UNIQUE;

-- Update existing rows to have a unique access_key
UPDATE public.qr_codes 
SET access_key = UPPER(SUBSTRING(MD5(RANDOM()::text), 1, 12)) 
WHERE access_key IS NULL;

-- Make access_key required for new rows
ALTER TABLE public.qr_codes 
ALTER COLUMN access_key SET NOT NULL;
