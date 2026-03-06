-- Clear all data from inspirations table
DELETE FROM inspirations;

-- Clear all files from storage uploads bucket
DELETE FROM storage.objects WHERE bucket_id = 'uploads';
