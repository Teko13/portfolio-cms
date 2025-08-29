-- Script pour ajouter la colonne titre à la table ma_gallerie
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne titre à la table ma_gallerie existante
ALTER TABLE ma_gallerie ADD COLUMN IF NOT EXISTS titre VARCHAR;

-- Ajouter un commentaire pour documenter la nouvelle colonne
COMMENT ON COLUMN ma_gallerie.titre IS 'Titre de la photo (optionnel)';

-- Vérifier que la colonne a été ajoutée correctement
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ma_gallerie' AND column_name = 'titre';
