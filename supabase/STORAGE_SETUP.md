# Supabase Storage Setup

## Create Receipts Bucket

Run this in Supabase SQL Editor or via Storage UI:

### Option 1: Via Supabase Dashboard

1. Go to Storage in your Supabase project
2. Click "New bucket"
3. Name: `receipts`
4. Public bucket: ✅ Enabled
5. Click "Create bucket"

### Option 2: Via SQL

```sql
-- Create the receipts bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to files
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'receipts');

-- Allow service role to upload files
CREATE POLICY "Service role upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'receipts');
```

## Verify Setup

After creating the bucket, uploaded images will be accessible at:

```
https://<project-ref>.supabase.co/storage/v1/object/public/receipts/<filename>
```
