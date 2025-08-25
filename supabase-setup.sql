-- Configuration du bucket "medias" pour Supabase Storage
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Créer le bucket "medias" s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('medias', 'medias', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Activer RLS sur le bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour permettre l'insertion de fichiers (upload)
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'medias' 
  AND auth.role() = 'authenticated'
);

-- 4. Politique pour permettre la lecture de fichiers (accès public)
CREATE POLICY "Allow public read access to medias bucket" ON storage.objects
FOR SELECT USING (
  bucket_id = 'medias'
);

-- 5. Politique pour permettre la mise à jour de fichiers
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'medias' 
  AND auth.role() = 'authenticated'
);

-- 6. Politique pour permettre la suppression de fichiers
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'medias' 
  AND auth.role() = 'authenticated'
);

-- 7. Politique alternative plus permissive pour les tests (à utiliser si les politiques ci-dessus ne fonctionnent pas)
-- DÉCOMMENTEZ LES LIGNES CI-DESSOUS SI VOUS AVEZ DES PROBLÈMES D'ACCÈS

/*
-- Politique très permissive pour les tests
CREATE POLICY "Allow all operations on medias bucket" ON storage.objects
FOR ALL USING (
  bucket_id = 'medias'
);
*/ 