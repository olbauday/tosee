-- Create storage bucket for inventory photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-photos', 'inventory-photos', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'inventory-photos'
  );

CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'inventory-photos');

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (
    auth.uid()::text = (storage.foldername(name))[1] AND
    bucket_id = 'inventory-photos'
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    auth.uid()::text = (storage.foldername(name))[1] AND
    bucket_id = 'inventory-photos'
  );