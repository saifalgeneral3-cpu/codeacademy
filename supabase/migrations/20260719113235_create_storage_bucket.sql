/*
# Create course-media storage bucket

Creates a public storage bucket named `course-media` for uploading course thumbnails,
covers, lesson videos, PDFs, and ZIP source code. Public read so anon users can view
videos/resources; writes are restricted to authenticated users (admin enforced in app).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('course-media', 'course-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for everyone
DROP POLICY IF EXISTS "course_media_public_read" ON storage.objects;
CREATE POLICY "course_media_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'course-media');

-- Authenticated can upload (admin gating handled in the app via profile.role check)
DROP POLICY IF EXISTS "course_media_auth_insert" ON storage.objects;
CREATE POLICY "course_media_auth_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'course-media');

DROP POLICY IF EXISTS "course_media_auth_update" ON storage.objects;
CREATE POLICY "course_media_auth_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'course-media');

DROP POLICY IF EXISTS "course_media_auth_delete" ON storage.objects;
CREATE POLICY "course_media_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'course-media');
