-- Script pour ajouter la colonne category à la table projet
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne category à la table projet existante
ALTER TABLE projet ADD COLUMN IF NOT EXISTS category VARCHAR;

-- Ajouter un commentaire pour documenter la nouvelle colonne
COMMENT ON COLUMN projet.category IS 'Catégorie du projet (ex: Web, Mobile, IA, etc.)';

-- Vérifier que la colonne a été ajoutée correctement
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projet' AND column_name = 'category';
