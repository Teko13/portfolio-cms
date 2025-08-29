-- Script de configuration pour la table loisirs
-- À exécuter dans l'éditeur SQL de Supabase

-- Création de la table loisires
CREATE TABLE IF NOT EXISTS loisires (
    id BIGSERIAL PRIMARY KEY,
    description TEXT NOT NULL
);

-- Ajout de commentaires pour documenter la table
COMMENT ON TABLE loisires IS 'Table pour stocker les loisirs et centres d''intérêt';
COMMENT ON COLUMN loisires.id IS 'Identifiant unique du loisir';
COMMENT ON COLUMN loisires.description IS 'Description du loisir ou centre d''intérêt';

-- Politique RLS pour permettre l'accès complet (à ajuster selon vos besoins)
ALTER TABLE loisirs ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (pour le service role)
CREATE POLICY "Allow all operations for service role" ON loisires
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique pour permettre la lecture publique (optionnel)
CREATE POLICY "Allow public read access" ON loisires
    FOR SELECT
    USING (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_loisires_description ON loisires(description);

-- Exemple d'insertion de données de test (optionnel)
-- INSERT INTO loisires (description) VALUES 
--     ('Lecture de science-fiction'),
--     ('Randonnée en montagne'),
--     ('Cuisine italienne'),
--     ('Photographie de paysage'),
--     ('Jeux vidéo stratégiques');
