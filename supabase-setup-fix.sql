-- Configuration corrigée pour Supabase Storage
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Vérifier que le bucket "medias" existe et est public
INSERT INTO storage.buckets (id, name, public)
VALUES ('medias', 'medias', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  name = 'medias';

-- 2. Supprimer les anciennes politiques si elles existent (pour éviter les conflits)
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to medias bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow all operations on medias bucket" ON storage.objects;

-- 3. Activer RLS sur storage.objects (si pas déjà fait)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique permissive pour le bucket "medias" (solution recommandée)
CREATE POLICY "Allow all operations on medias bucket" ON storage.objects
FOR ALL USING (
  bucket_id = 'medias'
);

-- 5. Alternative : Politiques spécifiques (décommentez si vous préférez)
/*
-- Politique pour l'insertion (upload)
CREATE POLICY "Allow insert on medias bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medias'
);

-- Politique pour la lecture (accès public)
CREATE POLICY "Allow select on medias bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medias'
);

-- Politique pour la mise à jour
CREATE POLICY "Allow update on medias bucket" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'medias'
);

-- Politique pour la suppression
CREATE POLICY "Allow delete on medias bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'medias'
);
*/

-- 6. Vérification
SELECT 
  bucket_id,
  name,
  owner,
  created_at
FROM storage.objects 
WHERE bucket_id = 'medias' 
LIMIT 5; 