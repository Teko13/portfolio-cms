-- Script de mise à jour pour ajouter la colonne index à la table projet
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajouter la colonne index à la table projet existante
ALTER TABLE projet ADD COLUMN IF NOT EXISTS index INTEGER;

-- Mettre à jour les index existants basés sur l'ordre de création
UPDATE projet 
SET index = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY cree_le ASC) as row_num 
  FROM projet
) AS subquery 
WHERE projet.id = subquery.id;

-- Rendre la colonne index NOT NULL après avoir mis à jour les données existantes
ALTER TABLE projet ALTER COLUMN index SET NOT NULL;

-- Ajouter un index pour améliorer les performances de tri
CREATE INDEX IF NOT EXISTS idx_projet_index ON projet(index);

-- Ajouter un commentaire pour documenter la nouvelle colonne
COMMENT ON COLUMN projet.index IS 'Ordre d''affichage des projets (1 = premier, 2 = deuxième, etc.)';

-- Vérifier que la colonne a été ajoutée correctement
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projet' AND column_name = 'index';
